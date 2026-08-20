import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lsjormnszdfqgokufzzx.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_yAc6pM_V4juoUTsuxRsDZQ_zjwOtzAH';

  return createBrowserClient(supabaseUrl, supabaseKey);
}
