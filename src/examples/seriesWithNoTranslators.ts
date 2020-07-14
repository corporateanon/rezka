import { HdrezkaClient } from '..';

async function main() {
    const client = new HdrezkaClient();
    const folderMedia = await client.getMediaByReference({
        type: 'ReferenceUrl',
        url:
            'https://rezka.ag/series/action/11565-mesto-vstrechi-izmenit-nelzya.html',
    });
    if (folderMedia?.type !== 'MediaFolder') {
        return;
    }
    const [episodeReferenceMedia] = folderMedia.children;
    if (!episodeReferenceMedia) {
        return;
    }
    if (episodeReferenceMedia.type !== 'MediaReference') {
        return;
    }
    if (episodeReferenceMedia.ref.type !== 'ReferenceEpisode') {
        return;
    }
    const streamMedia = await client.getMediaByReference(
        episodeReferenceMedia.ref
    );
    console.log(streamMedia);
}

main().catch((e) => {
    console.error('Unhandled exception:');
    console.error(e.stack || e);
    process.exit(1);
});
