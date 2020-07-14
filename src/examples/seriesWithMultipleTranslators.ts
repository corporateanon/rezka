import { HdrezkaClient } from '..';

async function main() {
    const client = new HdrezkaClient();
    const folderOfTranslatorReferences = await client.getMediaByReference({
        type: 'ReferenceUrl',
        url: 'https://rezka.ag/series/fiction/1745-doktor-kto-2005.html',
    });
    if (folderOfTranslatorReferences?.type !== 'MediaFolder') {
        return;
    }
    const [translatorReferenceMedia] = folderOfTranslatorReferences.children;
    if (!translatorReferenceMedia) {
        return;
    }
    if (translatorReferenceMedia.type !== 'MediaReference') {
        return;
    }
    const folderOfEpisodeReferences = await client.getMediaByReference(
        translatorReferenceMedia.ref
    );
    if (folderOfEpisodeReferences?.type !== 'MediaFolder') {
        return;
    }
    const episodeReference = folderOfEpisodeReferences.children[0];
    if (episodeReference.type !== 'MediaReference') {
        return;
    }
    if (episodeReference.ref.type !== 'ReferenceEpisode') {
        return;
    }
    const streamMapMedia = await client.getMediaByReference(
        episodeReference.ref
    );
    console.log(streamMapMedia);
}

main().catch((e) => {
    console.error('Unhandled exception:');
    console.error(e.stack || e);
    process.exit(1);
});
