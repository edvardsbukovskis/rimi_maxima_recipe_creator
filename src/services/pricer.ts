import { Product, Recipe } from '@/types';
import { rimiService } from './rimi';
import { barboraService } from './barbora';

interface PriceResult {
    totalRimi: number;
    totalMaxima: number;
    ingredients: {
        [name: string]: {
            rimi: Product | null;
            maxima: Product | null;
            bestStore: 'rimi' | 'maxima' | 'tie' | 'none';
        };
    };
}

// Semantic category definitions for stricter filtering.
type Category = 'meat' | 'dairy' | 'bread' | 'veg' | 'spice' | 'sauce' | 'egg' | 'pasta' | 'other';

const categorizeIngredient = (query: string): { type: Category; mustNot?: string[] } => {
    const q = query.toLowerCase();

    // MEAT & POULTRY
    if (q.includes('gaļa') || q.includes('malt') || q.includes('liellop') || q.includes('cūk') || q.includes('vist')) {
        return {
            type: 'meat',
            mustNot: [
                'maiz', 'bulciņ', 'pica', 'mērc', 'laš', 'ziv', 'tunc', 'uzkod', 'čipsi',
                'garšviela', 'maisījums', 'piedeva', 'buljons', 'nūdel', 'cepum',
                'kečup', 'heinz', 'spilva', 'pophouse', 'longchips', 'flint', 'tuc', 'pringles', 'estrella', 'lāči',
                'kartupel', 'plāksn', 'konserv', 'gulaša', 'zupa', 'pastēte', 'desa', 'cīsiņ', 'šprotes', 'nūdel'
            ]
        };
    }

    // BACON & SMOKED MEATS
    if (q.includes('bekon') || q.includes('vaigu') || q.includes('šķiņķ') || q.includes('kupin')) {
        return {
            type: 'meat',
            mustNot: ['mērc', 'sauce', 'čips', 'uzkod', 'garšviela', 'zupa', 'nūdel', 'maiz', 'bulciņ', 'pica', 'lāči', 'nūdel', 'konserv']
        };
    }

    // DAIRY - MILK, CREAM, CHEESE
    if (q.includes('siers') || q.includes('piens') || q.includes('krējums') || q.includes('parmez') || q.includes('parmesan') || q.includes('sviests')) {
        return {
            type: 'dairy',
            mustNot: [
                'mērce', 'sauce', 'uzkod', 'čipsi', 'dzērien', 'pica', 'cepum',
                'desa', 'riekst', 'desiņ', 'cigar', 'jersika', 'roka', 'nūdel', 'kausēt', 'smērējam',
                'garšviela', 'piedeva', 'maiz', 'bulciņ', 'nūdel'
            ]
        };
    }

    // BREADS & BUNS
    if (q.includes('maiz') || q.includes('bulciņ') || q.includes('don') || q.includes('hamburger') || q.includes('tobis') || q.includes('loksnes')) {
        return {
            type: 'bread',
            mustNot: ['mērc', 'majonēz', 'gaļa', 'kotlet', 'des', 'sier', 'konfekt', 'želej', 'uzkod', 'čips', 'kausēt', 'zupa', 'nūdel']
        };
    }

    // SPICES, OILS, SUGARS
    if (q.includes('sāls') || q.includes('pipar') || q.includes('eļļa') || q.includes('cukurs') || q.includes('milti')) {
        const mustNot = ['gaļa', 'maiz', 'pica', 'zupa', 'nūdel', 'čips', 'uzkod', 'mērce'];
        if (q.includes('cukurs') && !q.includes('vanil')) mustNot.push('vanil');
        if (q.includes('cukurs') && !q.includes('pūder')) mustNot.push('pūdercukurs');
        if (q.includes('eļļa') && !q.includes('sezam')) mustNot.push('sezam');
        if (q.includes('eļļa') && !q.includes('olīv')) mustNot.push('olīv');
        return { type: 'spice', mustNot };
    }

    // VEGETABLES
    if (q.includes('tomāt') || q.includes('sīpol') || q.includes('ķiplok') || q.includes('salāt') || q.includes('kartupel')) {
        return {
            type: 'veg',
            mustNot: [
                'konserv', 'gabal', 'mērce', 'pasta', 'plūmju', 'ķiršu', 'smalcin', 'sulā',
                'adžika', 'lečo', 'kečup', 'čips', 'uzkod', 'maiz', 'bulciņ', 'nūdel'
            ]
        };
    }

    // SAUCES & CONDIMENTS
    if (q.includes('sinep') || q.includes('majonēz') || q.includes('kečup') || q.includes('mērce')) {
        return {
            type: 'sauce',
            mustNot: ['pulver', 'zupa', 'biešu', 'aukst', 'čips', 'siļķ', 'hering', 'pīrādz', 'bulciņ', 'maiz', 'nūdel']
        };
    }

    // EGGS
    if (q.includes('ola')) {
        return { type: 'egg', mustNot: ['paipal', 'krās', 'uzkod', 'čips', 'maiz', 'bulciņ', 'nūdel'] };
    }

    // PASTA
    if (q.includes('spaget') || q.includes('makaron') || q.includes('pasta') || q.includes('frez') || q.includes('lasagn') || q.includes('loksnes')) {
        return {
            type: 'pasta',
            mustNot: ['piedev', 'zupa', 'mērc', 'sauce', 'garšv', 'salāt', 'konserv', 'maiz', 'bulciņ']
        };
    }

    return { type: 'other' };
};

