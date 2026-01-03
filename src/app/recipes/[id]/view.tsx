'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Recipe, Product, parseProductSize, normalizeAmount } from '@/types';
import { ShoppingCart, Check, AlertCircle, Loader2, ArrowLeft, ShoppingBasket, ChevronDown, Minus, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface IngredientData {
    rimi: Product | null;
    maxima: Product | null;
    rimiAlternatives?: Product[];
    maximaAlternatives?: Product[];
    bestStore: 'rimi' | 'maxima' | 'tie' | 'none';
}

interface PriceResult {
    totalRimi: number;
    totalMaxima: number;
    ingredients: { [name: string]: IngredientData };
}

// Helper to clean ingredient names for display (remove sizes like "1l", "1kg")
const cleanIngredientName = (name: string) => {
    return name.replace(/\s+\d+(\.\d+)?\s*(l|ml|kg|g|gab)\.?$/i, '').trim();
};



// Product Picker Dropdown Component
function ProductPicker({
    alternatives,
    selected,
    onSelect,
    store
}: {
    alternatives: Product[];
    selected: Product | null;
    onSelect: (product: Product) => void;
    store: 'rimi' | 'maxima';
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            // Don't close if clicking inside button OR inside dropdown
            if (buttonRef.current?.contains(target)) return;
            if (dropdownRef.current?.contains(target)) return;
            setIsOpen(false);
        };
        const handleScroll = (e: Event) => {
            // Don't close if scrolling inside the dropdown itself
            if (dropdownRef.current?.contains(e.target as Node)) return;
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true); // capture phase
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 288; // w-72 = 18rem = 288px
            // Center dropdown on button, but clamp to viewport
            let left = rect.left + (rect.width / 2) - (dropdownWidth / 2);
            left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));
            setPosition({
                top: rect.bottom + 4,
                left: left
            });
        }
        setIsOpen(!isOpen);
    };

    if (alternatives.length <= 1) return null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className={clsx(
                    "text-[9px] mt-1 px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors mx-auto",
                    store === 'rimi' ? "bg-primary/20 hover:bg-primary/30 text-primary" : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                )}
            >
                Mainīt <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] w-72 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl"
                    style={{ top: position.top, left: position.left }}
                >
                    <div className="p-2 text-[10px] text-muted-foreground border-b border-white/5">
                        Izvēlies alternatīvu:
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                        {alternatives.map((product, idx) => (
                            <button
                                key={idx}
                                onClick={() => { onSelect(product); setIsOpen(false); }}
                                className={clsx(
                                    "w-full text-left p-3 hover:bg-white/5 transition-colors flex justify-between items-start gap-3 border-b border-white/5 last:border-0",
                                    selected?.id === product.id && "bg-white/10"
                                )}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium leading-tight flex items-center gap-2">
                                        {product.name}
                                        {product.isBulk && (
                                            <span className="text-[8px] px-1 py-0.5 rounded-sm bg-zinc-800 text-muted-foreground uppercase tracking-widest font-bold">Sverams</span>
                                        )}
                                    </div>
                                    {product.pricePerUnit && (
                                        <div className="text-xs text-muted-foreground mt-0.5">{product.pricePerUnit}</div>
                                    )}
                                </div>
                                <div className={clsx(
                                    "text-base font-bold flex-shrink-0 text-right",
                                    store === 'rimi' ? "text-primary" : "text-red-400"
                                )}>
                                    €{product.price.toFixed(2)}
                                    {product.isBulk && <div className="text-[9px] font-normal text-muted-foreground">receptei</div>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

export default function RecipeDetailView({ recipe }: { recipe: Recipe }) {
    const [priceData, setPriceData] = useState<PriceResult>({
        totalRimi: 0, totalMaxima: 0, ingredients: {}
    });
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [selectedServings, setSelectedServings] = useState(recipe.servings);

    // Track selected product overrides per ingredient per store
    const [selectedProducts, setSelectedProducts] = useState<{
        [ingredientName: string]: { rimi?: Product; maxima?: Product }
    }>({});

    // Calculate how many products needed for a given ingredient
    const calculateProductQuantity = (ing: { amountValue?: number; amountUnit?: string }, product: Product | null): number => {
        if (!product || !ing.amountValue || !ing.amountUnit) return 1;

        // Skip calculation for unmeasurable units
        if (['šķipsniņa', 'tējk', 'ēd.k'].includes(ing.amountUnit.toLowerCase())) return 1;

        // Scale ingredient amount by servings
        const scaledAmount = (ing.amountValue / recipe.servings) * selectedServings;
        const normalized = normalizeAmount(scaledAmount, ing.amountUnit);
        const productSize = parseProductSize(product, normalized.unit);

        // Define unit categories - only compare within same category
        const weightUnits = ['g', 'kg'];
        const volumeUnits = ['ml', 'l'];
        const countUnits = ['gab'];

        const getCategory = (unit: string): string => {
            const u = unit.toLowerCase();
            if (weightUnits.includes(u)) return 'weight';
            if (volumeUnits.includes(u)) return 'volume';
            if (countUnits.includes(u)) return 'count';
            return 'unknown';
        };

        // Only calculate if units are in the same category AND match
        if (normalized.unit === productSize.unit) {
            const qty = Math.ceil(normalized.value / productSize.value);
            // Safety cap - never return more than 20 units (prevents absurd calculations)
            return Math.max(1, Math.min(qty, 20));
        }
        // Units don't match - return 1 (conservative)
        return 1;
    };

    const renderInstruction = (text: string) => {
        let rendered = text;

        // Replace {servings}
        rendered = rendered.replace(/{servings}/g, selectedServings.toString());

        // Replace {yield}
        const yieldScale = selectedServings / recipe.servings;
        const yieldDesc = recipe.yieldDescription || '';
        const baseYield = parseInt(yieldDesc.match(/\d+/)?.[0] || '1');
        const scaledYield = Math.round(baseYield * yieldScale);
        const yieldText = yieldDesc.replace(/\d+/, scaledYield.toString());
        rendered = rendered.replace(/{yield}/g, yieldText);

        // Replace {amount:Ingredient Name}
        const amountRegex = /\{amount:([^}]+)\}/g;
        rendered = rendered.replace(amountRegex, (match, ingName) => {
            const ingredient = recipe.ingredients.find(i => i.name === ingName);
            if (!ingredient) return match;

            const scale = selectedServings / recipe.servings;
            const scaledValue = Math.round((ingredient.amountValue || 0) * scale);

            if (ingredient.amountUnit === 'gab') {
                return `${scaledValue} gab`;
            }
            return `${scaledValue}${ingredient.amountUnit || ''}`;
        });

        return rendered;
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');
        setProgress(0);
        setPriceData({ totalRimi: 0, totalMaxima: 0, ingredients: {} });
        setSelectedProducts({});

        const fetchPrices = async () => {
            try {
                const response = await fetch(`/api/recipes/${recipe.id}/price`);
                if (!response.ok) throw new Error('Failed to start price calculation');
                if (!response.body) throw new Error('No readable stream');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let loadedCount = 0;
                const totalCount = recipe.ingredients.length;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (!active) return;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const data = JSON.parse(line);
                            setPriceData(prev => {
                                const newIngredients = { ...prev.ingredients, [data.name]: data };
                                let rimi = 0, maxima = 0;
                                Object.entries(newIngredients).forEach(([name, ing]: [string, any]) => {
                                    const ingredient = recipe.ingredients.find(i => i.name === name);
                                    if (!ingredient) return;

                                    if (ing.rimi) {
                                        const qty = calculateProductQuantity(ingredient, ing.rimi);
                                        rimi += ing.rimi.price * qty;
                                    }
                                    if (ing.maxima) {
                                        const qty = calculateProductQuantity(ingredient, ing.maxima);
                                        maxima += ing.maxima.price * qty;
                                    }
                                });
                                return { ingredients: newIngredients, totalRimi: rimi, totalMaxima: maxima };
                            });
                            loadedCount++;
                            setProgress((loadedCount / totalCount) * 100);
                        } catch (e) { console.error('JSON parse error', e); }
                    }
                }
                setLoading(false);
            } catch (err: any) {
                if (active) { setError(err.message); setLoading(false); }
            }
        };

        fetchPrices();
        return () => { active = false; };
    }, [recipe.id, recipe.ingredients.length]);

    const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
        new Set(recipe.ingredients
            .filter(i => {
                const name = i.name.toLowerCase();
                return !name.includes('sāls') && !name.includes('pipar');
            })
            .map(i => i.name)
        )
    );

    // Get effective product (selected override or default)
    const getEffectiveProduct = (name: string, store: 'rimi' | 'maxima'): Product | null => {
        const override = selectedProducts[name]?.[store];
        if (override) return override;
        return priceData.ingredients[name]?.[store] || null;
    };

    // Get quantity of product needed for ingredient
    const getIngredientQuantity = (ing: typeof recipe.ingredients[0], store: 'rimi' | 'maxima'): number => {
        const product = getEffectiveProduct(ing.name, store);
        return calculateProductQuantity(ing, product);
    };

    // Calculate dynamic totals using selected products and quantities
    const dynamicTotals = {
        rimi: recipe.ingredients
            .filter(i => selectedIngredients.has(i.name))
            .reduce((sum, i) => {
                const product = getEffectiveProduct(i.name, 'rimi');
                const qty = calculateProductQuantity(i, product);
                return sum + (product?.price || 0) * qty;
            }, 0),
        maxima: recipe.ingredients
            .filter(i => selectedIngredients.has(i.name))
            .reduce((sum, i) => {
                const product = getEffectiveProduct(i.name, 'maxima');
                const qty = calculateProductQuantity(i, product);
                return sum + (product?.price || 0) * qty;
            }, 0)
    };

    const toggleIngredient = (name: string) => {
        const next = new Set(selectedIngredients);
        if (next.has(name)) next.delete(name); else next.add(name);
        setSelectedIngredients(next);
    };

    const selectProduct = (ingredientName: string, store: 'rimi' | 'maxima', product: Product) => {
        setSelectedProducts(prev => ({
            ...prev,
            [ingredientName]: { ...prev[ingredientName], [store]: product }
        }));
    };

    const formatPrice = (price: number) => `€${Math.max(0, price).toFixed(2)}`;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Atpakaļ uz receptēm
            </Link>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Recipe Info */}
                <div className="space-y-8">
                    <div className="aspect-video rounded-3xl overflow-hidden relative shadow-2xl ring-1 ring-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={recipe.image} alt={recipe.title} className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <h1 className="text-4xl font-bold text-white mb-2">{recipe.title}</h1>
                            <p className="text-white/80">{recipe.description}</p>
                        </div>
                    </div>

                    {/* Serving Selector */}
                    <div className="glass p-6 rounded-3xl">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="font-semibold">Personu skaits</p>
                                    <p className="text-xs text-muted-foreground">
                                        {recipe.yieldPerServing && `${recipe.yieldPerServing} katrai personai`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedServings(Math.max(1, selectedServings - 1))}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-3xl font-bold w-12 text-center">{selectedServings}</span>
                                <button
                                    onClick={() => setSelectedServings(Math.min(20, selectedServings + 1))}
                                    className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {recipe.yieldDescription && (
                            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Kopā: <span className="text-foreground font-semibold">
                                        ~{Math.round(parseInt(recipe.yieldDescription.match(/\d+/)?.[0] || '0') / recipe.servings * selectedServings)} {recipe.yieldDescription.replace(/~?\d+\s*/, '')}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Ingredients List */}
                    <div className="glass p-8 rounded-3xl space-y-4">
                        <h2 className="text-2xl font-semibold">Sastāvdaļas</h2>
                        <p className="text-sm text-muted-foreground">
                            Daudzumi {selectedServings === recipe.servings ? `${recipe.servings} porcijām` : <span className="text-primary font-medium">{selectedServings} porcijām</span>}
                        </p>
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ing, idx) => {
                                // Scale amount by servings - always round to whole numbers
                                const scale = selectedServings / recipe.servings;
                                const scaledValue = ing.amountValue ? Math.round(ing.amountValue * scale) : null;
                                const displayAmount = scaledValue && ing.amountUnit
                                    ? `${scaledValue} ${ing.amountUnit}`
                                    : ing.amount;
                                return (
                                    <li key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                                        <span className="font-medium">{cleanIngredientName(ing.name)}</span>
                                        <span className={clsx("font-semibold", selectedServings !== recipe.servings && "text-primary")}>
                                            {displayAmount}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="glass p-8 rounded-3xl space-y-6">
                        <h2 className="text-2xl font-semibold">Pagatavošana</h2>
                        <div className="space-y-6 text-muted-foreground">
                            {recipe.instructions.map((step, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                        {idx + 1}
                                    </span>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                            {renderInstruction(step)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Price Analysis */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold flex items-center">
                        <ShoppingCart className="w-6 h-6 mr-3 text-primary" />
                        Cenu Analīze
                    </h2>

                    {loading ? (
                        <div className="glass p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                            <div className="relative w-24 h-24 mb-4">
                                <Loader2 className="w-24 h-24 text-primary animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold">{Math.round(progress)}%</span>
                                </div>
                            </div>
                            <div className="space-y-2 max-w-xs">
                                <h3 className="text-xl font-medium">Meklējam izdevīgākās cenas...</h3>
                                <p className="text-muted-foreground text-sm">Salīdzinām Rimi un Barbora (Maxima) piedāvājumus</p>
                            </div>
                            <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="glass p-8 rounded-3xl border-destructive/50 text-destructive flex items-center">
                            <AlertCircle className="w-6 h-6 mr-4" />
                            Kaut kas nogāja greizi: {error}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Total Comparison Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={clsx(
                                    "p-6 rounded-2xl border transition-all duration-300",
                                    dynamicTotals.rimi < dynamicTotals.maxima
                                        ? "bg-primary/10 border-primary ring-2 ring-primary/20 scale-105"
                                        : "glass border-transparent opacity-80"
                                )}>
                                    <h3 className="text-lg font-medium mb-1">Rimi</h3>
                                    <p className="text-3xl font-bold text-foreground">{formatPrice(dynamicTotals.rimi)}</p>
                                    {dynamicTotals.rimi < dynamicTotals.maxima &&
                                        <span className="inline-block mt-2 text-xs font-bold text-primary bg-primary/20 px-2 py-1 rounded-full">
                                            LABĀKĀ CENA
                                        </span>
                                    }
                                </div>
                                <div className={clsx(
                                    "p-6 rounded-2xl border transition-all duration-300",
                                    dynamicTotals.maxima < dynamicTotals.rimi
                                        ? "bg-red-500/10 border-red-500 ring-2 ring-red-500/20 scale-105"
                                        : "glass border-transparent opacity-80"
                                )}>
                                    <h3 className="text-lg font-medium mb-1">Maxima (Barbora)</h3>
                                    <p className="text-3xl font-bold text-foreground">{formatPrice(dynamicTotals.maxima)}</p>
                                    {dynamicTotals.maxima < dynamicTotals.rimi &&
                                        <span className="inline-block mt-2 text-xs font-bold text-red-400 bg-red-400/20 px-2 py-1 rounded-full">
                                            LABĀKĀ CENA
                                        </span>
                                    }
                                </div>
                            </div>

                            {/* Ingredient Breakdown */}
                            <div className="glass rounded-3xl overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="font-semibold">Sastāvdaļu Saraksts</h3>
                                    <span className="text-xs text-muted-foreground">Spied "Mainīt" lai izvēlētos citu produktu</span>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {recipe.ingredients.map((ing) => {
                                        const data = priceData.ingredients[ing.name];
                                        const isSelected = selectedIngredients.has(ing.name);
                                        const effectiveRimi = getEffectiveProduct(ing.name, 'rimi');
                                        const effectiveMaxima = getEffectiveProduct(ing.name, 'maxima');
                                        const rimiQty = calculateProductQuantity(ing, effectiveRimi);
                                        const maximaQty = calculateProductQuantity(ing, effectiveMaxima);

                                        return (
                                            <div key={ing.name} className={clsx(
                                                "p-4 grid grid-cols-12 gap-4 items-center transition-colors",
                                                !isSelected ? "opacity-50 hover:opacity-60 bg-black/20" : "hover:bg-white/5"
                                            )}>
                                                <div className="col-span-1 flex justify-center">
                                                    <button
                                                        onClick={() => toggleIngredient(ing.name)}
                                                        className={clsx(
                                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-white/20 hover:border-white/40"
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="col-span-3">
                                                    <p className={clsx("font-medium", !isSelected && "line-through decoration-white/30")}>{cleanIngredientName(ing.name)}</p>
                                                    <p className="text-xs text-muted-foreground">{ing.amount}</p>
                                                </div>

                                                {/* Rimi Price */}
                                                <div className={clsx("col-span-4 text-center p-2 rounded-lg relative group/item", isSelected && data?.bestStore === 'rimi' && "bg-primary/10 text-primary")}>
                                                    {effectiveRimi ? (
                                                        <div className="text-sm">
                                                            <div className={clsx("font-bold flex items-center justify-center gap-1", !isSelected && "line-through text-muted-foreground")}>
                                                                {formatPrice(effectiveRimi.price * rimiQty)}
                                                                {rimiQty > 1 && <span className="text-[9px] bg-primary/30 text-primary px-1 rounded">x{rimiQty}</span>}
                                                            </div>
                                                            <a href={effectiveRimi.url} target="_blank" rel="noopener noreferrer"
                                                                className="text-[10px] opacity-70 hover:opacity-100 hover:underline block mt-1 leading-tight truncate px-1" title={effectiveRimi.name}>
                                                                {effectiveRimi.name}
                                                            </a>
                                                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                                                {effectiveRimi.pricePerUnit && (
                                                                    <span className="text-[9px] text-muted-foreground">{effectiveRimi.pricePerUnit}</span>
                                                                )}
                                                                {effectiveRimi.isBulk && (
                                                                    <span className="text-[8px] px-1 py-0.5 rounded-sm bg-primary/20 text-primary uppercase font-bold" title="Cena aprēķināta pēc svara">Sverams</span>
                                                                )}
                                                            </div>
                                                            <ProductPicker
                                                                alternatives={data?.rimiAlternatives || []}
                                                                selected={effectiveRimi}
                                                                onSelect={(p) => selectProduct(ing.name, 'rimi', p)}
                                                                store="rimi"
                                                            />
                                                        </div>
                                                    ) : <span className="text-muted-foreground">-</span>}
                                                </div>

                                                {/* Maxima Price */}
                                                <div className={clsx("col-span-4 text-center p-2 rounded-lg relative group/item", isSelected && data?.bestStore === 'maxima' && "bg-red-500/10 text-red-500")}>
                                                    {effectiveMaxima ? (
                                                        <div className="text-sm">
                                                            <div className={clsx("font-bold flex items-center justify-center gap-1", !isSelected && "line-through text-muted-foreground")}>
                                                                {formatPrice(effectiveMaxima.price * maximaQty)}
                                                                {maximaQty > 1 && <span className="text-[9px] bg-red-500/30 text-red-400 px-1 rounded">x{maximaQty}</span>}
                                                            </div>
                                                            <a href={effectiveMaxima.url} target="_blank" rel="noopener noreferrer"
                                                                className="text-[10px] opacity-70 hover:opacity-100 hover:underline block mt-1 leading-tight truncate px-1" title={effectiveMaxima.name}>
                                                                {effectiveMaxima.name}
                                                            </a>
                                                            <div className="flex items-center justify-center gap-1.5 mt-1">
                                                                {effectiveMaxima.pricePerUnit && (
                                                                    <span className="text-[9px] text-muted-foreground">{effectiveMaxima.pricePerUnit}</span>
                                                                )}
                                                                {effectiveMaxima.isBulk && (
                                                                    <span className="text-[8px] px-1 py-0.5 rounded-sm bg-red-500/20 text-red-400 uppercase font-bold" title="Cena aprēķināta pēc svara">Sverams</span>
                                                                )}
                                                            </div>
                                                            <ProductPicker
                                                                alternatives={data?.maximaAlternatives || []}
                                                                selected={effectiveMaxima}
                                                                onSelect={(p) => selectProduct(ing.name, 'maxima', p)}
                                                                store="maxima"
                                                            />
                                                        </div>
                                                    ) : <span className="text-muted-foreground">-</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button className="flex flex-col items-center justify-center py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    <div className="flex items-center mb-1 text-lg">
                                        <ShoppingBasket className="w-5 h-5 mr-2" /> Pasūtīt Rimi
                                    </div>
                                    <span className="text-sm opacity-90">Kopā: {formatPrice(dynamicTotals.rimi)}</span>
                                </button>

                                <button className="flex flex-col items-center justify-center py-4 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    <div className="flex items-center mb-1 text-lg">
                                        <ShoppingBasket className="w-5 h-5 mr-2" /> Pasūtīt Maxima
                                    </div>
                                    <span className="text-sm opacity-90">Kopā: {formatPrice(dynamicTotals.maxima)}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
