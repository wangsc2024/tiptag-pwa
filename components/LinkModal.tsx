import React, { useState, useEffect } from 'react';
import { Document } from '../types';
import { X, Search, FileText, Globe, Link as LinkIcon, Plus, ExternalLink, Trash2, Bookmark } from 'lucide-react';

interface LinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (url: string) => void;
    onCreateDocument?: () => Document;
    documents: Document[];
    initialUrl?: string;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSave, onCreateDocument, documents, initialUrl = '' }) => {
    const [mode, setMode] = useState<'url' | 'internal' | 'anchor'>('url');
    const [url, setUrl] = useState('');
    const [anchorId, setAnchorId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setUrl(initialUrl || '');
            setSearchTerm('');
            setSelectedDocId(null);
            if (initialUrl?.startsWith('internal://')) {
                setMode('internal');
                setSelectedDocId(initialUrl.replace('internal://', ''));
            } else if (initialUrl?.startsWith('#')) {
                setMode('anchor');
                setAnchorId(initialUrl.slice(1));
            } else {
                setMode('url');
            }
        }
    }, [isOpen, initialUrl]);

    if (!isOpen) return null;

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        if (mode === 'url' && url.trim()) {
            // Ensure URL has protocol
            const finalUrl = url.startsWith('http') ? url : `https://${url}`;
            onSave(finalUrl);
        } else if (mode === 'anchor' && anchorId.trim()) {
            onSave(`#${anchorId}`);
        }
        onClose();
    };

    const handleSelectDoc = (docId: string) => {
        setSelectedDocId(docId);
    };

    const handleSavePageLink = () => {
        if (selectedDocId) {
            onSave(`internal://${selectedDocId}`);
            onClose();
        }
    };

    const handleRemoveLink = () => {
        onSave('');
        onClose();
    };

    const handleCreateAndLink = () => {
        if (onCreateDocument) {
            const newDoc = onCreateDocument();
            onSave(`internal://${newDoc.id}`);
            onClose();
        }
    };

    const getLinkedDocTitle = () => {
        if (initialUrl?.startsWith('internal://')) {
            const docId = initialUrl.replace('internal://', '');
            const doc = documents.find(d => d.id === docId);
            return doc?.title || 'Unknown Document';
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Insert Link</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Link Preview for existing links */}
                {initialUrl && (
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm">
                                {initialUrl.startsWith('internal://') ? (
                                    <>
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        <span className="text-gray-600">Linked to: </span>
                                        <span className="font-medium text-indigo-600">{getLinkedDocTitle()}</span>
                                    </>
                                ) : initialUrl.startsWith('#') ? (
                                    <>
                                        <Bookmark className="w-4 h-4 text-amber-500" />
                                        <span className="text-gray-600">Anchor: </span>
                                        <span className="font-medium text-amber-600">{initialUrl}</span>
                                    </>
                                ) : (
                                    <>
                                        <Globe className="w-4 h-4 text-green-500" />
                                        <span className="text-gray-600 truncate max-w-[200px]">{initialUrl}</span>
                                        <a
                                            href={initialUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleRemoveLink}
                                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                            </button>
                        </div>
                    </div>
                )}

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
                    <button
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'anchor' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setMode('anchor')}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <Bookmark className="w-4 h-4" />
                            <span>Anchor</span>
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
                                <p className="mt-1 text-xs text-gray-400">Enter a web address to link to</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!url.trim()}
                                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Set Link
                            </button>
                        </div>
                    ) : mode === 'anchor' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Anchor ID</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                                    <input
                                        type="text"
                                        value={anchorId}
                                        onChange={(e) => setAnchorId(e.target.value.replace(/\s/g, '-'))}
                                        placeholder="section-name"
                                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">Jump to a specific section in the current document</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!anchorId.trim()}
                                className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Set Anchor Link
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
                            <div className="flex-1 overflow-y-auto space-y-1 pr-1 mb-3">
                                {/* Create new document option */}
                                {onCreateDocument && (
                                    <button
                                        onClick={handleCreateAndLink}
                                        className="w-full flex items-center text-left p-2 hover:bg-green-50 rounded-lg transition-colors group border-2 border-dashed border-gray-200 hover:border-green-300 mb-2"
                                    >
                                        <div className="p-2 bg-green-100 text-green-600 rounded-md mr-3">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-green-700">Create new page</div>
                                            <div className="text-xs text-gray-400">Create and link to a new document</div>
                                        </div>
                                    </button>
                                )}
                                {filteredDocs.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleSelectDoc(doc.id)}
                                        className={`w-full flex items-center text-left p-2 rounded-lg transition-colors group ${
                                            selectedDocId === doc.id
                                                ? 'bg-indigo-100 ring-2 ring-indigo-500'
                                                : 'hover:bg-indigo-50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-md mr-3 ${
                                            selectedDocId === doc.id
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                        }`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${
                                                selectedDocId === doc.id ? 'text-indigo-900' : 'text-gray-900'
                                            }`}>{doc.title}</div>
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
                            <button
                                onClick={handleSavePageLink}
                                disabled={!selectedDocId}
                                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Set Page Link
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkModal;