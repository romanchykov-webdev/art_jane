import { supabase } from './supabase';

export type StorageFolder = 'sequence' | 'products' | 'thumbnails';
export type DeviceBreakpoint = 'desktop' | 'tablet' | 'mobile';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ [Supabase] Ошибка: NEXT_PUBLIC_SUPABASE_URL не задан.');
}

// FIX: Инициализируем бакет один раз при старте модуля
const storageBucket = supabase.storage.from('jane-art');

export const getStoragePublicUrl = (
    folder: StorageFolder,
    breakpoint: DeviceBreakpoint,
    fileName: string
): string => {
    const path = `${folder}/${breakpoint}/${fileName}`;
    const { data } = storageBucket.getPublicUrl(path);
    return data.publicUrl;
};
