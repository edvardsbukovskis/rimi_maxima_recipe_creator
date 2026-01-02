import * as cheerio from 'cheerio';
import { Product } from '@/types';

export const rimiService = {
    search: async (query: string): Promise<Product[]> => {
        try {
            const url = `https://www.rimi.lv/e-veikals/lv/meklesana?query=${encodeURIComponent(query)}`;
            console.log(`[Rimi] Fetching URL: ${url}`);

            const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, backoff = 1000): Promise<Response> => {
                try {
                    const response = await fetch(url, options);
                    if (response.status === 429 || response.status >= 500) {
                        if (retries > 0) {
                            console.log(`[Rimi] Retrying "${query}" in ${backoff}ms... (${retries} left)`);
                            await new Promise(resolve => setTimeout(resolve, backoff));
                            return fetchWithRetry(url, options, retries - 1, backoff * 2);
                        }
                    }
                    return response;
                } catch (error) {
                    if (retries > 0) {
                        console.log(`[Rimi] Error fetching "${query}", retrying... (${retries} left)`);
                        await new Promise(resolve => setTimeout(resolve, backoff));
                        return fetchWithRetry(url, options, retries - 1, backoff * 2);
                    }
                    throw error;
                }
            };

            const response = await fetchWithRetry(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            console.log(`[Rimi] Response status: ${response.status}`);
            if (!response.ok) {
                console.error(`Rimi fetch failed: ${response.status}`);
                return [];
            }

            const html = await response.text();
            console.log(`[Rimi] HTML length: ${html.length}`);

            const $ = cheerio.load(html);
            console.log(`[Rimi] .product-grid__item count: ${$('.product-grid__item').length}`);
            console.log(`[Rimi] .produc-card count: ${$('.product-card').length}`);
            console.log(`[Rimi] .price count: ${$('.price').length}`);

            const products: Product[] = [];

            // Selectors based on debug HTML
            $('.product-grid__item').each((_, element) => {
                const $el = $(element);
                const name = $el.find('.card__name').text().trim();

                let price = 0;

                // Try to find loyalty price first
                const loyaltyEuro = $el.find('.price-badge__price > span').first().text().trim();
                const loyaltyCents = $el.find('.price-badge__price > class > sup').text().trim(); // Selector guessing based on varying Rimi layout, usually it is .price-label__price

                // Inspecting my investigation: The loyalty price was found in .price-label__price or .price-tag.-loyalty
                // Let's look for .price-tag.-loyalty first

                const $loyaltyTag = $el.find('.price-tag.-loyalty');
                const $normalTag = $el.find('.price-tag').not('.-loyalty').first();

                let $priceSource = $normalTag;
                if ($loyaltyTag.length > 0) {
                    $priceSource = $loyaltyTag;
                }

                // If we didn't find specific tags, fallback to the generic generic card__price
                if ($priceSource.length === 0) {
                    $priceSource = $el.find('.card__price');
                }

                const euro = $priceSource.find('span').first().text().trim();
                const cents = $priceSource.find('div > sup').text().trim();

                if (euro && cents) {
                    price = parseFloat(`${euro}.${cents}`);
                }

                const relativeUrl = $el.find('a.card__url').attr('href');
                const imageUrl = $el.find('.card__image-wrapper img').attr('src') || $el.find('.card__image-wrapper img').attr('data-src');
                const pricePerUnit = $el.find('.card__price-per').text().trim().replace(/\s+/g, ' ');

                if (name && price > 0) {
                    products.push({
                        id: relativeUrl || name, // simplistic ID
                        name,
                        price,
                        store: 'rimi',
                        url: relativeUrl ? `https://www.rimi.lv${relativeUrl}` : url,
                        image: imageUrl,
                        pricePerUnit
                    });
                }
            });

            return products;
        } catch (error) {
            console.error('Rimi search error:', error);
            return [];
        }
    }
};
