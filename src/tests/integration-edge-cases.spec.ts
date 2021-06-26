import { HdrezkaClientImpl } from '../HdrezkaClientImpl';
import { MediaFolder, MediaReference } from '../types';

describe('integration edge cases', () => {
    xit('should load series with one translator loaded by default', async () => {
        const client = new HdrezkaClientImpl();

        const searchResultsFolder = await client.getSearchResults(
            'H+ цифровой сериал'
        );
        expect(searchResultsFolder.children[0].type).toEqual('MediaReference');

        const folderOfEpisodeReferences = await client.getMediaByReference(
            (<MediaReference>searchResultsFolder.children[0]).ref
        );

        expect(folderOfEpisodeReferences?.type).toEqual('MediaFolder');

        expect((<MediaFolder>folderOfEpisodeReferences).children[0])
            .toMatchInlineSnapshot(`
            Object {
              "ref": Object {
                "episode": Object {
                  "episodeId": "1",
                  "id": "2169",
                  "seasonId": "1",
                  "title": "Серия 1",
                  "translatorId": "7",
                },
                "type": "ReferenceEpisode",
              },
              "title": "Season 1, Episode 1",
              "type": "MediaReference",
            }
        `);
    });
});
