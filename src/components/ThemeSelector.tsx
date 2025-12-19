import React from 'react';
import { themes } from '../themes';
import type { Theme } from '../themes';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

interface ThemeSelectorProps {
    currentTheme: Theme;
    onThemeSelect: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeSelect }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/50">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
                <Palette className="w-5 h-5" />
                <h2 className="font-semibold">Select Style</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {themes.map((theme) => {
                    const isActive = currentTheme.id === theme.id;
                    return (
                        <motion.button
                            key={theme.id}
                            onClick={() => onThemeSelect(theme)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                relative p-4 rounded-lg border-2 text-left transition-all
                ${isActive
                                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                                }
              `}
                        >
                            <div className="flex justify-between items-center">
                                <span className={`font-medium ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                                    {theme.name}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                                    />
                                )}
                            </div>
                            <div className="mt-2 text-xs text-slate-500 font-mono">
                                Preview: <span className="opacity-75">{theme.id === 'brutalist' ? 'MONO' : theme.id === 'futuristic' ? 'NEON' : 'SERIF'}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
