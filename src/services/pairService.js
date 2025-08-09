import { supabase } from "../supabase/client";

export async function fetchProfile(uid) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, nombre, pareja_id")
    .eq("id", uid)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPair(pairId) {
  if (!pairId) return null;
  const { data, error } = await supabase
    .from("parejas")
    .select("id, nombre, invite_code")
    .eq("id", pairId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export const makeCode = (len = 6) =>
  Math.random().toString(36).slice(2, 2 + len).toUpperCase();

export async function createOrGetPairCode({ user, profile }) {
  if (!user) throw new Error("Inicia sesión primero.");

  if (profile?.pareja_id) {
    const pair = await fetchPair(profile.pareja_id);
    if (pair?.invite_code) return pair.invite_code;

    const code = makeCode(6);
    const { data, error } = await supabase
      .from("parejas")
      .update({ invite_code: code })
      .eq("id", profile.pareja_id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data.invite_code;
  }

  let code = makeCode(6);
  for (let i = 0; i < 3; i++) {
    const { data: exists } = await supabase
      .from("parejas")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();
    if (!exists) break;
    code = makeCode(6);
  }

  const { data: pareja, error: insErr } = await supabase
    .from("parejas")
    .insert([{ nombre: null, invite_code: code }])
    .select()
    .single();
  if (insErr) throw insErr;

  const { error: updErr } = await supabase
    .from("usuarios")
    .update({ pareja_id: pareja.id })
    .eq("id", user.id);
  if (updErr) throw updErr;

  return pareja.invite_code;
}

export async function joinPairByCode({ userId, code }) {
  const { data, error } = await supabase.rpc("join_pareja_by_code", { p_code: code });
  if (error) throw error;
  const couple = data?.[0] ?? null;
  if (!couple) throw new Error("Código inválido.");

  const { error: updErr } = await supabase
    .from("usuarios")
    .update({ pareja_id: couple.id })
    .eq("id", userId);
  if (updErr) throw updErr;

  return couple;
}
