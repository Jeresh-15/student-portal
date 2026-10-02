import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lmnbsauvjqursjxocsgf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kUszCv6Cdq8rZgD-v7gY6w_DEkQ9pZA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
