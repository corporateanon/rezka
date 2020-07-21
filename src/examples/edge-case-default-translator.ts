import { HdrezkaClientImpl } from '../HdrezkaClientImpl';
import { MediaFolder, MediaReference } from '../types';

async function main() {
    const client = new HdrezkaClientImpl();

    const searchResultsFolder = await client.getSearchResults(
        'H+ цифровой сериал'
    );

    const folderOfEpisodeReferences = await client.getMediaByReference(
        (<MediaReference>searchResultsFolder.children[0]).ref
    );
    console.log(folderOfEpisodeReferences);
}

main().catch((e) => console.error(e.stack || e));
