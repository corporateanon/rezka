import { HdrezkaClient } from '..';

async function main() {
    const client = new HdrezkaClient();
    const searchResultsFolder = await client.getSearchResults('доктор кто');
    if (searchResultsFolder.children[0].type !== 'MediaReference') {
        return;
    }
    console.log(`Found ${searchResultsFolder.children.length} results`);
    const folderOfTranslatorReferences = await client.getMediaByReference(
        searchResultsFolder.children[0].ref
    );
    if (folderOfTranslatorReferences?.type !== 'MediaFolder') {
        return;
    }
    console.log(
        `Found ${folderOfTranslatorReferences.children.length} translations`
    );
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
    console.log(`Found ${folderOfEpisodeReferences.children.length} episodes`);
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
