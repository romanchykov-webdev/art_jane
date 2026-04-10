'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Box, ImageIcon } from 'lucide-react';

interface GlassToggleProps {
    activeMode: 'photo' | '3d';
    is3dAvailable: boolean;
    onToggle: (mode: 'photo' | '3d') => void;
}

export function GlassToggle({
    activeMode,
    is3dAvailable,
    onToggle,
}: GlassToggleProps) {
    return (
        <div className="absolute opacity-90 -bottom-11 left-1/2 -translate-x-1/2 z-20 flex p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
            <div className="relative flex p-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                {/* Скользящий индикатор */}
                <motion.div
                    className="absolute top-1 bottom-1 rounded-full bg-white shadow-md"
                    layoutId="mode-indicator"
                    style={{
                        left: activeMode === 'photo' ? 4 : '50%',
                        width: 'calc(50% - 4px)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />

                <button
                    onClick={() => onToggle('photo')}
                    className={cn(
                        'relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 font-jane',
                        activeMode === 'photo'
                            ? 'text-black'
                            : 'text-white/70 hover:text-white'
                    )}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>Photo</span>
                </button>

                <button
                    onClick={() => onToggle('3d')}
                    disabled={!is3dAvailable}
                    className={cn(
                        'relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 font-jane',
                        activeMode === '3d'
                            ? 'text-black'
                            : 'text-white/70 hover:text-white',
                        !is3dAvailable &&
                            'opacity-30 cursor-not-allowed pointer-events-none'
                    )}
                >
                    <Box className="w-4 h-4" />
                    <span>360°</span>
                </button>
            </div>
        </div>
    );
}
