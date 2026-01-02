import * as cheerio from 'cheerio';
import { Product } from '@/types';

export const barboraService = {
    search: async (query: string): Promise<Product[]> => {
        try {
            const url = `https://www.barbora.lv/meklet?q=${encodeURIComponent(query)}`;
            console.log(`[Barbora] Fetching: "${query}"`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'lv-LV,lv;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Referer': 'https://www.barbora.lv/'
                }
            });

            console.log(`[Barbora] Status: ${response.status} for "${query}"`);

            if (!response.ok) {
                console.error(`[Barbora] Fetch failed: ${response.status} ${response.statusText}`);
                const text = await response.text().catch(() => '');
                console.error(`[Barbora] Error body snippet: ${text.substring(0, 200)}`);
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Find the script containing window.b_productList
            let products: Product[] = [];
            $('script').each((_, script) => {
                const content = $(script).html();
                if (content && content.includes('window.b_productList')) {
                    console.log('[Barbora] Found script containing window.b_productList');
                    try {
                        const match = content.match(/window\.b\_productList\s*=\s*(\[[\s\S]*?\])\s*;/);
                        if (match) {
                            console.log(`[Barbora] Match found, length: ${match[1].length}`);
                            const rawProducts = JSON.parse(match[1]);
                            products = rawProducts.map((p: any) => ({
                                id: p.id || p.Url,
                                name: p.title,
                                price: p.price,
                                store: 'maxima' as const,
                                url: `https://www.barbora.lv/produkti/${p.Url}`,
                                image: p.image || '',
                                pricePerUnit: p.comparative_unit_price ? `${p.comparative_unit_price} €/${p.comparative_unit}` : ''
                            }));
                        } else {
                            console.log('[Barbora] Regex match failed for window.b_productList');
                        }
                    } catch (e) {
                        console.error('[Barbora] JSON parse error', e);
                    }
                }
            });

            console.log(`[Barbora] Found ${products.length} products for "${query}"`);
            return products;

        } catch (error: any) {
            console.error(`[Barbora] Exception for "${query}":`, error.message);
            // Return an empty array but log the exception - potentially we could return a placeholder product with the error?
            return [];
        }
    }
};
