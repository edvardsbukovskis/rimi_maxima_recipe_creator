const fs = require('fs');

async function run() {
    const query = 'piens';
    const endpoints = [
        `https://www.barbora.lv/api/eshop/v1/search?q=${encodeURIComponent(query)}`,
        `https://www.barbora.lv/api/eshop/v1/products?q=${encodeURIComponent(query)}`,
        `https://www.barbora.lv/api/eshop/v1/searches/products?q=${encodeURIComponent(query)}`,
        `https://www.barbora.lv/api/eshop/v1/search/products?q=${encodeURIComponent(query)}` // Retrying looking for exact match
    ];

    for (const url of endpoints) {
        console.log(`Fetching API ${url}...`);
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Authorization': 'Bearer UNSOBiSDfbCQZVAsn0Qvyhw8OpjkkjRy'
                }
            });

            console.log(`Status: ${response.status}`);
            if (response.ok) {
                const json = await response.json();
                console.log('JSON Response keys:', Object.keys(json));
                // Check common fields
                if (json.products || json.items || json.results) {
                    console.log('Found potential products/items!');
                    const items = json.products || json.items || json.results;
                    if (items.length > 0) {
                        const output = 'First Product Item:\n' + JSON.stringify(items[0], null, 2);
                        console.log(output);
                        fs.writeFileSync('barbora_log_utf8.txt', output, 'utf8');
                    }
                    break;
                }
            } else {
                // console.log('Failed');
            }
        } catch (e) {
            console.error('Fetch error:', e.message);
        }
    }
}

run();