const normalizeLatvian = (str: string): string => {
    return str.toLowerCase()
        .replace(/[āá]/g, 'a')
        .replace(/[ēé]/g, 'e')
        .replace(/[īí]/g, 'i')
        .replace(/[ōó]/g, 'o')
        .replace(/[ūú]/g, 'u')
        .replace(/[š]/g, 's')
        .replace(/[ģ]/g, 'g')
        .replace(/[ķ]/g, 'k')
        .replace(/[ļ]/g, 'l')
        .replace(/[ņ]/g, 'n')
        .replace(/[č]/g, 'c')
        .replace(/[ž]/g, 'z')
        .replace(/spaghetti/g, 'spageti')
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const findTopMatches = (products: Product[], query: string, category: { type: Category; mustNot?: string[] }): Product[] => {
    if (!query) return [];

    // Normalize query
    const cleanQuery = query.toLowerCase()
        .replace(/\s+\d+(l|ml|kg|g|gab)\b/gi, '');

    const normalizedQuery = normalizeLatvian(cleanQuery);
    const queryWords = normalizedQuery.split(' ').filter(w => w.length > 1);
    if (queryWords.length === 0) return [];

    const primaryWord = queryWords[0];

    const scored = products.map(p => {
        const lowerName = p.name.toLowerCase();
        const normName = normalizeLatvian(p.name);
        let score = 0;

        // Strict exclusion if name contains any 'mustNot'
        if (category.mustNot) {
            for (const bad of category.mustNot) {
                const normBad = normalizeLatvian(bad);
                if (normName.includes(normBad) && !normalizedQuery.includes(normBad)) {
                    return null; // Strict exclusion
                }
            }
        }

        // Stemming: get first 4 chars for fuzzy matching
        const queryStems = queryWords.map(w => w.substring(0, 4));

        if (primaryWord) {
            const primaryStem = primaryWord.substring(0, 4);
            const hasPrimaryMatch = normName.includes(primaryWord) || (primaryWord.length >= 4 && normName.includes(primaryStem));

            if (!hasPrimaryMatch) {
                // Allow synonyms for burger nouns (burger/hamburger)
                const burgerSynonyms = ['burger', 'hamburger'];
                const isBurgerSearch = burgerSynonyms.some(s => primaryWord.includes(s));
                const isBurgerProduct = burgerSynonyms.some(s => normName.includes(s));

                if (!(isBurgerSearch && isBurgerProduct)) {
                    score -= 150;
                }
            }
        }

        let matchedWords = 0;
        queryWords.forEach((word, idx) => {
            const stem = queryStems[idx];
            if (normName.includes(word)) {
                score += 40; // Increased base weight
                matchedWords++;
            } else if (word.length >= 4 && normName.includes(stem)) {
                score += 35; // Stem match almost as good as full match in Latvian
                matchedWords++;
            }
        });

        // BIG BOOST for matching all words - this should put them in the top bucket
        if (matchedWords === queryWords.length && queryWords.length > 0) {
            score += 200;
        }

        // Minor bonuses for order/prefix - NOT enough to jump buckets (100)
        if (normName.startsWith(primaryWord)) score += 15;
        if (normName.includes(normalizedQuery)) score += 25;

        // PENALTY for vanilla sugar etc when looking for regular sugar
        if (category.type === 'spice' && normalizedQuery.includes('cukurs') && normName.includes('vanilin')) {
            score -= 200;
        }
        if (category.type === 'spice' && normalizedQuery.includes('cukurs') && normName.includes('puder')) {
            score -= 150;
        }

        if (normalizedQuery.includes('burger') && (normName.includes('burger') || normName.includes('hamburger'))) score += 30;
        if (normalizedQuery.includes('malt') && normName.includes('malt')) score += 30;

        // Parmesan synonyms (cietais siers, grana padano)
        if (normalizedQuery.includes('parmez') || normalizedQuery.includes('parmesan')) {
            if (normName.includes('cietais siers') || normName.includes('grana') || normName.includes('padano')) {
                score += 250; // Increased boost to beat irrelevant 'parmesan' flavored items
            }
        }

        // Specific Carbonara tweaks: prioritize actual bacon over bacon-flavored sauces/snacks
        if (normalizedQuery.includes('bekon')) {
            if (normName.includes('kupinat') || normName.includes('cukgaļ') || normName.includes('skel')) {
                score += 100; // Boost raw/cooked bacon products
            }
        }

        const globalNoise = ['cimdi', 'lateksa', 'gumijas', 'nitrila', 'maiss', 'trauks', 'papīrs', 'konserv', 'sterilizēt', 'maisiņš', 'folija', 'drāna', 'sūklis'];
        for (const excl of globalNoise) {
            const normExcl = normalizeLatvian(excl);
            if (normName.includes(normExcl)) score -= 300;
        }

        let unitPrice = Infinity;
        if (p.pricePerUnit) {
            const match = p.pricePerUnit.match(/(\d+[.,]\d+)/);
            if (match) unitPrice = parseFloat(match[1].replace(',', '.'));
        }
        if (unitPrice === Infinity) unitPrice = p.price;

        return { product: p, score, unitPrice };
    }).filter((s): s is { product: Product; score: number; unitPrice: number } => s !== null);

    const viable = scored.filter(s => s.score > 20);
    if (viable.length === 0) return [];

    viable.sort((a, b) => {
        // Use larger buckets (200) to keep relevant items together
        const bucketA = Math.floor(a.score / 200);
        const bucketB = Math.floor(b.score / 200);
        if (bucketB !== bucketA) return bucketB - bucketA;

        // If scores are tied in the same bucket, prefer the one that is NOT a "flavored" or "specialty" version if query is simple
        return a.unitPrice - b.unitPrice;
    });

    return viable.slice(0, 5).map(v => v.product);
};

export const pricerService = {
    calculatePrice: async (recipe: Recipe): Promise<PriceResult> => {
        const result: PriceResult = {
            totalRimi: 0,
            totalMaxima: 0,
            ingredients: {}
        };

        const ingredientResults = [];
        for (const ingredient of recipe.ingredients) {
            const result = await (async () => {
                // ... same logic as before but inside the for loop ...
                let query = ingredient.name;
                const lowerQuery = query.toLowerCase();

                if ((lowerQuery.includes('maltā') || lowerQuery.includes('malt')) &&
                    (lowerQuery.includes('gaļa') || lowerQuery.includes('gala'))) {
                    query = 'maltā gaļa';
                }

                if (lowerQuery.includes('siers') && lowerQuery.includes('rīvēts')) {
                    query = 'siers';
                }

                const isBurgerBunIngredient = lowerQuery.includes('burger') && lowerQuery.includes('maiz');

                let rimiProducts: Product[] = [];
                let maximaProducts: Product[] = [];

                if (isBurgerBunIngredient) {
                    const [rimiMain, rimiHamburger, maximaMain, maximaHamburger] = await Promise.all([
                        rimiService.search(query).catch(() => []),
                        rimiService.search('hamburger').catch(() => []),
                        barboraService.search(query).catch(() => []),
                        barboraService.search('hamburger').catch(() => [])
                    ]);
                    const rimiMap = new Map<string, Product>();
                    [...rimiMain, ...rimiHamburger].forEach(p => rimiMap.set(p.id, p));
                    rimiProducts = Array.from(rimiMap.values());

                    const maximaMap = new Map<string, Product>();
                    [...maximaMain, ...maximaHamburger].forEach(p => maximaMap.set(p.id, p));
                    maximaProducts = Array.from(maximaMap.values());
                } else {
                    [rimiProducts, maximaProducts] = await Promise.all([
                        rimiService.search(query).catch(() => []),
                        barboraService.search(query).catch(() => [])
                    ]);
                }

                const category = categorizeIngredient(query);
                const rimiMatches = findTopMatches(rimiProducts, query, category);
                const maximaMatches = findTopMatches(maximaProducts, query, category);

                return {
                    name: ingredient.name,
                    rimi: rimiMatches[0] || null,
                    maxima: maximaMatches[0] || null
                };
            })();
            ingredientResults.push(result);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        ingredientResults.forEach(item => {
            let bestStore: 'rimi' | 'maxima' | 'tie' | 'none' = 'none';
            if (item.rimi && item.maxima) {
                if (item.rimi.price < item.maxima.price) bestStore = 'rimi';
                else if (item.maxima.price < item.rimi.price) bestStore = 'maxima';
                else bestStore = 'tie';
            } else if (item.rimi) bestStore = 'rimi';
            else if (item.maxima) bestStore = 'maxima';

            result.ingredients[item.name] = { rimi: item.rimi, maxima: item.maxima, bestStore };
            if (item.rimi) result.totalRimi += item.rimi.price;
            if (item.maxima) result.totalMaxima += item.maxima.price;
        });

        result.totalRimi = parseFloat(result.totalRimi.toFixed(2));
        result.totalMaxima = parseFloat(result.totalMaxima.toFixed(2));
        return result;
    },

    streamPrices: async (recipe: Recipe, onProgress: (data: any) => void): Promise<void> => {
        for (const ingredient of recipe.ingredients) {
            let query = ingredient.name;
            const lowerQuery = query.toLowerCase();

            if ((lowerQuery.includes('maltā') || lowerQuery.includes('malt')) &&
                (lowerQuery.includes('gaļa') || lowerQuery.includes('gala'))) {
                query = 'maltā gaļa';
            }

            if (lowerQuery.includes('siers') && lowerQuery.includes('rīvēts')) {
                query = 'siers';
            }

            const isBurgerBunIngredient = lowerQuery.includes('burger') && lowerQuery.includes('maiz');

            let rimiProducts: Product[] = [];
            let maximaProducts: Product[] = [];

            if (isBurgerBunIngredient) {
                const [rimiMain, rimiHamburger, maximaMain, maximaHamburger] = await Promise.all([
                    rimiService.search(query).catch(() => []),
                    rimiService.search('hamburger').catch(() => []),
                    barboraService.search(query).catch(() => []),
                    barboraService.search('hamburger').catch(() => [])
                ]);
                const rimiMap = new Map<string, Product>();
                [...rimiMain, ...rimiHamburger].forEach(p => rimiMap.set(p.id, p));
                rimiProducts = Array.from(rimiMap.values());

                const maximaMap = new Map<string, Product>();
                [...maximaMain, ...maximaHamburger].forEach(p => maximaMap.set(p.id, p));
                maximaProducts = Array.from(maximaMap.values());
            } else {
                [rimiProducts, maximaProducts] = await Promise.all([
                    rimiService.search(query).catch(() => []),
                    barboraService.search(query).catch(() => [])
                ]);
            }

            const category = categorizeIngredient(query);
            const rimiMatches = findTopMatches(rimiProducts, query, category);
            const maximaMatches = findTopMatches(maximaProducts, query, category);

            const bestRimi = rimiMatches[0] || null;
            const bestMaxima = maximaMatches[0] || null;

            let bestStore: 'rimi' | 'maxima' | 'tie' | 'none' = 'none';
            if (bestRimi && bestMaxima) {
                if (bestRimi.price < bestMaxima.price) bestStore = 'rimi';
                else if (bestMaxima.price < bestRimi.price) bestStore = 'maxima';
                else bestStore = 'tie';
            } else if (bestRimi) bestStore = 'rimi';
            else if (bestMaxima) bestStore = 'maxima';

            onProgress({
                name: ingredient.name,
                rimi: bestRimi,
                maxima: bestMaxima,
                rimiAlternatives: rimiMatches,
                maximaAlternatives: maximaMatches,
                bestStore
            });

            // Small delay between ingredients to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
};
