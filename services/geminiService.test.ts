
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAIContent, _setClient } from './geminiService';
import { AISuggestionType } from '../types';

describe('Gemini Service', () => {
    const mockGenerateContent = vi.fn();
    
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.API_KEY = 'test-key';
        
        // Inject mock client
        _setClient({
            models: {
                generateContent: mockGenerateContent
            }
        });
    });

    it('should call generateContent with the correct model and prompt for Grammar Fix', async () => {
        mockGenerateContent.mockResolvedValue({
            text: 'Corrected text'
        });

        const result = await generateAIContent(AISuggestionType.FIX_GRAMMAR, 'bad grammer');

        expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gemini-3-flash-preview'
        }));
        expect(result).toBe('Corrected text');
    });

    it('should call generateContent with the correct prompt for Summarization', async () => {
        mockGenerateContent.mockResolvedValue({
            text: 'Summary'
        });

        await generateAIContent(AISuggestionType.SUMMARIZE, 'Long text...');

        expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gemini-3-flash-preview'
        }));
    });

    it('should handle API errors gracefully', async () => {
        mockGenerateContent.mockRejectedValue(new Error('API Error'));

        await expect(generateAIContent(AISuggestionType.EXPAND, 'text'))
            .rejects
            .toThrow('Failed to generate content. Please try again.');
    });
});
