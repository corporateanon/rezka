import { parseStreamMap } from '../utils';

describe('parseStreamMap', () => {
    it('should parse stream map', async () => {
        const streamUrlSet =
            '[360p]https://load.hdrezka-ag.net/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/7f97bc3c64c6201c2e8fecb800c8b945:2020061010/240.mp4:hls:manifest.m3u8 or https://load.hdrezka-ag.net/06711ff7580a0bc0e3f1d5a2ae9c13f4:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/240.mp4,[480p]https://load.hdrezka-ag.net/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/7f97bc3c64c6201c2e8fecb800c8b945:2020061010/360.mp4:hls:manifest.m3u8 or https://load.hdrezka-ag.net/d13797676d17972d22d2097d282c7d10:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/360.mp4,[720p]https://load.hdrezka-ag.net/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/7f97bc3c64c6201c2e8fecb800c8b945:2020061010/480.mp4:hls:manifest.m3u8 or https://load.hdrezka-ag.net/7f46e67b89afa463df9e94c7b434fd0b:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/480.mp4,[1080p]https://load.hdrezka-ag.net/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/7f97bc3c64c6201c2e8fecb800c8b945:2020061010/720.mp4:hls:manifest.m3u8 or https://load.hdrezka-ag.net/ab8531ff91ae41da1badf3a6f41b1524:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/720.mp4';
        const streamMap = parseStreamMap(streamUrlSet);
        expect(streamMap).toMatchInlineSnapshot(`
      Object {
        "1080p": Object {
          "quality": "1080p",
          "type": "MediaStream",
          "url": "https://load.hdrezka-ag.net/ab8531ff91ae41da1badf3a6f41b1524:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/720.mp4",
        },
        "360p": Object {
          "quality": "360p",
          "type": "MediaStream",
          "url": "https://load.hdrezka-ag.net/06711ff7580a0bc0e3f1d5a2ae9c13f4:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/240.mp4",
        },
        "480p": Object {
          "quality": "480p",
          "type": "MediaStream",
          "url": "https://load.hdrezka-ag.net/d13797676d17972d22d2097d282c7d10:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/360.mp4",
        },
        "720p": Object {
          "quality": "720p",
          "type": "MediaStream",
          "url": "https://load.hdrezka-ag.net/7f46e67b89afa463df9e94c7b434fd0b:2020061010/tvseries/35103f069622120bfc65b4bc5dfb48153ae2bd10/480.mp4",
        },
      }
    `);
    });
});
