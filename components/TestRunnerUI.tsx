import React, { useState, useEffect } from 'react';
// Browser-based test runner disabled - tests now use real vitest CLI
// import { executeRegistered } from '../lib/vitest';
import { X, Play, CheckCircle, XCircle, Terminal } from 'lucide-react';

// Test imports disabled - vitest doesn't work in browser
// import '../services/storage.test.ts';
// import '../services/geminiService.test.ts';
// import '../services/githubService.test.ts';
// import './SlashCommand.test.ts';

interface TestResult {
    suite: string;
    name: string;
    status: 'pass' | 'fail';
    error?: any;
}

interface TestRunnerUIProps {
    isOpen: boolean;
    onClose: () => void;
}

const TestRunnerUI: React.FC<TestRunnerUIProps> = ({ isOpen, onClose }) => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [stats, setStats] = useState({ pass: 0, fail: 0, total: 0 });

    const run = async () => {
        // Browser-based test runner disabled
        // Tests should be run via CLI: npm run test:run
        setResults([{
            suite: 'Info',
            name: 'Run tests via CLI: npm run test:run',
            status: 'pass'
        }]);
        setStats({ pass: 1, fail: 0, total: 1 });
    };

    useEffect(() => {
        if (isOpen) {
            run();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-5 h-5 text-gray-700" />
                        <h2 className="font-bold text-gray-900">Test Runner</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-3 text-sm font-medium">
                            <span className="text-gray-500">Total: {stats.total}</span>
                            <span className="text-green-600">Pass: {stats.pass}</span>
                            <span className="text-red-600">Fail: {stats.fail}</span>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-900 font-mono text-sm">
                    {isRunning && (
                        <div className="text-yellow-400 mb-4 animate-pulse">Running tests...</div>
                    )}
                    
                    {results.map((res, i) => (
                        <div key={i} className="mb-2 border-l-2 border-gray-700 pl-3 py-1">
                            <div className="flex items-center space-x-2">
                                {res.status === 'pass' ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-gray-400">[{res.suite}]</span>
                                <span className={res.status === 'pass' ? 'text-gray-200' : 'text-red-300 font-bold'}>
                                    {res.name}
                                </span>
                            </div>
                            {res.error && (
                                <div className="mt-1 ml-6 text-red-400 bg-red-900/20 p-2 rounded whitespace-pre-wrap">
                                    {res.error.message}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {!isRunning && results.length === 0 && (
                        <div className="text-gray-500">No tests executed.</div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                    <button 
                        onClick={run}
                        disabled={isRunning}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        <Play className="w-4 h-4" />
                        <span>Rerun Tests</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestRunnerUI;