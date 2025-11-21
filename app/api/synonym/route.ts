import { generateObject, gateway } from 'ai';
import { z } from 'zod';
import { validateInput } from '@/lib/utils';

export async function POST(req: Request) {
    const { word }: { word: string } = await req.json();

    // Validate word
    const validation = validateInput(word);
    if (!validation.valid) {
        return Response.json(
            { error: validation.error },
            { status: 400 }
        );
    }

    const result = await generateObject({
        model: gateway('mistral/ministral-3b'),
        schema: z.object({
            synonyms: z.array(z.string()).describe('A list of exactly 6 synonyms for the given word.'),
        }),
        mode: 'json',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that provides synonyms. Provide exactly 6 synonyms.',
            },
            {
                role: 'user',
                content: `Give me exactly 6 alternatives for: "${word}"`,
            },
        ],
    });

    return Response.json(result.object);
}
