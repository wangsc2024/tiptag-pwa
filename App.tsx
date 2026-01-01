import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import TemplateModal from './components/TemplateModal';
import GitHubSyncModal from './components/GitHubSyncModal';
import { Document } from './types';
import { Template } from './services/templates';
import { getDocuments, saveDocuments, createDocument, updateDocument, deleteDocument } from './services/storage';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Load documents on mount
  useEffect(() => {
    const loadedDocs = getDocuments();
    setDocuments(loadedDocs);
    if (loadedDocs.length > 0) {
      setActiveDocId(loadedDocs[0].id);
    } else {
        const newDoc = createDocument();
        setDocuments([newDoc]);
        setActiveDocId(newDoc.id);
    }
  }, []);

  const handleCreateDocument = () => {
    const newDoc = createDocument();
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  const handleTemplateSelect = (template: Template) => {
    const newDoc = createDocument();
    // Update the newly created doc with template content
    const updatedDocs = updateDocument(newDoc.id, { 
        title: template.name,
        content: template.content 
    });
    setDocuments(updatedDocs);
    setActiveDocId(newDoc.id);
    setIsTemplateModalOpen(false);
  };

  const handlePullComplete = (pulledDocs: Document[]) => {
      // Merge strategy: Overwrite local if ID matches, else add.
      // This is a simple strategy. In a real app, you'd handle conflicts.
      const currentDocs = getDocuments();
      const mergedMap = new Map<string, Document>();
      
      currentDocs.forEach(d => mergedMap.set(d.id, d));
      pulledDocs.forEach(d => mergedMap.set(d.id, d));
      
      const mergedDocs = Array.from(mergedMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
      
      saveDocuments(mergedDocs);
      setDocuments(mergedDocs);
      if (mergedDocs.length > 0) {
          setActiveDocId(mergedDocs[0].id);
      }
      setIsSyncModalOpen(false);
  };

  const handleUpdateContent = (content: string) => {
    if (!activeDocId) return;
    const updatedDocs = updateDocument(activeDocId, { content });
    setDocuments(updatedDocs);
  };

  const handleUpdateTitle = (title: string) => {
    if (!activeDocId) return;
    const updatedDocs = updateDocument(activeDocId, { title });
    setDocuments(updatedDocs);
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocs = deleteDocument(id);
    setDocuments(updatedDocs);
    if (activeDocId === id) {
      setActiveDocId(updatedDocs.length > 0 ? updatedDocs[0].id : null);
    }
  };

  const activeDoc = documents.find(d => d.id === activeDocId);

  return (
    <div className="flex h-screen w-full bg-white text-slate-900">
      <Sidebar 
        documents={documents}
        activeDocId={activeDocId}
        onSelect={setActiveDocId}
        onCreate={handleCreateDocument}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onDelete={handleDeleteDocument}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden absolute top-4 left-4 z-20">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-white rounded-md shadow-sm border border-gray-200 text-gray-500"
             >
                <Menu className="w-5 h-5" />
             </button>
        </div>

        {activeDoc ? (
          <Editor 
            key={activeDoc.id} // Key prop ensures editor remounts/resets correctly on doc switch
            content={activeDoc.content}
            title={activeDoc.title}
            onUpdate={handleUpdateContent}
            onTitleChange={handleUpdateTitle}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
            <div className="text-center">
                <p className="mb-4">No document selected</p>
                <button 
                    onClick={handleCreateDocument}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Create a Document
                </button>
            </div>
          </div>
        )}
      </div>

      <TemplateModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={handleTemplateSelect}
      />

      <GitHubSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        documents={documents}
        onPullComplete={handlePullComplete}
      />
    </div>
  );
};

export default App;