import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rnewoxdzqbihoiauozzd.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_BvaZFL5L_6NvxDd5hYAm_Q_gGahg1ew';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
