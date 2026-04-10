'use client';

import { StorageFolder } from '@/lib/supabase-paths';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Импортируем наших "детей"
import { GlassToggle } from './glass-toggle';
import { PhotoViewer } from './photo-viewer';
import { Product3DView } from './product-3d-view';

interface ProductGalleryProps {
    images: string[];
    title: string;
    hasThreeSixty?: boolean;
    sequenceFolder?: StorageFolder;
    sequenceFrameCount?: number;
}

export function ProductGallery({
    images,
    title,
    hasThreeSixty = false,
    sequenceFolder,
    sequenceFrameCount,
}: ProductGalleryProps) {
    // Единственные стейты, которые нужны оркестратору
    const [activeMode, setActiveMode] = useState<'photo' | '3d'>('photo');
    const [is3dInitialized, setIs3dInitialized] = useState(false);

    const is3dAvailable =
        !!sequenceFolder &&
        sequenceFrameCount != null &&
        sequenceFrameCount > 0;

    const handleToggleMode = (mode: 'photo' | '3d') => {
        setActiveMode(mode);
        if (mode === '3d') {
            setIs3dInitialized(true);
        }
    };

    return (
        <div className="relative flex flex-col gap-4 w-full">
            <div className="relative">
                <div className="md:sticky md:top-24 aspect-3/4 w-full rounded-2xl overflow-hidden bg-muted relative shadow-even-lg group">
                    {/* РЕЖИМ: ФОТО */}
                    <div
                        className={cn(
                            'absolute inset-0 transition-opacity duration-500',
                            activeMode === 'photo'
                                ? 'opacity-100 z-20'
                                : 'opacity-0 z-0 pointer-events-none'
                        )}
                    >
                        <PhotoViewer images={images} title={title} />
                    </div>

                    {/* РЕЖИМ: 3D (Ленивая загрузка) */}
                    {is3dAvailable && is3dInitialized && (
                        <div
                            className={cn(
                                'absolute inset-0 bg-zinc-950 transition-opacity duration-500',
                                activeMode === '3d'
                                    ? 'opacity-100 z-20'
                                    : 'opacity-0 z-0 pointer-events-none'
                            )}
                        >
                            <Product3DView
                                folderName={sequenceFolder!}
                                frameCount={sequenceFrameCount!}
                                isActive={activeMode === '3d'}
                            />
                        </div>
                    )}
                </div>

                {/* ПЕРЕКЛЮЧАТЕЛЬ УПРАВЛЕНИЯ */}
                {hasThreeSixty && (
                    <GlassToggle
                        activeMode={activeMode}
                        is3dAvailable={is3dAvailable}
                        onToggle={handleToggleMode}
                    />
                )}
            </div>
        </div>
    );
}
