import { supabase } from "../supabase/client";
import { tmdb, normalizeItem } from "./tmdbClient";

export async function addToList({ user, pareja_id, tmdbItem }) {
  if (!user || !pareja_id) throw new Error("Conecta una pareja primero.");
  const it = normalizeItem(tmdbItem);

  const { error } = await supabase.from("listas").insert([{
    pareja_id, tmdb_id: it.id, media_type: it.media_type, estado: "agregada", agregado_por: user.id,
  }]);
  if (error) {
    if (error.message?.includes("uq_listas_pareja_tmdb_media")) throw new Error("Ya está en la lista.");
    throw error;
  }
}

export async function fetchCoupleList({ pareja_id, userId }) {
  if (!pareja_id) return [];

  const { data, error } = await supabase
    .from("listas")
    .select("*")
    .eq("pareja_id", pareja_id)
    .order("fecha_agregado", { ascending: false });
  if (error) throw error;

  const members = await supabase
    .from("usuarios")
    .select("id, nombre")
    .eq("pareja_id", pareja_id);
  const nameById = Object.fromEntries((members.data || []).map(m => [m.id, m.nombre || ""]));

  const hydrated = await Promise.all(
    (data || []).map(async (row) => {
      try {
        const det = await tmdb.details(row.media_type, row.tmdb_id);
        return {
          ...row,
          tmdb: normalizeItem(det),
          added_by_name: row.agregado_por === userId ? "Tú" : (nameById[row.agregado_por] || "Pareja"),
        };
      } catch {
        return { ...row, tmdb: null, added_by_name: nameById[row.agregado_por] || "Pareja" };
      }
    })
  );
  return hydrated;
}

export async function setListStatus(id, estado) {
  const { error } = await supabase.from("listas").update({ estado }).eq("id", id);
  if (error) throw error;
}

export async function deleteFromList(id) {
  const { error } = await supabase.from("listas").delete().eq("id", id);
  if (error) throw error;
}
