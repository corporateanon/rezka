import { HdrezkaClient } from '..';

async function main() {
    const client = new HdrezkaClient();
    const res = await client.getSearchResults('doctor who');
    console.log(res);
}

main().catch((e) => {
    console.error('Unhandled exception:');
    console.error(e.stack || e);
    process.exit(1);
});
