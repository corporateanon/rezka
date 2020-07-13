import { stringify as querystringStringify } from 'querystring';
import { Node, parse as parseJS } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';
import Axios, { AxiosInstance } from 'axios';
import cheerio from 'cheerio';
import { parse as parseUrl } from 'url';
import {
    MediaFolder,
    MediaStream,
    MediaStreamMap,
    SearchResult,
    Translator,
    Episode,
    MediaReference,
    ReferenceSeriesFolder,
    Reference,
    ReferenceUrl,
    ReferenceEpisode,
} from './types';
import { parseStreamMap } from './utils';
import { basename } from 'path';

export class HdrezkaClient {
    protected http: AxiosInstance;

    constructor() {
        this.http = Axios.create();
    }

    async getSearchResults(query: string): Promise<SearchResult[]> {
        const { data: page } = await this.http.get(
            `https://rezka.ag/index.php`,
            {
                params: {
                    do: 'search',
                    subaction: 'search',
                    q: query,
                },
            }
        );
        const dom = cheerio.load(page);
        return Array.from(
            dom('.b-content__inline_item > .b-content__inline_item-link')
        )
            .map((item) => {
                const a = dom(item).children('a');
                const url = a.attr('href');

                if (!url) {
                    return null;
                }
                const div = dom(item).children('div');
                const title = a.text();
                const subtitle = div.text();
                const res: SearchResult = {
                    url,
                    title,
                    subtitle,
                };
                return res;
            })
            .filter((result): result is SearchResult => result !== null);
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

    protected parseStreamUrlFromInlineScriptTag(html: string): string | null {
        const dom = cheerio.load(html);
        const asts = Array.from(
            dom('script').filter((i, scriptTag) => {
                const source = dom(scriptTag).html() ?? '';
                return !!source.match(/initCDNMoviesEvents/);
            })
        ).map((scriptTag) => {
            return parseJS(dom(scriptTag).html() ?? '');
        });

        const urls = asts.map((ast) => this.getStreamUrlFromAST(ast));
        return urls.filter((_) => _)[0] ?? null;
    }

    protected parseTranslatorsListFromHtml(html: string): Translator[] {
        const dom = cheerio.load(html);
        const liList = Array.from(dom('#translators-list > li'));
        return liList
            .map((li) => {
                const title = dom(li).attr('title');
                const translatorId = dom(li).attr('data-translator_id');
                if (!title || !translatorId) {
                    return null;
                }
                return { id: translatorId, title } as Translator;
            })
            .filter((tr): tr is Translator => tr !== null);
    }

    protected parseEpisodesFromHtml(html: string): Episode[] {
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
                return { episodeId, seasonId, title } as Episode;
            })
            .filter((episode): episode is Episode => episode !== null);
    }

    async getMediaByReference(
        reference: ReferenceUrl | ReferenceSeriesFolder
    ): Promise<MediaFolder | MediaStream | MediaStreamMap | null> {
        if (reference.type === 'ReferenceUrl') {
            const id = this.getIdFromUrl(reference.url);
            if (!id) {
                return null;
            }

            const { data: html } = await this.http.get(reference.url);
            const streamUrl = this.parseStreamUrlFromInlineScriptTag(html);
            const translatorsList = this.parseTranslatorsListFromHtml(html);
            const episodesList = this.parseEpisodesFromHtml(html);

            if (translatorsList.length) {
                const items = translatorsList.map(
                    (translator): MediaReference<ReferenceSeriesFolder> => ({
                        type: 'reference',
                        title: translator.title,
                        ref: {
                            type: 'ReferenceSeriesFolder',
                            translatorId: translator.id,
                            id,
                        },
                    })
                );
                const mediaFolder: MediaFolder = {
                    type: 'folder',
                    title: '',
                    children: items,
                };
                return mediaFolder;
            } else if (episodesList.length) {
                return this.getMediaFolderFromEpisodesList(episodesList);
            }

            if (streamUrl) {
                const streamMap = parseStreamMap(streamUrl);
                return {
                    type: 'streamMap',
                    items: streamMap,
                };
            }

            return null;
        }
        if (reference.type === 'ReferenceSeriesFolder') {
            const { id, translatorId } = reference;
            const episodes = await this.getEpisodesList(id, translatorId);
            if (episodes.length) {
                return this.getMediaFolderFromEpisodesList(episodes);
            }
            return null;
        }
        return null;
    }

    protected getMediaFolderFromEpisodesList(episodes: Episode[]): MediaFolder {
        const episodeReferences = episodes.map((episode) => {
            const ref: ReferenceEpisode = {
                type: 'ReferenceEpisode',
                episode,
            };
            const mediaRef: MediaReference<ReferenceEpisode> = {
                type: 'reference',
                ref,
                title: episode.title,
            };
            return mediaRef;
        });
        const folder: MediaFolder = {
            type: 'folder',
            children: episodeReferences,
            title: '',
        };
        return folder;
    }

    protected async getEpisodesList(
        id: string,
        translatorId: string
    ): Promise<Episode[]> {
        const {
            data: { episodes: html },
        } = await this.http.post(
            'https://rezka.ag/ajax/get_cdn_series/',
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
        return this.parseEpisodesFromHtml(html);
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
