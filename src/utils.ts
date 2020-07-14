import { parse as parseUrl } from 'url';
import { MediaStream, StreamMap, StreamQuality } from './types';

export function parseStreamMap(urls: string): StreamMap {
    return urls
        .split(',')
        .map((record) => {
            const matches = record.match(
                /^\[(\d+p)\](http(?:s?):\/\/[^\s]+)(?:\sor\s(http(?:s?):\/\/[^\s]+))+/
            );
            if (!matches) {
                return null;
            }
            const [, quality, ...urlCandidates] = matches;
            if (!(Object.values(StreamQuality) as string[]).includes(quality)) {
                return null;
            }
            const url = urlCandidates.find((urlCandidate) => {
                const urlObj = parseUrl(urlCandidate);
                return urlObj.pathname?.endsWith('.mp4');
            });
            if (!url) {
                return null;
            }

            const stream: MediaStream = {
                type: 'MediaStream',
                quality: quality as StreamQuality, //TODO: replace it with a real check
                url,
            };
            return stream;
        })
        .filter((item): item is MediaStream => item !== null)
        .reduce((streamMap, item) => {
            streamMap[item.quality] = item;
            return streamMap;
        }, {} as StreamMap);
}
