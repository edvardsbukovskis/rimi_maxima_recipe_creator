import * as cheerio from 'cheerio';
import { Product } from '@/types';

export const barboraService = {
    search: async (query: string): Promise<Product[]> => {
        try {
            const url = `https://www.barbora.lv/meklet?q=${encodeURIComponent(query)}`;
            console.log(`[Barbora] Fetching: "${query}"`);

            const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, backoff = 1000): Promise<Response> => {
                try {
                    const response = await fetch(url, options);
                    if (response.status === 429 || response.status >= 500) {
                        if (retries > 0) {
                            console.log(`[Barbora] Retrying "${query}" in ${backoff}ms... (${retries} left)`);
                            await new Promise(resolve => setTimeout(resolve, backoff));
                            return fetchWithRetry(url, options, retries - 1, backoff * 2);
                        }
                    }
                    return response;
                } catch (error) {
                    if (retries > 0) {
                        console.log(`[Barbora] Error fetching "${query}", retrying... (${retries} left)`);
                        await new Promise(resolve => setTimeout(resolve, backoff));
                        return fetchWithRetry(url, options, retries - 1, backoff * 2);
                    }
                    throw error;
                }
            };

            const response = await fetchWithRetry(url, {
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
                        // Use a more robust balanced bracket approach
                        const startMarker = 'window.b_productList = ';
                        const startIdx = content.indexOf(startMarker);
                        if (startIdx !== -1) {
                            const jsonContent = extractBalancedArray(content.substring(startIdx + startMarker.length));
                            if (jsonContent) {
                                console.log(`[Barbora] Extracted JSON length: ${jsonContent.length}`);
                                const rawProducts = JSON.parse(jsonContent);
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
                        }
                    } catch (e: any) {
                        console.error('[Barbora] JSON parse error', e.message);
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

function extractBalancedArray(text: string): string | null {
    let balance = 0;
    let inString = false;
    let escape = false;
    let quote = '';
    let startIdx = text.indexOf('[');
    if (startIdx === -1) return null;

    for (let i = startIdx; i < text.length; i++) {
        const char = text[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (char === '\\') {
            escape = true;
            continue;
        }
        if ((char === '"' || char === "'") && !inString) {
            inString = true;
            quote = char;
            continue;
        }
        if (char === quote && inString) {
            inString = false;
            continue;
        }
        if (inString) continue;

        if (char === '[') balance++;
        if (char === ']') {
            balance--;
            if (balance === 0) {
                return text.substring(startIdx, i + 1);
            }
        }
    }
    return null;
}
