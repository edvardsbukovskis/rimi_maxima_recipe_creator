export interface Product {
    id: string;
    name: string;
    price: number;
    store: 'rimi' | 'maxima';
    url: string;
    image?: string;
    category?: string;
    pricePerUnit?: string; // e.g., "1.50 €/l"
    isBulk?: boolean; // True if product is sold by weight (kg/l) and not pre-packed
}

export interface Ingredient {
    name: string;
    amount: string; // Display string, e.g., "500ml", "3 gab"
    amountValue?: number; // Parsed numeric value, e.g., 500
    amountUnit?: string; // Parsed unit, e.g., "ml", "gab"
    bestMatch?: {
        rimi?: Product;
        maxima?: Product;
    };
}

export interface Recipe {
    id: string;
    title: string;
    description: string;
    image: string;
    ingredients: Ingredient[];
    instructions: string[];
    prepTime: string;
    servings: number;
    yieldDescription?: string; // e.g., "~12 pankūkas"
    yieldPerServing?: string; // e.g., "~3 pankūkas"
}

// Helper: Parse amount string to value and unit
export const parseAmount = (amount: string): { value: number; unit: string } => {
    // Try to match patterns like "500ml", "3 gab", "1 tējk.", "200g", "1kg"
    const match = amount.match(/^(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg|gab|tējk|ēd\.?k|šķipsniņa)?\.?$/i);
    if (match) {
        return {
            value: parseFloat(match[1].replace(',', '.')),
            unit: (match[2] || 'gab').toLowerCase()
        };
    }
    // Handle special cases like "šķipsniņa"
    if (amount.toLowerCase().includes('šķipsniņa')) {
        return { value: 1, unit: 'šķipsniņa' };
    }
    return { value: 1, unit: 'gab' };
};

// Helper: Parse product size from pricePerUnit or name
export const parseProductSize = (product: Product, preferredUnit?: string): { value: number; unit: string } => {
    const nameLower = product.name.toLowerCase();
    const pricePerUnitLower = (product.pricePerUnit || '').toLowerCase();

    // FIRST try to find quantity in the product name - this is most reliable for eggs, etc.
    const nameMatch = product.name.match(/(\d+(?:[.,]\d+)?)\s*(gab|l|kg|ml|g)/i);
    if (nameMatch) {
        let value = parseFloat(nameMatch[1].replace(',', '.'));
        const unit = nameMatch[2].toLowerCase();

        // If we found a weight/volume but the recipe wants pieces, and it's a known unit-based product
        if (preferredUnit === 'gab' && (unit === 'g' || unit === 'ml' || unit === 'kg' || unit === 'l')) {
            const baseValue = (unit === 'kg' || unit === 'l') ? value * 1000 : value;

            // Smart estimation for common items
            const isBurgerBread = (nameLower.includes('burger') || nameLower.includes('hamburger')) &&
                (nameLower.includes('maiz') || nameLower.includes('buns') || nameLower.includes('maxi') || nameLower.includes('brioche'));

            if (isBurgerBread) {
                return { value: Math.round(baseValue / 80), unit: 'gab' }; // ~80g per bun
            }
            if (nameLower.includes('torti')) {
                return { value: Math.round(baseValue / 40), unit: 'gab' }; // ~40g per tortilla
            }
            if (nameLower.includes('pitā') || nameLower.includes('pita')) {
                return { value: Math.round(baseValue / 60), unit: 'gab' }; // ~60g per pita
            }
        }

        // Convert to base units
        if (unit === 'l') return { value: value * 1000, unit: 'ml' };
        if (unit === 'kg') return { value: value * 1000, unit: 'g' };
        if (unit === 'gab') return { value: value, unit: 'gab' };
        return { value, unit };
    }

    // Try to calculate weight from product price and pricePerUnit
    if (product.pricePerUnit && product.price) {
        const pricePerUnitMatch = product.pricePerUnit.match(/(\d+[.,]?\d*)\s*€\/(kg|l|g|ml|gab)/i);
        if (pricePerUnitMatch) {
            const perUnitPrice = parseFloat(pricePerUnitMatch[1].replace(',', '.'));
            const unit = pricePerUnitMatch[2].toLowerCase();

            if (perUnitPrice > 0) {
                if (unit === 'gab') return { value: 1, unit: 'gab' };

                const ratio = product.price / perUnitPrice;
                if (unit === 'kg') {
                    const grams = Math.round(ratio * 1000);
                    if (grams >= 10 && grams <= 5000) {
                        // Apply same smart estimation if preferredUnit is gab
                        if (preferredUnit === 'gab') {
                            const isBurgerBread = (nameLower.includes('burger') || nameLower.includes('hamburger')) &&
                                (nameLower.includes('maiz') || nameLower.includes('buns') || nameLower.includes('maxi') || nameLower.includes('brioche'));
                            if (isBurgerBread) {
                                return { value: Math.round(grams / 80), unit: 'gab' };
                            }
                        }
                        return { value: grams, unit: 'g' };
                    }
                }
                if (unit === 'l') {
                    const ml = Math.round(ratio * 1000);
                    if (ml >= 10 && ml <= 5000) return { value: ml, unit: 'ml' };
                }
            }
        }
    }

    // Default: assume 1 unit
    return { value: 1, unit: 'gab' };
};

/**
 * Calculates the price for the specific volume needed.
 * If product is 'bulk' (like loose onions or garlic by kg), it returns price * (neededAmount / 1kg)
 * If product is 'packed' (like 1kg bag of flour), it returns full price.
 */
export const getEffectivePrice = (product: Product, neededAmount: { value: number, unit: string }): number => {
    if (!product.isBulk) return product.price;

    const normNeeded = normalizeAmount(neededAmount.value, neededAmount.unit);

    // For weight-based bulk items (kg)
    if (normNeeded.unit === 'g') {
        return (product.price * normNeeded.value) / 1000;
    }

    // For volume-based bulk items (l) - less common but possible
    if (normNeeded.unit === 'ml') {
        return (product.price * normNeeded.value) / 1000;
    }

    return product.price;
};

// Normalize units to base (ml, g, gab)
export const normalizeAmount = (value: number, unit: string): { value: number; unit: string } => {
    const u = unit.toLowerCase();
    if (u === 'l') return { value: value * 1000, unit: 'ml' };
    if (u === 'kg') return { value: value * 1000, unit: 'g' };
    return { value, unit: u };
};
