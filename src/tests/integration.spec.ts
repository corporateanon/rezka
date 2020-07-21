import { parseStreamMap } from '../utils';
import { HdrezkaClientImpl } from '../HdrezkaClientImpl';
import { MediaReference, MediaFolder } from '../types';
import { stripProperties } from './utils';

describe('integration', () => {
    it('should load series with multiple translators', async () => {
        const client = new HdrezkaClientImpl();

        const searchResultsFolder = await client.getSearchResults('доктор кто');
        expect(searchResultsFolder.children[0].type).toEqual('MediaReference');

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
        const client = new HdrezkaClientImpl();

        const searchResultsFolder = await client.getSearchResults(
            'место встречи изменить нельзя'
        );
        expect(searchResultsFolder.children[0].type).toEqual('MediaReference');

        const folderOfEpisodeReferences = await client.getMediaByReference(
            (<MediaReference>searchResultsFolder.children[0]).ref
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

    it('should load movie with no translators', async () => {
        const client = new HdrezkaClientImpl();

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
        const client = new HdrezkaClientImpl();

        const searchResultsFolder = await client.getSearchResults('паразиты');

        const searchRes = searchResultsFolder.children.find(
            (result) =>
                result.type === 'MediaReference' &&
                result.ref.type === 'ReferenceSearchResult' &&
                result.ref.searchResult.subtitle?.match(/Корея/)
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
