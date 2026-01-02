const puppeteer = require('puppeteer');

async function search(query) {
    let browser;
    try {
        console.log(`[Barbora] Launching browser for query: ${query}`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        const url = `https://www.barbora.lv/meklet?q=${encodeURIComponent(query)}`;
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        try {
            // Check if we hit a selector
            await page.waitForSelector('.product-card-next', { timeout: 10000 });
            console.log('Found product selector!');
        } catch (e) {
            console.log('[Barbora] Timeout waiting for products.');
            await page.screenshot({ path: 'barbora_debug_fail.png' });
        }

        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.product-card-next'));
            return items.map(el => {
                const titleEl = el.querySelector('span[id^="fti-product-title"]');
                const title = titleEl ? titleEl.textContent?.trim() || '' : '';

                let price = 0;
                const metaPrice = el.querySelector('meta[itemprop="price"]');
                if (metaPrice) {
                    const content = metaPrice.getAttribute('content');
                    if (content) price = parseFloat(content);
                }

                return { title, price };
            });
        });

        console.log(`[Barbora] Found ${products.length} items`);
        console.log(products.slice(0, 3));

    } catch (error) {
        console.error('Barbora search error:', error);
    } finally {
        if (browser) await browser.close();
    }
}

// Test with simpler query
search('piens');
