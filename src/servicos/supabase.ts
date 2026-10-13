import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chave = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !chave) {
  throw new Error(
    "Configure a URL e a chave publicável do Supabase no arquivo .env.local."
  );
}

export const supabase = createClient(url, chave);

