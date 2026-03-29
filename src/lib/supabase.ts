import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ [Supabase] Предупреждение: Отсутствуют ключи окружения. Проверьте .env файл.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
