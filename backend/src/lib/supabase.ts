import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabase: SupabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
export default supabase;
