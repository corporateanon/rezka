import { HdrezkaClientImpl } from '../HdrezkaClientImpl';
import { MediaReference } from '../types';

async function main() {
    const client = new HdrezkaClientImpl();
    const searchResultsFolder = await client.getSearchResults('паразиты');

    const searchRes = searchResultsFolder.children.find(
        (result) =>
            result.type === 'MediaReference' &&
            result.ref.type === 'ReferenceSearchResult' &&
            result.ref.searchResult.subtitle?.match(/Корея/)
    ) as MediaReference | undefined;
    if (!searchRes) {
        return;
    }

    console.log('Found');

    const folderOfTranslatorReferences = await client.getMediaByReference(
        searchRes.ref
    );
    if (!folderOfTranslatorReferences) {
        return;
    }
    if (folderOfTranslatorReferences.type !== 'MediaFolder') {
        return;
    }
    console.log(
        `Found ${folderOfTranslatorReferences.children.length} translators`
    );

    const [translatorReferenceMedia] = folderOfTranslatorReferences.children;
    if (!translatorReferenceMedia) {
        return;
    }
    if (translatorReferenceMedia.type !== 'MediaReference') {
        return;
    }
    const streams = await client.getMediaByReference(
        translatorReferenceMedia.ref
    );
    console.log(streams);
}

main().catch((e) => {
    console.error('Unhandled exception:');
    console.error(e.stack || e);
    process.exit(1);
});
