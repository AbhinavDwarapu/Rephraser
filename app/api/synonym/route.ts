import { streamText, gateway } from 'ai';
import { checkBotId } from 'botid/server';

export async function POST(req: Request) {
    // Bot detection
    const botDetection = await checkBotId();
    if (botDetection.isBot && !botDetection.isVerifiedBot) {
        return new Response('Bot detected', { status: 403 });
    }

    const { word }: { word: string } = await req.json();

    if (!word || word.length > 1000) {
        return new Response('Invalid input', { status: 400 });
    }

    const result = await streamText({
        model: gateway('mistral/ministral-3b'),
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant that provides synonyms. Always respond ONLY with comma-separated alternatives, no explanations, no numbering, no extra text.',
            },
            {
                role: 'user',
                content: `Give me exactly 6 alternatives for: "${word}"

FORMAT: alternative1, alternative2, alternative3, alternative4, alternative5, alternative6

Do not include any other text, explanations, or numbering. Only the comma-separated list.`,
            },
        ],
    });

    return result.toTextStreamResponse();
}
