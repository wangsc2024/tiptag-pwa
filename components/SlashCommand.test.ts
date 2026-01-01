
import { describe, it, expect } from '../lib/vitest';
import { getSuggestionItems } from './SlashCommand';

describe('Slash Command Logic', () => {
    it('should return all items when query is empty', () => {
        const items = getSuggestionItems({ query: '' });
        // We expect at least Headings, Lists, Quote, Code, Divider, Image
        expect(items.length).toBeGreaterThan(5);
    });

    it('should filter items based on query "Head"', () => {
        const items = getSuggestionItems({ query: 'Head' });
        expect(items.length).toBe(2);
        expect(items[0].title).toBe('Heading 1');
        expect(items[1].title).toBe('Heading 2');
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
});
