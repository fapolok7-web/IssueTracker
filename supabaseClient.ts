import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bivshnkdulaibmslhiwr.supabase.co';
const supabaseAnonKey = 'sb_publishable_VcMNNK14ZNDNcms9yVGOOg_ecUkj1AV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
