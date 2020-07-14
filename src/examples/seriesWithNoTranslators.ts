import { HdrezkaClient } from '..';

async function main() {
    const client = new HdrezkaClient();

    const searchResultsFolder = await client.getSearchResults(
        'место встречи изменить нельзя'
    );
    if (searchResultsFolder.children[0].type !== 'MediaReference') {
        return;
    }
    console.log(`Found ${searchResultsFolder.children.length} results`);

    const folderMedia = await client.getMediaByReference(
        searchResultsFolder.children[0].ref
    );
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
