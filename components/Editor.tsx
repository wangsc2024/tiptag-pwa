import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
    Bold, Italic, Strikethrough, Code, Link as LinkIcon, 
    List, ListOrdered, CheckSquare, Quote, Minus,
    Heading1, Heading2, Undo, Redo,
    Wand2, Check, X, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { generateAIContent } from '../services/geminiService';
import { AISuggestionType } from '../types';

interface EditorProps {
  content: string;
  title: string;
  onUpdate: (content: string) => void;
  onTitleChange: (title: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, title, onUpdate, onTitleChange }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiMenu, setShowAiMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing or type / for commands...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-indigo-600 underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    editorProps: {
        attributes: {
            class: 'prose prose-lg prose-slate focus:outline-none max-w-none',
        },
    },
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  // Sync content when switching documents
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleAiAction = async (type: AISuggestionType) => {
    if (!editor) return;
    
    // Get selection or full document if nothing selected
    const { from, to, empty } = editor.state.selection;
    const selectedText = empty 
        ? editor.getText() 
        : editor.state.doc.textBetween(from, to, ' ');

    if (!selectedText.trim()) {
        setAiError("Please type something or select text first.");
        setTimeout(() => setAiError(null), 3000);
        return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setShowAiMenu(false);

    try {
      const generatedText = await generateAIContent(type, selectedText);
      
      if (generatedText) {
        if (!empty && (type === AISuggestionType.FIX_GRAMMAR || type === AISuggestionType.REPHRASE)) {
            // Replace selection
            editor.chain().focus().deleteSelection().insertContent(generatedText).run();
        } else {
            // Append or insert at cursor
            const insertion = empty 
                ? `\n\n${generatedText}` 
                : `\n\n**AI Suggestion:**\n${generatedText}`;
            
            editor.chain().focus().insertContentAt(to, insertion).run();
        }
      }
    } catch (err) {
      setAiError("AI Request failed. Check your API key or connection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between p-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {/* History */}
            <ToolbarButton 
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                icon={<Undo className="w-4 h-4" />}
                title="Undo"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                icon={<Redo className="w-4 h-4" />}
                title="Redo"
            />
            <div className="w-px h-6 bg-gray-200 mx-2" />
            
            {/* Formatting */}
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                icon={<Bold className="w-4 h-4" />}
                title="Bold"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                icon={<Italic className="w-4 h-4" />}
                title="Italic"
            />
             <ToolbarButton 
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                icon={<Strikethrough className="w-4 h-4" />}
                title="Strikethrough"
            />
             <ToolbarButton 
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                icon={<Code className="w-4 h-4" />}
                title="Inline Code"
            />
            <div className="w-px h-6 bg-gray-200 mx-2" />
            
            {/* Headings */}
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                icon={<Heading1 className="w-4 h-4" />}
                title="H1"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                icon={<Heading2 className="w-4 h-4" />}
                title="H2"
            />
            <div className="w-px h-6 bg-gray-200 mx-2" />
            
            {/* Lists */}
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                icon={<List className="w-4 h-4" />}
                title="Bullet List"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                icon={<ListOrdered className="w-4 h-4" />}
                title="Ordered List"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive('taskList')}
                icon={<CheckSquare className="w-4 h-4" />}
                title="Task List"
            />
            
            {/* Inserts */}
             <div className="w-px h-6 bg-gray-200 mx-2" />
             <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                icon={<Quote className="w-4 h-4" />}
                title="Quote"
            />
             <ToolbarButton 
                onClick={setLink}
                isActive={editor.isActive('link')}
                icon={<LinkIcon className="w-4 h-4" />}
                title="Link"
            />
            <ToolbarButton 
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                icon={<Minus className="w-4 h-4" />}
                title="Horizontal Rule"
            />
        </div>

        {/* AI Section */}
        <div className="flex items-center space-x-2 ml-auto">
            {isAiLoading ? (
                <div className="flex items-center text-indigo-600 text-sm px-3 py-1.5 bg-indigo-50 rounded-full animate-pulse">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="font-medium">Thinking...</span>
                </div>
            ) : (
                <div className="relative">
                    <button
                        onClick={() => setShowAiMenu(!showAiMenu)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Assist</span>
                    </button>
                    
                    {/* AI Menu Dropdown */}
                    {showAiMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowAiMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1">
                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Selection Actions
                                    </div>
                                    <AiMenuItem 
                                        icon={<Wand2 className="w-4 h-4" />} 
                                        label="Fix Grammar" 
                                        onClick={() => handleAiAction(AISuggestionType.FIX_GRAMMAR)} 
                                    />
                                    <AiMenuItem 
                                        icon={<Check className="w-4 h-4" />} 
                                        label="Summarize" 
                                        onClick={() => handleAiAction(AISuggestionType.SUMMARIZE)} 
                                    />
                                    <AiMenuItem 
                                        icon={<List className="w-4 h-4" />} 
                                        label="Rephrase" 
                                        onClick={() => handleAiAction(AISuggestionType.REPHRASE)} 
                                    />
                                     <div className="my-1 border-t border-gray-100" />
                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Generation
                                    </div>
                                    <AiMenuItem 
                                        icon={<Sparkles className="w-4 h-4" />} 
                                        label="Continue Writing" 
                                        onClick={() => handleAiAction(AISuggestionType.EXPAND)} 
                                    />
                                     <AiMenuItem 
                                        icon={<Heading1 className="w-4 h-4" />} 
                                        label="Generate Ideas" 
                                        onClick={() => handleAiAction(AISuggestionType.GENERATE_IDEAS)} 
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
            <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled Document"
                className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none focus:outline-none focus:ring-0 bg-transparent mb-6"
            />
            <EditorContent editor={editor} />
        </div>
      </div>

      {/* Error Toast */}
      {aiError && (
        <div className="absolute bottom-6 right-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg border border-red-100 flex items-center animate-in slide-in-from-bottom-5">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">{aiError}</span>
            <button onClick={() => setAiError(null)} className="ml-4 hover:bg-red-100 p-1 rounded">
                <X className="w-4 h-4" />
            </button>
        </div>
      )}
    </div>
  );
};

const ToolbarButton: React.FC<{ onClick: () => void; isActive?: boolean; icon: React.ReactNode; title: string; disabled?: boolean }> = ({ onClick, isActive, icon, title, disabled }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`p-2 rounded-md transition-all ${
            isActive 
            ? 'bg-indigo-50 text-indigo-600' 
            : disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        {icon}
    </button>
);

const AiMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors rounded-md text-left"
    >
        <span className="text-gray-400 group-hover:text-indigo-500">{icon}</span>
        <span>{label}</span>
    </button>
);

export default Editor;