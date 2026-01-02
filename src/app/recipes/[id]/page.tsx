import { RECIPES } from '@/data/recipes';
import RecipeDetailView from './view';

export async function generateStaticParams() {
    return RECIPES.map((recipe) => ({
        id: recipe.id,
    }));
}

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const recipe = RECIPES.find((r) => r.id === id);

    if (!recipe) {
        return <div>Recipe not found</div>;
    }

    return <RecipeDetailView recipe={recipe} />;
}
