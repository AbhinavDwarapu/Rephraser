import { generateObject, gateway } from 'ai';
import { z } from 'zod';
import { validateInput } from '@/lib/utils';

export async function POST(req: Request) {
    const { sentence, sentiment }: { sentence: string; sentiment: string } = await req.json();

    // Validate sentence
    const validation = validateInput(sentence);
    if (!validation.valid) {
        return Response.json(
            { error: validation.error },
            { status: 400 }
        );
    }

    // Validate sentiment
    if (!sentiment || sentiment.trim() === '') {
        return Response.json(
            { error: 'Sentiment cannot be empty' },
            { status: 400 }
        );
    }

    const isStarMethod = sentiment.toLowerCase() === 'star method';

    let schema;
    let systemPrompt;
    let userPrompt;

    if (isStarMethod) {
        schema = z.object({
            situation: z.string().describe('The context or situation'),
            task: z.string().describe('The objective or challenge'),
            action: z.string().describe('The specific steps taken'),
            result: z.string().describe('The outcome or impact'),
        });
        systemPrompt = 'You are a helpful assistant that rephrases sentences using the STAR method.';
        userPrompt = `Rephrase the following sentence using the STAR method framework: "${sentence}"`;
    } else {
        schema = z.object({
            rephrased: z.string().describe(`The rephrased sentence matching the '${sentiment}' tone.`),
        });
        systemPrompt = `You are a helpful assistant that rephrases sentences to be ${sentiment}.`;
        userPrompt = `Rephrase the following sentence: "${sentence}"`;
    }

    const result = await generateObject({
        model: isStarMethod ? gateway("openai/gpt-oss-safeguard-20b") : gateway('mistral/ministral-3b'),
        schema: schema,
        mode: 'json',
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: userPrompt,
            },
        ],
    });

    return Response.json(result.object);
}