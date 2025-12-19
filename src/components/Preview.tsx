import React from 'react';
import type { Theme } from '../themes';

interface PreviewProps {
    title: string;
    content: string;
    theme: Theme;
    forcedMode?: 'light' | 'dark' | 'app-match';
    id?: string;
    isShadow?: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ title, content, theme, forcedMode, id = 'preview-content', isShadow = false }) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');

    // Calculate if we need to apply override classes
    let overrideClass = '';
    if (forcedMode === 'light') overrideClass = 'force-light-mode';
    else if (forcedMode === 'dark') overrideClass = 'force-dark-mode';

    // The Paper Component (Reusable)
    const Paper = (
        <div
            id={id}
            className={`shrink-0 w-full min-h-[1123px] bg-white shadow-2xl relative transition-all duration-500 origin-top mb-12 ${theme.className} ${theme.styles.container} ${overrideClass}`}
        >
            {/* Descriptive Badge */}
            <div className={theme.styles.badge}>
                {theme.name} Edition • {new Date().toLocaleDateString()}
            </div>

            {/* Title */}
            <h1 className={theme.styles.heading}>
                {title || 'Untitled Document'}
            </h1>

            {/* Content */}
            <div className={`${theme.styles.content} break-words whitespace-pre-wrap`}>
                {paragraphs.length > 0 ? (
                    paragraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                    ))
                ) : (
                    <p className="opacity-50 italic">Start typing to see content here...</p>
                )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-current opacity-30 text-xs text-center">
                Generated with Antigravity
            </div>
        </div>
    );

    // If Shadow Render, return ONLY the paper, no wrappers
    if (isShadow) {
        return Paper;
    }

    // Default UI Mode (Live Preview)
    return (
        <div className="absolute inset-0 bg-slate-950 p-8 overflow-y-auto custom-scrollbar flex justify-center items-start">
            <div className="w-full max-w-4xl min-h-full flex flex-col">
                <div className="mb-4 flex justify-between items-center text-slate-500 text-sm px-1">
                    <span className="font-medium uppercase tracking-wider text-xs">Live Preview</span>
                    <span className="text-xs font-mono">A4 / Portrait</span>
                </div>
                {Paper}
            </div>
        </div>
    );
};
