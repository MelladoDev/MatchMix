import { supabase } from "./client";

// Obtener usuario por email
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;
  return data;
}

// Crear usuario
export async function createUser(nombre, email, pareja_id = null) {
  const { data, error } = await supabase
    .from("usuarios")
    .insert([{ nombre, email, pareja_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Crear pareja
export async function createPareja(nombre) {
  const { data, error } = await supabase
    .from("parejas")
    .insert([{ nombre }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Agregar película/serie a la lista
export async function agregarALista({ pareja_id, tmdb_id, estado = "agregada", agregado_por }) {
  const { data, error } = await supabase
    .from("listas")
    .insert([{ pareja_id, tmdb_id, estado, agregado_por }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
