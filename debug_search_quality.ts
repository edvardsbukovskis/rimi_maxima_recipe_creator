import { rimiService } from './src/services/rimi';
import { barboraService } from './src/services/barbora';

async function testSearch(term: string) {
    console.log(`\n=== Testing search for: "${term}" ===`);

    console.log('--- Rimi Results (Top 5 Cheapest) ---');
    try {
        const rimi = await rimiService.search(term);
        // Sort by price to see what the pricer sees
        const sortedRimi = rimi.sort((a, b) => a.price - b.price).slice(0, 5);
        sortedRimi.forEach(p => console.log(`[${p.price}€] ${p.name}`));
    } catch (e) { console.error('Rimi error', e); }

    console.log('--- Barbora Results (Top 5 Cheapest) ---');
    try {
        const barbora = await barboraService.search(term);
        const sortedBarbora = barbora.sort((a, b) => a.price - b.price).slice(0, 5);
        sortedBarbora.forEach(p => console.log(`[${p.price}€] ${p.name}`));
    } catch (e) { console.error('Barbora error', e); }
}

async function run() {
    await testSearch('Piens 1l');
    await testSearch('Olas');
    await testSearch('Eļļa cepšanai');
}

run();
