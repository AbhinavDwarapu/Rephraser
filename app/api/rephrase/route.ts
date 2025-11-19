import { streamText, gateway } from 'ai';

export async function POST(req: Request) {
    const { sentence, sentiment }: { sentence: string; sentiment: string } = await req.json();

    let userPrompt = '';

    if (!sentence || sentence.length > 1000) {
        return new Response('Invalid input', { status: 400 });
    }

    if (sentiment.toLowerCase() === 'star method') {
        userPrompt = `Rephrase the following sentence using the STAR method framework. Structure your response with these four sections clearly labeled:

Situation: Describe the context
Task: Explain the objective or challenge
Action: Detail the specific steps taken
Result: Highlight the outcome or impact

Original sentence: "${sentence}"

Provide a complete, professional, concise rephrasing following the STAR format.`;
    } else {
        userPrompt = `Rephrase the following sentence to be ${sentiment}. Only provide the rephrased sentence, nothing else.

Original sentence: "${sentence}"`;
    }

    const result = streamText({
        model: gateway('mistral/ministral-3b'),
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that rephrases sentences. Provide clear, concise responses without repeating yourself.',
            },
            {
                role: 'user',
                content: userPrompt,
            },
        ],
    });

    return result.toUIMessageStreamResponse();
}