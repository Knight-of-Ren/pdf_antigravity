import React, { useRef } from 'react';
import { Upload, Type, FileText } from 'lucide-react';

interface EditorProps {
    title: string;
    setTitle: (t: string) => void;
    content: string;
    setContent: (c: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ title, setTitle, content, setContent }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Auto-Save: Silently send to backend
            const formData = new FormData();
            formData.append('file', file);
            fetch('/save-upload', {
                method: 'POST',
                body: formData
            }).then(async res => {
                if (res.ok) {
                    const data = await res.json();
                    console.log('File auto-saved to:', data.path);
                }
                else console.error('Auto-save failed.');
            }).catch(err => console.error('Auto-save error:', err));

            if (file.name.endsWith('.docx')) {
                // Handle Word Documents
                const arrayBuffer = await file.arrayBuffer();
                // We dynamically import mammoth to keep main bundle small
                const mammoth = await import('mammoth');
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    setContent(result.value);
                    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
                } catch (err) {
                    console.error('Failed to parse docx:', err);
                    alert('Failed to read Word document.');
                }
            } else {
                // Handle Text Files
                const reader = new FileReader();
                reader.onload = (event) => {
                    const text = event.target?.result as string;
                    setContent(text);
                    if (!title) {
                        setTitle(file.name.replace(/\.[^/.]+$/, ""));
                    }
                };
                reader.readAsText(file);
            }
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-300">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <h2 className="font-semibold">Content Editor</h2>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Supports .txt, .md, .docx"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Upload className="w-4 h-4" />
                    Import Document
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.md,.json,.js,.ts,.docx"
                    onChange={handleFileUpload}
                />
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Document Title</label>
                    <div className="relative group">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter document title..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Body Text</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your content here or upload a file..."
                        className="w-full flex-1 p-4 bg-slate-950/50 border border-slate-700/50 rounded-lg text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                    ></textarea>
                </div>
            </div>
        </div>
    );
};
