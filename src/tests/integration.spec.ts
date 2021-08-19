require('http-inspector/inject');
import { MediaFolder, MediaReference } from '../types';
import { createClient, stripProperties } from './utils';

describe('integration', () => {
    it('should load series with multiple translators', async () => {
        const client = createClient();

        const searchResultsFolder = await client.getSearchResults('доктор кто');
        expect(searchResultsFolder.children[0].type).toEqual('MediaReference');
        expect(searchResultsFolder).toMatchInlineSnapshot(`
            Object {
              "children": Array [
                Object {
                  "ref": Object {
                    "searchResult": Object {
                      "id": "1745",
                      "subtitle": "2005 - ..., Великобритания, Фантастика",
                      "title": "Доктор Кто",
                      "url": "http://hdrezka.co/series/fiction/1745-doktor-kto-2005.html",
                    },
                    "type": "ReferenceSearchResult",
                  },
                  "title": "Доктор Кто — 2005 - ..., Великобритания, Фантастика",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "searchResult": Object {
                      "id": "8433",
                      "subtitle": "1996, США, Комедии",
                      "title": "Доктор Кто",
                      "url": "http://hdrezka.co/films/comedy/8433-doktor-kto-1996.html",
                    },
                    "type": "ReferenceSearchResult",
                  },
                  "title": "Доктор Кто — 1996, США, Комедии",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "searchResult": Object {
                      "id": "11694",
                      "subtitle": "1963-1989, Великобритания, Приключения",
                      "title": "Доктор Кто / Классический Доктор Кто",
                      "url": "http://hdrezka.co/series/adventures/11694-doktor-kto-1963.html",
                    },
                    "type": "ReferenceSearchResult",
                  },
                  "title": "Доктор Кто / Классический Доктор Кто — 1963-1989, Великобритания, Приключения",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "searchResult": Object {
                      "id": "28853",
                      "subtitle": "2017, Великобритания, Фантастика",
                      "title": "Доктор Кто: Шада",
                      "url": "http://hdrezka.co/films/fiction/28853-doktor-kto-shada-2017.html",
                    },
                    "type": "ReferenceSearchResult",
                  },
                  "title": "Доктор Кто: Шада — 2017, Великобритания, Фантастика",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "searchResult": Object {
                      "id": "35880",
                      "subtitle": "2020, Великобритания, Приключения",
                      "title": "Доктор Кто: Безликие",
                      "url": "http://hdrezka.co/cartoons/adventures/35880-doktor-kto-bezlikie-2020.html",
                    },
                    "type": "ReferenceSearchResult",
                  },
                  "title": "Доктор Кто: Безликие — 2020, Великобритания, Приключения",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "searchResult": Object {
                      "id": "38273",
                      "subtitle": "2020, Великобритания, Приключения",
                      "title": "Доктор Кто: Ярость из глубин",
                      "url": "http://hdrezka.co/cartoons/adventures/38273-doktor-kto-yarost-iz-glubin-2020.html",
                    },
                    "type": "ReferenceSearchResult",
                  },
                  "title": "Доктор Кто: Ярость из глубин — 2020, Великобритания, Приключения",
                  "type": "MediaReference",
                },
              ],
              "kind": "SearchResultsList",
              "title": "",
              "type": "MediaFolder",
            }
        `);
        const folderOfTranslatorReferences = await client.getMediaByReference(
            (<MediaReference>searchResultsFolder.children[0]).ref
        );
        expect(folderOfTranslatorReferences?.type).toEqual('MediaFolder');

        const [translatorReferenceMedia] = (<MediaFolder>(
            folderOfTranslatorReferences
        )).children;

        expect(translatorReferenceMedia).not.toBeNull();

        expect(translatorReferenceMedia.type).toEqual('MediaReference');

        const folderOfEpisodeReferences = await client.getMediaByReference(
            (<MediaReference>translatorReferenceMedia).ref
        );

        expect(folderOfEpisodeReferences?.type).toEqual('MediaFolder');

        const episodeReference = (<MediaFolder>folderOfEpisodeReferences)
            .children[0] as MediaReference;

        expect(episodeReference.type).toEqual('MediaReference');
        expect(episodeReference.ref.type).toEqual('ReferenceEpisode');

        const streamMapMedia = await client.getMediaByReference(
            episodeReference.ref
        );
        expect(streamMapMedia).not.toEqual(null);
        expect(stripProperties(<object>streamMapMedia, 'items["*"].url'))
            .toMatchInlineSnapshot(`
            Object {
              "items": Object {
                "1080p": Object {
                  "quality": "1080p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "360p": Object {
                  "quality": "360p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "480p": Object {
                  "quality": "480p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "720p": Object {
                  "quality": "720p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
              },
              "type": "MediaStreamMap",
            }
        `);
    });

    it('should load series with no translators', async () => {
        const client = createClient();

        const searchResultsFolder = await client.getSearchResults(
            'место встречи изменить нельзя'
        );
        expect(searchResultsFolder.children[0].type).toEqual('MediaReference');

        const folderOfEpisodeReferences = await client.getMediaByReference(
            (<MediaReference>searchResultsFolder.children[0]).ref
        );

        expect(folderOfEpisodeReferences?.type).toEqual('MediaFolder');

        expect(folderOfEpisodeReferences).toMatchInlineSnapshot(`
            Object {
              "children": Array [
                Object {
                  "ref": Object {
                    "episode": Object {
                      "episodeId": "1",
                      "id": "11565",
                      "seasonId": "1",
                      "title": "Серия 1",
                      "translatorId": undefined,
                    },
                    "type": "ReferenceEpisode",
                  },
                  "title": "Season 1, Episode 1",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "episode": Object {
                      "episodeId": "2",
                      "id": "11565",
                      "seasonId": "1",
                      "title": "Серия 2",
                      "translatorId": undefined,
                    },
                    "type": "ReferenceEpisode",
                  },
                  "title": "Season 1, Episode 2",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "episode": Object {
                      "episodeId": "3",
                      "id": "11565",
                      "seasonId": "1",
                      "title": "Серия 3",
                      "translatorId": undefined,
                    },
                    "type": "ReferenceEpisode",
                  },
                  "title": "Season 1, Episode 3",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "episode": Object {
                      "episodeId": "4",
                      "id": "11565",
                      "seasonId": "1",
                      "title": "Серия 4",
                      "translatorId": undefined,
                    },
                    "type": "ReferenceEpisode",
                  },
                  "title": "Season 1, Episode 4",
                  "type": "MediaReference",
                },
                Object {
                  "ref": Object {
                    "episode": Object {
                      "episodeId": "5",
                      "id": "11565",
                      "seasonId": "1",
                      "title": "Серия 5",
                      "translatorId": undefined,
                    },
                    "type": "ReferenceEpisode",
                  },
                  "title": "Season 1, Episode 5",
                  "type": "MediaReference",
                },
              ],
              "kind": "EpisodesList",
              "title": "",
              "type": "MediaFolder",
            }
        `);

        const episodeReference = (<MediaFolder>folderOfEpisodeReferences)
            .children[0] as MediaReference;

        expect(episodeReference.type).toEqual('MediaReference');
        expect(episodeReference.ref.type).toEqual('ReferenceEpisode');

        const streamMapMedia = await client.getMediaByReference(
            episodeReference.ref
        );
        expect(streamMapMedia).not.toEqual(null);
        expect(stripProperties(<object>streamMapMedia, 'items["*"].url'))
            .toMatchInlineSnapshot(`
                      Object {
                        "items": Object {
                          "1080p": Object {
                            "quality": "1080p",
                            "type": "MediaStream",
                            "url": "[DELETED]",
                          },
                          "360p": Object {
                            "quality": "360p",
                            "type": "MediaStream",
                            "url": "[DELETED]",
                          },
                          "480p": Object {
                            "quality": "480p",
                            "type": "MediaStream",
                            "url": "[DELETED]",
                          },
                          "720p": Object {
                            "quality": "720p",
                            "type": "MediaStream",
                            "url": "[DELETED]",
                          },
                        },
                        "type": "MediaStreamMap",
                      }
              `);
    });

    it('should load movie with no translators', async () => {
        const client = createClient();

        const searchResultsFolder = await client.getSearchResults(
            'иван васильевич меняет профессию'
        );
        expect(searchResultsFolder.children[0].type).toEqual('MediaReference');

        const streamMapMedia = await client.getMediaByReference(
            (<MediaReference>searchResultsFolder.children[0]).ref
        );

        expect(streamMapMedia).not.toEqual(null);

        expect(stripProperties(<object>streamMapMedia, 'items["*"].url'))
            .toMatchInlineSnapshot(`
            Object {
              "items": Object {
                "1080p": Object {
                  "quality": "1080p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "360p": Object {
                  "quality": "360p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "480p": Object {
                  "quality": "480p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "720p": Object {
                  "quality": "720p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
              },
              "type": "MediaStreamMap",
            }
        `);
    });

    it('should load movie with multiple translators', async () => {
        const client = createClient();

        const searchResultsFolder = await client.getSearchResults(
            'Терминатор 2: Судный день'
        );

        const searchRes = searchResultsFolder.children.find(
            (result) =>
                result.type === 'MediaReference' &&
                result.ref.type === 'ReferenceSearchResult' &&
                result.ref.searchResult.subtitle?.match(/1991/)
        ) as MediaReference | undefined;

        expect(searchRes).not.toBe(undefined);

        const folderOfTranslatorReferences = await client.getMediaByReference(
            (<MediaReference>searchRes).ref
        );
        expect(folderOfTranslatorReferences?.type).toEqual('MediaFolder');

        const [translatorReferenceMedia] = (<MediaFolder>(
            folderOfTranslatorReferences
        )).children;

        expect(translatorReferenceMedia).not.toBeNull();

        expect(translatorReferenceMedia.type).toEqual('MediaReference');

        const streamMapMedia = await client.getMediaByReference(
            (<MediaReference>translatorReferenceMedia).ref
        );

        expect(streamMapMedia).not.toEqual(null);

        expect(stripProperties(<object>streamMapMedia, 'items["*"].url'))
            .toMatchInlineSnapshot(`
            Object {
              "items": Object {
                "1080p": Object {
                  "quality": "1080p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "360p": Object {
                  "quality": "360p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "480p": Object {
                  "quality": "480p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
                "720p": Object {
                  "quality": "720p",
                  "type": "MediaStream",
                  "url": "[DELETED]",
                },
              },
              "type": "MediaStreamMap",
            }
        `);
    });
});
