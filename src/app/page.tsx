'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Recipe } from '@/types';
import { ChefHat, ShoppingBasket, ArrowRight } from 'lucide-react';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetch('/api/recipes')
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  return (
    <main className="min-h-screen p-8 md:p-24 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 ring-1 ring-primary/20">
            <ChefHat className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Recepšu Izmaksu Kalkulators
            </h1>
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Gatavo Gudrāk,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Pērc Lētāk.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Salīdzini sastāvdaļu cenas starp Rimi un Maxima (Barbora) reāllaikā.
            Izvēlies recepti un ietaupi naudu uzreiz.
          </p>
        </section>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="group">
              <div className="glass rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:ring-2 hover:ring-primary/50 relative">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{recipe.title}</h3>
                    <p className="text-white/80 text-sm flex items-center">
                      <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm mr-2">{recipe.prepTime}</span>
                      <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">{recipe.ingredients.length} sastāvdaļas</span>
                    </p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-muted-foreground line-clamp-2">{recipe.description}</p>
                  <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                    Salīdzināt Cenas <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
