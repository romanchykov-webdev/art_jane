'use client';

import { StorageFolder } from '@/lib/supabase-paths';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Импортируем наших "детей"
// import { GlassToggle } from './glass-toggle';
import { GlassTabs } from '../../glass-tabs';
import { PhotoViewer } from './photo-viewer';
import { Product3DView } from './product-3d-view';

import { Box, ImageIcon } from 'lucide-react';

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
    const [activeTab, setActiveTab] = useState<'photo' | '3d'>('photo');
    const [is3dInitialized, setIs3dInitialized] = useState(false);

    const is3dAvailable =
        !!sequenceFolder &&
        sequenceFrameCount != null &&
        sequenceFrameCount > 0;
    const tabs = [
        {
            id: 'photo',
            label: 'PHOTO', // Сделали заглавными для эстетики (как на скрине)
            icon: <ImageIcon className="w-4 h-4" />,
        },
        {
            id: '3d',
            label: '360°', // Красивый знак градусов
            icon: <Box className="w-4 h-4" />,
            disabled: !is3dAvailable,
        },
    ];

    const handleToggleMode = (mode: 'photo' | '3d') => {
        setActiveTab(mode);
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
                            activeTab === 'photo'
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
                                activeTab === '3d'
                                    ? 'opacity-100 z-20'
                                    : 'opacity-0 z-0 pointer-events-none'
                            )}
                        >
                            <Product3DView
                                folderName={sequenceFolder!}
                                frameCount={sequenceFrameCount!}
                                isActive={activeTab === '3d'}
                            />
                        </div>
                    )}
                </div>

                {/* ПЕРЕКЛЮЧАТЕЛЬ УПРАВЛЕНИЯ */}
                {hasThreeSixty && (
                    <GlassTabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={id => handleToggleMode(id as 'photo' | '3d')}
                        className="absolute opacity-90 -bottom-11 left-1/2 -translate-x-1/2 z-20"
                    />
                )}
            </div>
        </div>
    );
}
