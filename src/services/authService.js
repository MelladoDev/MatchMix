import { supabase } from "../supabase/client";

export const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

export function onAuthChange(cb) {
  const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
    cb(session?.user ?? null);
  });
  return () => sub?.subscription?.unsubscribe?.();
}

export function signUp({ email, password, name }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${window.location.origin}/` },
  });
}

export function signIn({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}
