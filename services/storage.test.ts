
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDocuments, saveDocuments, createDocument, updateDocument, deleteDocument } from './storage';
import { Document } from '../types';

describe('Storage Service', () => {
    // Mock LocalStorage
    const localStorageMock = (() => {
        let store: Record<string, string> = {};
        return {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value.toString();
            }),
            clear: vi.fn(() => {
                store = {};
            }),
        };
    })();

    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
    });

    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('should initialize with a welcome document if storage is empty', () => {
        const docs = getDocuments();
        expect(docs.length).toBe(1);
        expect(docs[0].title).toBe('Welcome to Nova');
        expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it('should create a new document', () => {
        const newDoc = createDocument();
        const docs = getDocuments();
        
        // Should have welcome doc + new doc
        expect(docs.length).toBe(2); 
        expect(docs[0].id).toBe(newDoc.id); // Newest first
        expect(newDoc.title).toBe('Untitled Document');
    });

    it('should update an existing document', () => {
        const newDoc = createDocument();
        const updatedTitle = 'My Updated Title';
        
        updateDocument(newDoc.id, { title: updatedTitle });
        
        const docs = getDocuments();
        const updatedDoc = docs.find(d => d.id === newDoc.id);
        
        expect(updatedDoc?.title).toBe(updatedTitle);
    });

    it('should delete a document', () => {
        const doc1 = createDocument();
        const doc2 = createDocument();
        
        let docs = getDocuments();
        expect(docs.length).toBe(3); // Welcome + 2 created

        deleteDocument(doc1.id);
        
        docs = getDocuments();
        expect(docs.length).toBe(2);
        expect(docs.find(d => d.id === doc1.id)).toBeUndefined();
    });

    it('should handle corrupted local storage gracefully', () => {
        // @ts-ignore
        window.localStorage.getItem.mockReturnValue('invalid json');
        const docs = getDocuments();
        expect(docs).toEqual([]);
    });
});
