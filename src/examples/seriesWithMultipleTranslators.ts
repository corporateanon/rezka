import { HdrezkaClient } from '..';
import {
    MediaReference,
    ReferenceEpisode,
    ReferenceSeriesFolder,
} from '../types';

async function main() {
    const client = new HdrezkaClient();
    const res = await client.getMediaByReference({
        type: 'ReferenceUrl',
        // url: 'https://rezka.ag/series/action/11565-mesto-vstrechi-izmenit-nelzya.html',
        url: 'https://rezka.ag/series/fiction/1745-doktor-kto-2005.html',
    });
    if (res?.type !== 'folder') {
        return;
    }
    const [child] = res.children;
    if (!child) {
        return;
    }
    if (child.type !== 'reference') {
        return;
    }
    const res2 = await client.getMediaByReference(
        (child as MediaReference<ReferenceSeriesFolder>).ref
    );
    if (res2?.type !== 'folder') {
        return;
    }
    const episodeReference = res2.children[0] as MediaReference<
        ReferenceEpisode
    >;
    if (episodeReference.type !== 'reference') {
        return;
    }
    const stream = await client.getMediaByReference(episodeReference.ref);
}

main().catch((e) => {
    console.error('Unhandled exception:');
    console.error(e.stack || e);
    process.exit(1);
});
