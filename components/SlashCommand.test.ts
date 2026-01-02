
import { describe, it, expect } from 'vitest';
import { getSuggestionItems } from './SlashCommand';

describe('Slash Command Logic', () => {
    it('should return all items when query is empty', () => {
        const items = getSuggestionItems({ query: '' });
        // We expect at least Headings, Lists, Quote, Code, Divider, Image
        expect(items.length).toBeGreaterThan(5);
    });

    it('should filter items based on query "Head"', () => {
        const items = getSuggestionItems({ query: 'Head' });
        // Heading 1 and Heading 2
        expect(items.length).toBeGreaterThanOrEqual(2);
        expect(items[0].title).toBe('Heading 1');
    });

    it('should filter items based on query "List"', () => {
        const items = getSuggestionItems({ query: 'List' });
        // Bullet List, Ordered List, Task List
        expect(items.length).toBeGreaterThanOrEqual(2);
        expect(items.some(i => i.title === 'Bullet List')).toBe(true);
    });

    it('should find Image command', () => {
        const items = getSuggestionItems({ query: 'ima' });
        expect(items.length).toBe(1);
        expect(items[0].title).toBe('Image');
    });

    it('should return empty array for non-matching query', () => {
        const items = getSuggestionItems({ query: 'xyz123' });
        expect(items.length).toBe(0);
    });

    it('should find Quote command', () => {
        const items = getSuggestionItems({ query: 'quote' });
        expect(items.length).toBe(1);
        expect(items[0].title).toBe('Quote');
    });

    it('should find Code Block command', () => {
        const items = getSuggestionItems({ query: 'code' });
        expect(items.length).toBe(1);
        expect(items[0].title).toBe('Code Block');
    });

    it('should find Divider command', () => {
        const items = getSuggestionItems({ query: 'div' });
        expect(items.length).toBe(1);
        expect(items[0].title).toBe('Divider');
    });

    it('should find Task List command', () => {
        const items = getSuggestionItems({ query: 'task' });
        expect(items.length).toBe(1);
        expect(items[0].title).toBe('Task List');
    });

    it('should be case insensitive', () => {
        const itemsLower = getSuggestionItems({ query: 'bullet' });
        const itemsUpper = getSuggestionItems({ query: 'BULLET' });
        expect(itemsLower.length).toBe(itemsUpper.length);
    });

    it('should have command function on each item', () => {
        const items = getSuggestionItems({ query: '' });
        items.forEach(item => {
            expect(typeof item.command).toBe('function');
        });
    });

    it('should have title on each item', () => {
        const items = getSuggestionItems({ query: '' });
        items.forEach(item => {
            expect(item.title).toBeDefined();
            expect(item.title.length).toBeGreaterThan(0);
        });
    });

    it('should have icon on each item', () => {
        const items = getSuggestionItems({ query: '' });
        items.forEach(item => {
            expect(item.icon).toBeDefined();
        });
    });
});
