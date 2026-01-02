import { NextResponse } from 'next/server';
import { rimiService } from '@/services/rimi';
import { barboraService } from '@/services/barbora';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const [rimiResults, barboraResults] = await Promise.all([
        rimiService.search(query),
        barboraService.search(query)
    ]);

    return NextResponse.json({
        query,
        results: {
            rimi: {
                count: rimiResults.length,
                items: rimiResults
            },
            barbora: { // mapped to Maxima in UI but source is Barbora
                count: barboraResults.length,
                items: barboraResults
            }
        }
    });
}
