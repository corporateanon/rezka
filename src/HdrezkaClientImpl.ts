import { Node, parse as parseJS } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import Axios, { AxiosInstance } from 'axios';
import cheerio from 'cheerio';
import { basename } from 'path';
import { stringify as querystringStringify } from 'querystring';
import { parse as parseUrl } from 'url';
import { HdrezkaClient } from './HdrezkaClient';
import {
    Episode,
    Media,
    MediaFolder,
    MediaReference,
    MediaStreamMap,
    Reference,
    ReferenceEpisode,
    ReferenceSearchResult,
    SearchResult,
    Translator,
    StreamMap,
    MediaFolderKind,
    ReferenceTranslator,
} from './types';
import { parseStreamMap } from './utils';
import { SocksProxyAgent } from 'socks-proxy-agent';

interface HdrezkaClientImplOptions {
    //SOCKSv5 proxy, for example: "socks5://example.com:9150"
    proxy?: string;
}

export class HdrezkaClientImpl implements HdrezkaClient {
    protected http: AxiosInstance;

    constructor(private options: HdrezkaClientImplOptions = {}) {
        const baseURL = 'http://hdrezka.co';

        if (this.options?.proxy) {
            const proxyAgent = new SocksProxyAgent(this.options.proxy);
            this.http = Axios.create({
                baseURL,
                httpAgent: proxyAgent,
                httpsAgent: proxyAgent,
            });
        } else {
            this.http = Axios.create({
                baseURL,
            });
        }
    }

    async getSearchResults(query: string): Promise<MediaFolder> {
        const { data: page } = await this.http.get(`/search/`, {
            params: {
                do: 'search',
                subaction: 'search',
                q: query,
            },
        });
        const dom = cheerio.load(page);
        const searchResults = Array.from(
            dom('.b-content__inline_item > .b-content__inline_item-link')
        )
            .map((item) => {
                const a = dom(item).children('a');
                const url = a.attr('href');

                if (!url) {
                    return null;
                }
                const id = this.getIdFromUrl(url);
                if (!id) {
                    return null;
                }
                const div = dom(item).children('div');
                const title = a.text();
                const subtitle = div.text();
                const res: SearchResult = {
                    id,
                    url,
                    title,
                    subtitle,
                };
                return res;
            })
            .filter((result): result is SearchResult => result !== null);
        const items = searchResults.map((searchResult) => {
            const searchResultReference: ReferenceSearchResult = {
                type: 'ReferenceSearchResult',
                searchResult,
            };

            let referenceTitle = searchResultReference.searchResult.title;
            if (searchResultReference.searchResult.subtitle) {
                referenceTitle = `${referenceTitle} — ${searchResultReference.searchResult.subtitle}`;
            }

            const referenceMedia: MediaReference = {
                type: 'MediaReference',
                ref: searchResultReference,
                title: referenceTitle,
            };
            return referenceMedia;
        });

        return {
            type: 'MediaFolder',
            kind: MediaFolderKind.SearchResultsList,
            children: items,
            title: '',
        };
    }

    async getMediaByReference(reference: Reference): Promise<Media | null> {
        if (reference.type === 'ReferenceSearchResult') {
            const id = this.getIdFromUrl(reference.searchResult.url);
            if (!id) {
                return null;
            }

            const { data: html } = await this.http.get(
                reference.searchResult.url
            );
            const {
                streamUrl,
                defaultTranslatorId,
            } = this.parseAvailableDataFromInlineScriptTag(html);
            const translatorsList = this.parseTranslatorsListFromHtml(html);
            const episodesList = this.parseEpisodesFromHtml(html, {
                id,
                translatorId: defaultTranslatorId || undefined,
            });

            // Multiple translators are suggested.
            // A folder of references to different translators should be retuned.
            if (translatorsList.length) {
                const items = translatorsList.map(
                    (translator): MediaReference => ({
                        type: 'MediaReference',
                        title: translator.title,
                        ref: {
                            type: 'ReferenceTranslator',
                            ...translator,
                            id,
                        },
                    })
                );
                const mediaFolder: MediaFolder = {
                    type: 'MediaFolder',
                    kind: MediaFolderKind.TranslationsList,
                    title: '',
                    children: items,
                };
                return mediaFolder;
            }
            if (episodesList.length) {
                // It is a series. No translators are suggested.
                // A folder with references to episodes should be returned.
                return this.getMediaFolderFromEpisodesList(episodesList);
            }

            //It is just a movie. No translators are suggested. Returning the stream.
            if (streamUrl) {
                const streamMap = parseStreamMap(streamUrl);
                return {
                    type: 'MediaStreamMap',
                    items: streamMap,
                };
            }

            return null;
        }
        if (reference.type === 'ReferenceTranslator') {
            const episodes = await this.getEpisodesList(reference);
            if (episodes.length) {
                return this.getMediaFolderFromEpisodesList(episodes);
            }

            const streamMap = await this.getStreamMapByTranslatorReference(
                reference
            );
            if (streamMap) {
                return {
                    type: 'MediaStreamMap',
                    items: streamMap,
                };
            }

            return null;
        }
        if (reference.type === 'ReferenceEpisode') {
            const stream = await this.getStreamFromEpisode(reference.episode);
            return stream;
        }
        return null;
    }

    protected getStreamUrlFromAST(ast: Node): string | null {
        let url = null;

        walkSimple(ast, {
            Property(node) {
                if ((node as any)?.key?.value !== 'streams') {
                    return;
                }
                const value = (node as any)?.value?.value;
                if (!value) {
                    return;
                }
                url = value;
            },
        });
        return url;
    }

