import { Document } from '../types';

const STORAGE_KEY = 'nova_kb_documents';

// Helper to generate a random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const getDocuments = (): Document[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Return default welcome document if empty
      const defaultDoc: Document = {
        id: generateId(),
        title: 'Welcome to Nova',
        content: `
          <h1>Welcome to Nova Knowledge Base</h1>
          <p>This is a distraction-free editor powered by <strong>Tiptap</strong> and <strong>Google Gemini</strong>.</p>
          <h2>Features</h2>
          <ul>
            <li>Rich text editing</li>
            <li>AI-powered writing assistance</li>
            <li>Local storage persistence</li>
            <li>Clean, modern interface</li>
          </ul>
          <p>Try selecting this text and clicking the "AI Assist" button in the toolbar!</p>
        `,
        updatedAt: Date.now(),
      };
      saveDocuments([defaultDoc]);
      return [defaultDoc];
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load documents", e);
    return [];
  }
};

export const saveDocuments = (docs: Document[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error("Failed to save documents", e);
  }
};

export const createDocument = (): Document => {
  const newDoc: Document = {
    id: generateId(),
    title: 'Untitled Document',
    content: '<p></p>',
    updatedAt: Date.now(),
  };
  const docs = getDocuments();
  saveDocuments([newDoc, ...docs]);
  return newDoc;
};

export const updateDocument = (id: string, updates: Partial<Document>): Document[] => {
  const docs = getDocuments();
  const index = docs.findIndex(d => d.id === id);
  if (index !== -1) {
    docs[index] = { ...docs[index], ...updates, updatedAt: Date.now() };
    saveDocuments(docs);
  }
  return docs;
};

export const deleteDocument = (id: string): Document[] => {
  const docs = getDocuments().filter(d => d.id !== id);
  saveDocuments(docs);
  return docs;
};
