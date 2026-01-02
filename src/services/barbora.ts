import * as cheerio from 'cheerio';
import { Product } from '@/types';

export const barboraService = {
    search: async (query: string): Promise<Product[]> => {
        try {
            const url = `https://www.barbora.lv/meklet?q=${encodeURIComponent(query)}`;
            console.log(`[Barbora] Fetching: "${query}"`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                console.error(`Barbora fetch failed: ${response.status}`);
                return [];
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Find the script containing window.b_productList
            let products: Product[] = [];
            $('script').each((_, script) => {
                const content = $(script).html();
                if (content && content.includes('window.b_productList')) {
                    try {
                        const match = content.match(/window\.b\_productList\s*=\s*(\[[\s\S]*?\])\s*;/);
                        if (match) {
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
                        }
                    } catch (e) {
                        console.error('[Barbora] JSON parse error', e);
                    }
                }
            });

            console.log(`[Barbora] Found ${products.length} products for "${query}"`);
            return products;

        } catch (error: any) {
            console.error(`[Barbora] Error for "${query}":`, error.message);
            return [];
        }
    }
};
