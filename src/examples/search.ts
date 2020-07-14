import { HdrezkaClientImpl } from '../HdrezkaClientImpl';

async function main() {
    const client = new HdrezkaClientImpl();
    const folder = await client.getSearchResults('doctor who');
    console.log(folder);
}

main().catch((e) => {
    console.error('Unhandled exception:');
    console.error(e.stack || e);
    process.exit(1);
});
