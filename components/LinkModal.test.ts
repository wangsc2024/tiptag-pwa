
import { describe, it, expect } from 'vitest';
import { Document } from '../types';

// Mock document data for testing
const mockDocuments: Document[] = [
    { id: 'doc1', title: 'First Document', content: '<p>Content 1</p>', updatedAt: 1000 },
    { id: 'doc2', title: 'Second Document', content: '<p>Content 2</p>', updatedAt: 2000 },
    { id: 'doc3', title: 'Another Page', content: '<p>Content 3</p>', updatedAt: 3000 },
];

describe('LinkModal Logic', () => {
    describe('URL Mode', () => {
        it('should format URL with https if protocol missing', () => {
            const url = 'example.com';
            const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
            expect(formattedUrl).toBe('https://example.com');
        });

        it('should keep URL unchanged if protocol exists', () => {
            const url = 'https://example.com';
            const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
            expect(formattedUrl).toBe('https://example.com');
        });

        it('should handle http protocol', () => {
            const url = 'http://example.com';
            const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
            expect(formattedUrl).toBe('http://example.com');
        });
    });

    describe('Internal Link Mode', () => {
        it('should filter documents by search term', () => {
            const searchTerm = 'first';
            const filtered = mockDocuments.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            expect(filtered.length).toBe(1);
            expect(filtered[0].id).toBe('doc1');
        });

        it('should return all documents when search is empty', () => {
            const searchTerm = '';
            const filtered = mockDocuments.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            expect(filtered.length).toBe(3);
        });

        it('should return empty when no match', () => {
            const searchTerm = 'xyz123';
            const filtered = mockDocuments.filter(doc =>
                doc.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            expect(filtered.length).toBe(0);
        });

        it('should create internal link format correctly', () => {
            const docId = 'doc1';
            const internalUrl = `internal://${docId}`;
            expect(internalUrl).toBe('internal://doc1');
        });
    });

    describe('Anchor Link Mode', () => {
        it('should create anchor link format correctly', () => {
            const anchorId = 'section-1';
            const anchorUrl = `#${anchorId}`;
            expect(anchorUrl).toBe('#section-1');
        });

        it('should replace spaces with dashes in anchor ID', () => {
            const anchorId = 'my section name';
            const sanitized = anchorId.replace(/\s/g, '-');
            expect(sanitized).toBe('my-section-name');
        });
    });

    describe('Link Type Detection', () => {
        it('should detect internal link', () => {
            const url = 'internal://doc1';
            const isInternal = url.startsWith('internal://');
            expect(isInternal).toBe(true);
        });

        it('should detect anchor link', () => {
            const url = '#section-1';
            const isAnchor = url.startsWith('#');
            expect(isAnchor).toBe(true);
        });

        it('should detect external URL', () => {
            const url = 'https://example.com';
            const isExternal = !url.startsWith('internal://') && !url.startsWith('#');
            expect(isExternal).toBe(true);
        });
    });

    describe('Linked Document Title', () => {
        it('should find linked document title', () => {
            const initialUrl = 'internal://doc2';
            const docId = initialUrl.replace('internal://', '');
            const doc = mockDocuments.find(d => d.id === docId);
            expect(doc?.title).toBe('Second Document');
        });

        it('should return undefined for non-existent document', () => {
            const initialUrl = 'internal://nonexistent';
            const docId = initialUrl.replace('internal://', '');
            const doc = mockDocuments.find(d => d.id === docId);
            expect(doc).toBeUndefined();
        });
    });
});
