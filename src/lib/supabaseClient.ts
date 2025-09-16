import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Las credenciales de Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) no están definidas. Asegúrate de crear un archivo .env.local y añadir las variables, o configurarlas en tu proveedor de hosting (Vercel).");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
