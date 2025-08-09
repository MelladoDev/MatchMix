import { supabase } from "../supabase/client";

export async function addCita({ pareja_id, userId, isoDate }) {
  const { error } = await supabase.from("citas").insert([{
    pareja_id, fecha: isoDate, agregado_por: userId,
  }]);
  if (error) {
    if (error.message?.includes("uq_citas_fecha_pareja")) throw new Error("Esa fecha ya estaba agendada.");
    throw error;
  }
}

export async function listCitas({ pareja_id }) {
  if (!pareja_id) return [];
  const { data, error } = await supabase
    .from("citas")
    .select("id, fecha, agregado_por, created_at")
    .eq("pareja_id", pareja_id)
    .order("fecha", { ascending: true });
  if (error) throw error;
  return data;
}

export async function deleteCita(id) {
  const { error } = await supabase.from("citas").delete().eq("id", id);
  if (error) throw error;
}
