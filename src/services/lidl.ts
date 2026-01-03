import * as cheerio from 'cheerio';
import { Product } from '@/types';

export const lidlService = {
    search: async (query: string): Promise<Product[]> => {
        try {
            // Lidl search results are better at /q/lv-LV/search
            const url = `https://www.lidl.lv/q/lv-LV/search?q=${encodeURIComponent(query)}`;
            console.log(`[Lidl] Fetching URL: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'lv-LV,lv;q=0.9,en-US;q=0.8,en;q=0.7'
                }
            });

            if (!response.ok) {
                console.error(`Lidl fetch failed: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const products: Product[] = [];

            // Method 1: Extraction from DOM
            $('.odsc-tile').each((_, element) => {
                const $el = $(element);
                const name = $el.find('.odsc-tile__title').text().trim();

                // Price extraction
                const euro = $el.find('.odsc-price__main').text().trim().replace(',', '.');
                const price = parseFloat(euro);

                const pricePerUnit = $el.find('.odsc-price__unit').text().trim();

                // Relative image and URL
                const relativeUrl = $el.find('a.odsc-tile__link').attr('href');
                const imageUrl = $el.find('img').attr('src');

                if (name && !isNaN(price)) {
                    products.push({
                        id: relativeUrl || name,
                        name,
                        price,
                        store: 'lidl',
                        url: relativeUrl ? `https://www.lidl.lv${relativeUrl}` : url,
                        image: imageUrl,
                        pricePerUnit
                    });
                }
            });

            // Method 2: Extraction from window.dataLayer (as backup or refinement)
            // Sometimes DOM doesn't have all data or prices are tricky
            if (products.length === 0) {
                const scriptText = $('script').map((_, s) => $(s).html()).get().find(h => h && h.includes('dataLayer'));
                if (scriptText) {
                    try {
                        // Regex to find ecommerce impressions without /s flag for compatibility
                        const match = scriptText.match(/'ecommerce':\s*{\s*'impressions':\s*(\[[\s\S]*?\])/);
                        if (match && match[1]) {
                            const impressions = JSON.parse(match[1].replace(/'/g, '"')); // Very crude parse
                            impressions.forEach((item: any) => {
                                if (item.name && item.price) {
                                    products.push({
                                        id: item.id || item.name,
                                        name: item.name,
                                        price: parseFloat(item.price),
                                        store: 'lidl',
                                        url: url, // hard to get specific URL from dataLayer easily
                                        image: undefined,
                                        pricePerUnit: item.variant || ''
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        console.error('[Lidl] dataLayer parse error:', e);
                    }
                }
            }

            return products;
        } catch (error) {
            console.error('Lidl search error:', error);
            return [];
        }
    }
};
