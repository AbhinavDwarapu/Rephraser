import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/synonym/route';

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
}));

describe('POST /api/synonym', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call streamText with correct parameters for synonym request', async () => {
        const req = new Request('http://localhost/api/synonym', {
            method: 'POST',
            body: JSON.stringify({
                word: 'happy',
            }),
        });

        await POST(req);

        expect(mockStreamText).toHaveBeenCalledWith({
            model: 'mistral/ministral-3b',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that provides synonyms. Always respond ONLY with comma-separated alternatives, no explanations, no numbering, no extra text.',
                },
                {
                    role: 'user',
                    content: expect.stringContaining('Give me exactly 6 alternatives for: "happy"'),
                },
            ],
        });

        expect(mockToUIMessageStreamResponse).toHaveBeenCalled();
    });

    it('should handle phrase synonym requests', async () => {
        const req = new Request('http://localhost/api/synonym', {
            method: 'POST',
            body: JSON.stringify({
                word: 'Sure thing',
            }),
        });

        await POST(req);

        expect(mockStreamText).toHaveBeenCalled();
        const callArgs = mockStreamText.mock.calls[0][0];
        expect(callArgs.messages[1].content).toContain('Sure thing');
        expect(mockToUIMessageStreamResponse).toHaveBeenCalled();
    });
});
