import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail-Fast защита: прерываем выполнение, если ключи не найдены
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '❌ Критическая ошибка: Отсутствуют ключи Supabase (NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
