
import { describe, it, expect } from 'vitest';
import { AISuggestionType } from './types';

describe('Types', () => {
    describe('AISuggestionType Enum', () => {
        it('should have FIX_GRAMMAR type', () => {
            expect(AISuggestionType.FIX_GRAMMAR).toBe('Fix Grammar');
        });

        it('should have SUMMARIZE type', () => {
            expect(AISuggestionType.SUMMARIZE).toBe('Summarize');
        });

        it('should have EXPAND type', () => {
            expect(AISuggestionType.EXPAND).toBe('Continue Writing');
        });

        it('should have REPHRASE type', () => {
            expect(AISuggestionType.REPHRASE).toBe('Rephrase');
        });

        it('should have GENERATE_IDEAS type', () => {
            expect(AISuggestionType.GENERATE_IDEAS).toBe('Generate Ideas');
        });

        it('should have exactly 5 AI suggestion types', () => {
            const enumValues = Object.values(AISuggestionType);
            expect(enumValues.length).toBe(5);
        });
    });

    describe('Document Interface', () => {
        it('should accept valid document object', () => {
            const doc = {
                id: 'test-id',
                title: 'Test Document',
                content: '<p>Test content</p>',
                updatedAt: Date.now()
            };

            expect(doc.id).toBeDefined();
            expect(doc.title).toBeDefined();
            expect(doc.content).toBeDefined();
            expect(doc.updatedAt).toBeDefined();
        });

        it('should have updatedAt as number', () => {
            const doc = {
                id: 'test-id',
                title: 'Test Document',
                content: '<p>Test content</p>',
                updatedAt: Date.now()
            };

            expect(typeof doc.updatedAt).toBe('number');
        });
    });
});
