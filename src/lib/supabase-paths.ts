import { supabase } from './supabase';

// Строгие типы.
export type StorageFolder = 'sequence' | 'products' | 'thumbnails';
export type DeviceBreakpoint = 'desktop' | 'tablet' | 'mobile';

export const getStoragePublicUrl = (
    folder: StorageFolder,
    breakpoint: DeviceBreakpoint,
    fileName: string
): string => {
    // Формируем внутренний путь в бакете
    const path = `${folder}/${breakpoint}/${fileName}`;

    // Официальный метод Supabase для получения публичной ссылки
    const { data } = supabase.storage.from('jane-art').getPublicUrl(path);

    return data.publicUrl;
};
