import { NextResponse } from 'next/server';
import { RECIPES } from '@/data/recipes';
import { pricerService } from '@/services/pricer';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const recipe = RECIPES.find(r => r.id === id);

    if (!recipe) {
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const stream = new ReadableStream({
        async start(controller) {
            try {
                await pricerService.streamPrices(recipe, (data) => {
                    const json = JSON.stringify(data);
                    controller.enqueue(new TextEncoder().encode(json + '\n'));
                });
                controller.close();
            } catch (error) {
                console.error('Streaming failed:', error);
                controller.error(error);
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Transfer-Encoding': 'chunked'
        }
    });
}
