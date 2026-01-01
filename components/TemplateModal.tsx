import React from 'react';
import { Template, templates } from '../services/templates';
import { X, FileText, ArrowRight } from 'lucide-react';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: Template) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template) => (
                            <div 
                                key={template.id}
                                className="group bg-white p-5 rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all"
                                onClick={() => onSelect(template)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;