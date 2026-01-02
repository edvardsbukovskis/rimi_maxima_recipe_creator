import { NextResponse } from 'next/server';
import { RECIPES } from '@/data/recipes';

export async function GET() {
    return NextResponse.json(RECIPES);
}
