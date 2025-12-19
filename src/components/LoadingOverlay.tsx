import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    isVisible: boolean;
    progress: number; // 0 to 100
    statusMessage: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, progress, statusMessage }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center"
                    >
                        <div className="relative w-16 h-16 mx-auto mb-6 bg-indigo-500/10 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                            <div
                                className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"
                                style={{ animationDuration: '1.5s' }}
                            />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Generating PDF</h3>
                        <p className="text-slate-400 text-sm mb-6">{statusMessage}</p>

                        <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                            <motion.div
                                className="bg-indigo-500 h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                            <span>{Math.round(progress)}%</span>
                            <span>{progress < 100 ? 'Processing...' : 'Complete'}</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
