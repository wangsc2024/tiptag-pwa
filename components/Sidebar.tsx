import React, { useState } from 'react';
import { Document } from '../types';
import { Plus, Search, FileText, Trash2, Layout, Github } from 'lucide-react';

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
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Nova</span>
                </div>
                <div className="flex space-x-1">
                    <button onClick={onOpenTemplates} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Templates">
                        <Layout className="w-5 h-5" />
                    </button>
                    <button onClick={onCreate} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="New Document">
                        <Plus className="w-5 h-5" />
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
                <div className="text-center py-10 text-gray-400 text-sm">
                    No documents found.
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
        
        <div className="p-4 border-t border-gray-200">
             <button 
                onClick={onOpenSync}
                className="w-full flex items-center justify-center space-x-2 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
             >
                <Github className="w-4 h-4" />
                <span>Sync with GitHub</span>
             </button>
             <div className="mt-2 text-xs text-gray-400 text-center">
                 Powered by Tiptap & Gemini
             </div>
        </div>
    </div>
    </>
  );
};

export default Sidebar;