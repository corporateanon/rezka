import { HdrezkaClient } from '..';

async function main() {
    const client = new HdrezkaClient();
    const res = await client.getMediaByReference({
        type: 'ReferenceUrl',
        url: 'https://rezka.ag/films/drama/27069-moy-syn-2017.html',
    });
    console.log(res);
}

main().catch((e) => {
    console.error('Unhandled exception:');
    console.error(e.stack || e);
    process.exit(1);
});
