import React, { useState } from 'react';
import { Document } from '../types';
import { Plus, Search, FileText, Trash2, Layout, Github, X, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  documents: Document[];
  activeDocId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onOpenTemplates: () => void;
  onOpenSync: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelect,
  onCreate,
  onOpenTemplates,
  onOpenSync,
  onDelete,
  isOpen,
  toggleSidebar
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
        {/* Mobile Overlay */}
        <div 
            className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleSidebar}
        />

        <div className={`
            fixed top-0 left-0 z-30 h-full w-72 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:static
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-indigo-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">TipTag</span>
                </div>
                <div className="flex space-x-1">
                    <button onClick={onOpenTemplates} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Templates">
                        <Layout className="w-5 h-5" />
                    </button>
                    <button onClick={onCreate} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-gray-600 transition-colors" title="New Document">
                        <Plus className="w-5 h-5" />
                    </button>
                    <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors lg:hidden" title="Close sidebar">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search documents..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-indigo-500 rounded-lg text-sm outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredDocs.length === 0 ? (
                <div className="text-center py-10 px-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                        {searchTerm ? 'No matches found' : 'No documents yet'}
                    </p>
                    <p className="text-gray-400 text-xs">
                        {searchTerm ? 'Try a different search term' : 'Create your first document'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={onCreate}
                            className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Create Document
                        </button>
                    )}
                </div>
            ) : (
                filteredDocs.map(doc => (
                    <div
                        key={doc.id}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            activeDocId === doc.id 
                            ? 'bg-white shadow-sm border border-gray-100' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        onClick={() => {
                            onSelect(doc.id);
                            if (window.innerWidth < 1024) toggleSidebar();
                        }}
                    >
                        <div className="min-w-0 flex-1">
                            <h3 className={`font-medium text-sm truncate ${activeDocId === doc.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                                {doc.title || 'Untitled'}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {formatDate(doc.updatedAt)}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if(confirm('Are you sure you want to delete this document?')) onDelete(doc.id);
                            }}
                            className="lg:opacity-0 lg:group-hover:opacity-100 opacity-100 p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-all text-gray-400 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))
            )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-white">
             <button
                onClick={onOpenSync}
                className="w-full flex items-center justify-center space-x-2 p-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
             >
                <Github className="w-4 h-4" />
                <span>Sync with GitHub</span>
             </button>
             <div className="mt-3 flex items-center justify-center space-x-1 text-xs text-gray-400">
                 <span>Powered by</span>
                 <span className="font-medium text-gray-500">Tiptap</span>
                 <span>&</span>
                 <span className="font-medium text-gray-500">Gemini AI</span>
             </div>
        </div>
    </div>
    </>
  );
};

export default Sidebar;