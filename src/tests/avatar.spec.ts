import { HdrezkaClientImpl } from '../HdrezkaClientImpl';
import { MediaFolder, MediaReference, MediaStream } from '../types';
import { stripProperties } from './utils';

describe('integration edge cases', () => {
    it('should load series with one translator loaded by default', async () => {
        const client = new HdrezkaClientImpl();

        const searchResultsFolder = await client.getSearchResults('аватар');

        expect(searchResultsFolder.children.length).toBeGreaterThan(0);
        const theAvatar = searchResultsFolder.children.find(
            (res) =>
                res.type === 'MediaReference' &&
                res.title === 'Аватар — 2009, США, Фантастика'
        ) as MediaReference;

        expect(theAvatar).not.toBeFalsy();

        const transList = (await client.getMediaByReference(
            theAvatar.ref
        )) as MediaFolder;

        expect(transList.children.length).toBeGreaterThan(0);
        const dubbingDirectorCut = transList.children.find(
            (res) =>
                res.type === 'MediaReference' &&
                res.title === 'Дубляж (реж. версия)'
        ) as MediaReference;
        expect(dubbingDirectorCut).not.toBeFalsy();

        const stream = (await client.getMediaByReference(
            dubbingDirectorCut.ref
        )) as MediaStream;

        expect(stripProperties(<object>stream, 'items["*"].url'))
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
