// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fvovozyibznhglafpote.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2b3ZvenlpYnpuaGdsYWZwb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODIzMzEsImV4cCI6MjA2ODg1ODMzMX0.0BAKIzjLqFzTX1tyFpNfIb9oTeqvtqhzmUBYux74K3g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});