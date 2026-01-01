import React, { useState, useEffect } from 'react';
import { Document } from '../types';
import { X, Search, FileText, Globe, Link as LinkIcon } from 'lucide-react';

interface LinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (url: string) => void;
    documents: Document[];
    initialUrl?: string;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSave, documents, initialUrl = '' }) => {
    const [mode, setMode] = useState<'url' | 'internal'>('url');
    const [url, setUrl] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUrl(initialUrl);
            setMode(initialUrl.startsWith('internal://') ? 'internal' : 'url');
        }
    }, [isOpen, initialUrl]);

    if (!isOpen) return null;

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        if (mode === 'url') {
            onSave(url);
        }
        onClose();
    };

    const handleSelectDoc = (docId: string) => {
        onSave(`internal://${docId}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Insert Link</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-gray-100">
                    <button 
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'url' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setMode('url')}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Globe className="w-4 h-4" />
                            <span>Web URL</span>
                        </div>
                    </button>
                    <button 
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'internal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setMode('internal')}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Page Link</span>
                        </div>
                    </button>
                </div>

                <div className="p-6 h-[300px] flex flex-col">
                    {mode === 'url' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="url" 
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleSave}
                                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Set Link
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search documents..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-500 rounded-lg text-sm outline-none transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                                {filteredDocs.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleSelectDoc(doc.id)}
                                        className="w-full flex items-center text-left p-2 hover:bg-indigo-50 rounded-lg transition-colors group"
                                    >
                                        <div className="p-2 bg-gray-100 text-gray-500 rounded-md mr-3 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                            <div className="text-xs text-gray-400">{new Date(doc.updatedAt).toLocaleDateString()}</div>
                                        </div>
                                    </button>
                                ))}
                                {filteredDocs.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No documents found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkModal;