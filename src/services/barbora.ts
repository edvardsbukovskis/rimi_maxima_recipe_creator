import puppeteer, { Browser, Page } from 'puppeteer';
import { Product } from '@/types';

// Singleton browser instance
let browserInstance: Browser | null = null;

// Queue system to serialize requests (prevents race conditions)
let requestQueue: Promise<any> = Promise.resolve();

async function getBrowser(): Promise<Browser> {
    if (browserInstance && browserInstance.isConnected()) {
        return browserInstance;
    }

    console.log('[Barbora] Launching browser...');
    browserInstance = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('[Barbora] Browser ready!');
    return browserInstance;
}

// Serialized search function - waits for previous searches to complete
async function searchSerialized(query: string): Promise<Product[]> {
    const result = requestQueue.then(async () => {
        return await searchInternal(query);
    });
    requestQueue = result.catch(() => { }); // Keep queue moving even on error
    return result;
}

async function searchInternal(query: string): Promise<Product[]> {
    let page: Page | null = null;

    try {
        const browser = await getBrowser();
        page = await browser.newPage();

        // Optimize page settings
        await page.setViewport({ width: 1280, height: 800 });

        // Block unnecessary resources for speed
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        const url = `https://www.barbora.lv/meklet?q=${encodeURIComponent(query)}`;
        console.log(`[Barbora] Searching: "${query}"`);

        // Navigate
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

        // Wait for product cards
        try {
            await page.waitForSelector('.product-card-next', { timeout: 5000 });
        } catch {
            console.log(`[Barbora] No products for "${query}"`);
            await page.close();
            return [];
        }

        // Extract products
        const products = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.product-card-next'));
            return items.slice(0, 20).map(el => { // Fetch more products to find cheapest
                const titleEl = el.querySelector('span[id^="fti-product-title"]');
                const title = titleEl?.textContent?.trim() || '';

                let price = 0;
                const priceEl = el.querySelector('.b-product-price-current');
                if (priceEl) {
                    const text = priceEl.textContent?.replace(/\s/g, '').replace(',', '.') || '';
                    const match = text.match(/(\d+)[.,](\d{2})/);
                    if (match) price = parseFloat(`${match[1]}.${match[2]}`);
                }

                if (price === 0) {
                    const meta = el.querySelector('meta[itemprop="price"]');
                    if (meta) price = parseFloat(meta.getAttribute('content') || '0');
                }

                const link = el.querySelector('a[href^="/produkti/"]');
                const relativeUrl = link?.getAttribute('href') || '';

                // Get price per unit (e.g., "1.99 €/kg") - use regex to extract clean pattern
                let pricePerUnit = '';
                const allText = el.textContent || '';
                // Match pattern like "0,45€/kg" or "0.45 €/kg" or "0,45 €/gab."
                const unitMatch = allText.match(/(\d+[.,]\d+)\s*€\/(kg|l|gab\.?|ml|g)/i);
                if (unitMatch) {
                    pricePerUnit = `${unitMatch[1].replace(',', '.')} €/${unitMatch[2]}`;
                }

                return { title, price, relativeUrl, pricePerUnit };
            });
        });

        await page.close();

        const validProducts = products
            .filter(p => p.title && p.price > 0)
            .map(p => ({
                id: p.relativeUrl || p.title,
                name: p.title,
                price: p.price,
                store: 'maxima' as const,
                url: p.relativeUrl ? `https://www.barbora.lv${p.relativeUrl}` : url,
                image: '',
                pricePerUnit: p.pricePerUnit
            }));

        console.log(`[Barbora] Found ${validProducts.length} products for "${query}"`);
        return validProducts;

    } catch (error: any) {
        console.error(`[Barbora] Error for "${query}":`, error.message);
        if (page) await page.close().catch(() => { });

        // Reset browser on error
        if (browserInstance) {
            await browserInstance.close().catch(() => { });
            browserInstance = null;
        }

        return [];
    }
}

export const barboraService = {
    search: searchSerialized
};
