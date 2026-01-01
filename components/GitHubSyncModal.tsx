import React, { useState, useEffect } from 'react';
import { X, Github, UploadCloud, DownloadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { saveGithubConfig, getGithubConfig, syncToGithub, pullFromGithub } from '../services/githubService';
import { Document } from '../types';

interface GitHubSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    documents: Document[];
    onPullComplete: (docs: Document[]) => void;
}

const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose, documents, onPullComplete }) => {
    const [token, setToken] = useState('');
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            const config = getGithubConfig();
            if (config) {
                setToken(config.token);
                setOwner(config.owner);
                setRepo(config.repo);
            }
            setStatus('idle');
            setMessage('');
        }
    }, [isOpen]);

    const handleSaveConfig = () => {
        if (!token || !owner || !repo) {
            setStatus('error');
            setMessage('All fields are required.');
            return;
        }
        saveGithubConfig({ token, owner, repo });
        setStatus('success');
        setMessage('Configuration saved.');
        setTimeout(() => setStatus('idle'), 2000);
    };

    const handlePush = async () => {
        setStatus('loading');
        setMessage('Pushing documents to GitHub...');
        handleSaveConfig(); 
        
        try {
            const result = await syncToGithub(documents);
            setStatus('success');
            setMessage(`Successfully pushed ${result.pushed} documents. (${result.skipped} skipped)`);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to push to GitHub');
        }
    };

    const handlePull = async () => {
        setStatus('loading');
        setMessage('Pulling documents from GitHub...');
        handleSaveConfig();

        try {
            const docs = await pullFromGithub();
            onPullComplete(docs);
            setStatus('success');
            setMessage(`Imported ${docs.length} documents from GitHub.`);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to pull from GitHub');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-2 text-gray-900">
                        <Github className="w-5 h-5" />
                        <h2 className="text-lg font-bold">GitHub Sync</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Personal Access Token</label>
                            <input 
                                type="password" 
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                placeholder="ghp_..."
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Requires 'repo' scope.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Owner (User/Org)</label>
                                <input 
                                    type="text" 
                                    value={owner}
                                    onChange={(e) => setOwner(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="ueberdosis"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">Repository</label>
                                <input 
                                    type="text" 
                                    value={repo}
                                    onChange={(e) => setRepo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="notes-backup"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status !== 'idle' && (
                        <div className={`flex items-center p-3 rounded-lg text-sm ${
                            status === 'loading' ? 'bg-blue-50 text-blue-700' :
                            status === 'success' ? 'bg-green-50 text-green-700' :
                            'bg-red-50 text-red-700'
                        }`}>
                            {status === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {status === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                            {status === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                            <span>{message}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                            onClick={handlePush}
                            disabled={status === 'loading'}
                            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>Push</span>
                        </button>
                        <button 
                            onClick={handlePull}
                            disabled={status === 'loading'}
                            className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <DownloadCloud className="w-4 h-4" />
                            <span>Pull</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GitHubSyncModal;