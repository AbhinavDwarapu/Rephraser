import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/rephrase/route';

// Mock the ai module
const mockStreamText = vi.fn();
const mockToUIMessageStreamResponse = vi.fn();

// Mock botid/server
vi.mock('botid/server', () => ({
    checkBotId: vi.fn().mockResolvedValue({
        isBot: false,
        isVerifiedBot: false,
        isHuman: true,
        bypassed: false,
    }),
}));

vi.mock('ai', () => ({
    streamText: (args: any) => {
        mockStreamText(args);
        return {
            toUIMessageStreamResponse: mockToUIMessageStreamResponse,
        };
    },
    gateway: (model: string) => model,
    convertToModelMessages: (messages: any) => messages,
}));

describe('POST /api/rephrase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call streamText with correct parameters', async () => {
        const req = new Request('http://localhost/api/rephrase', {
            method: 'POST',
            body: JSON.stringify({
                sentence: 'Hello world',
                sentiment: 'professional',
            }),
        });

        await POST(req);

        expect(mockStreamText).toHaveBeenCalledWith({
            model: 'mistral/ministral-3b',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that rephrases sentences. Provide clear, concise responses without repeating yourself.',
                },
                {
                    role: 'user',
                    content: 'Rephrase the following sentence to be professional. Only provide the rephrased sentence, nothing else.\n\nOriginal sentence: "Hello world"',
                },
            ],
        });

        expect(mockToUIMessageStreamResponse).toHaveBeenCalled();
    });
});