    protected getDefaultTranslatorIdFromAST(ast: Node): string | null {
        let translatorId = null;

        walkSimple(ast, {
            CallExpression(node: any) {
                if (
                    node?.callee?.type === 'MemberExpression' &&
                    node?.callee?.property?.name === 'initCDNSeriesEvents' &&
                    node?.arguments?.[1]?.type === 'Literal' &&
                    node?.arguments?.[1]?.value
                ) {
                    translatorId = node.arguments[1].value.toString();
                }
            },
        });
        return translatorId;
    }

    protected parseAvailableDataFromInlineScriptTag(
        html: string
    ): {
        streamUrl: string | null;
        defaultTranslatorId: string | null;
    } {
        const dom = cheerio.load(html);
        const asts = Array.from(
            dom('script').filter((i, scriptTag) => {
                const source = dom(scriptTag).html() ?? '';
                return !!source.match(
                    /initCDNMoviesEvents|initCDNSeriesEvents/
                );
            })
        ).map((scriptTag) => {
            return parseJS(dom(scriptTag).html() ?? '');
        });

        const urls = asts.map((ast) => this.getStreamUrlFromAST(ast));
        const streamUrl = urls.filter((_) => _)[0] ?? null;

        const translatorIds = asts.map((ast) =>
            this.getDefaultTranslatorIdFromAST(ast)
        );
        const defaultTranslatorId = translatorIds.filter((_) => _)[0] ?? null;

        return { defaultTranslatorId, streamUrl };
    }

    protected parseTranslatorsListFromHtml(html: string): Translator[] {
        const dom = cheerio.load(html);
        const liList = Array.from(dom('#translators-list > li'));
        return liList
            .map((li) => {
                const title = dom(li).attr('title');
                const translatorId = dom(li).attr('data-translator_id');
                const isCamrip = dom(li).attr('data-camrip');
                const isAds = dom(li).attr('data-ads');
                const isDirector = dom(li).attr('data-director');
                if (!title || !translatorId) {
                    return null;
                }

                return {
                    translatorId,
                    title,
                    isAds,
                    isCamrip,
                    isDirector,
                } as Translator;
            })
            .filter((tr): tr is Translator => tr !== null);
    }

    protected parseEpisodesFromHtml(
        html: string,
        { id, translatorId }: Pick<Episode, 'id' | 'translatorId'>
    ): Episode[] {
        if (!html) {
            return [];
        }
        const dom = cheerio.load(html);
        const liList = Array.from(dom('li.b-simple_episode__item'));
        return liList
            .map((li) => {
                const title = dom(li).text();
                const seasonId = dom(li).attr('data-season_id');
                const episodeId = dom(li).attr('data-episode_id');
                if (!seasonId || !episodeId || !title) {
                    return null;
                }
                const episode: Episode = {
                    id,
                    title,
                    seasonId,
                    episodeId,
                    translatorId,
                };
                return episode;
            })
            .filter((episode): episode is Episode => episode !== null);
    }

    protected async getStreamFromEpisode(
        episode: Episode
    ): Promise<MediaStreamMap> {
        const {
            data: { url: streamsUrl },
        } = await this.http.post(
            '/ajax/get_cdn_series/',
            querystringStringify({
                action: 'get_stream',
                id: episode.id,
                translator_id: episode.translatorId,
                season: episode.seasonId,
                episode: episode.episodeId,
            }),
            {
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded; charset=UTF-8',
                },
            }
        );

        const streamMap = parseStreamMap(streamsUrl);
        const mediaStreamMap: MediaStreamMap = {
            type: 'MediaStreamMap',
            items: streamMap,
        };
        return mediaStreamMap;
    }

    protected getMediaFolderFromEpisodesList(episodes: Episode[]): MediaFolder {
        const episodeReferences = episodes.map((episode) => {
            const ref: ReferenceEpisode = {
                type: 'ReferenceEpisode',
                episode,
            };
            const mediaRef: MediaReference = {
                type: 'MediaReference',
                ref,
                title: `Season ${episode.seasonId}, Episode ${episode.episodeId}`,
            };
            return mediaRef;
        });
        const folder: MediaFolder = {
            type: 'MediaFolder',
            kind: MediaFolderKind.EpisodesList,
            children: episodeReferences,
            title: '',
        };
        return folder;
    }

    protected async getEpisodesList({
        translatorId,
        id,
    }: ReferenceTranslator): Promise<Episode[]> {
        const { data } = await this.http.post(
            '/ajax/get_cdn_series/',
            querystringStringify({
                action: 'get_episodes',
                id,
                translator_id: translatorId,
            }),
            {
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded; charset=UTF-8',
                },
            }
        );
        const { episodes: html } = data;
        return this.parseEpisodesFromHtml(html, {
            id,
            translatorId,
        });
    }

    protected async getStreamMapByTranslatorReference({
        id,
        isAds = '0',
        isCamrip = '0',
        isDirector = '0',
        translatorId,
    }: ReferenceTranslator): Promise<StreamMap | null> {
        const { data } = await this.http.post(
            '/ajax/get_cdn_series/',
            querystringStringify({
                action: 'get_movie',
                id,
                translator_id: translatorId,
                is_camrip: isCamrip,
                is_ads: isAds,
                is_director: isDirector,
            }),
            {
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded; charset=UTF-8',
                },
            }
        );
        const { url: html } = data;
        if (!html) {
            return null;
        }
        return parseStreamMap(html);
    }

    protected getIdFromUrl(urlStr: string): string | null {
        const url = parseUrl(urlStr);
        if (!url.pathname) {
            return null;
        }

        const b = basename(url.pathname);
        const [, id] = b.match(/^(\d+)\-/) || [];
        if (!id) {
            return null;
        }
        return id;
    }
}
