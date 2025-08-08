import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";

export const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [alert, setAlert] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [pair, setPair] = useState(null);

  const showAlert = (message, type = "info", ms = 3500) => {
    setAlert({ message, type });
    if (ms) setTimeout(() => setAlert(null), ms);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      setLoading(false);
    })();
  }, []);

  // 🟣 Verifica si hay sesión activa al cargar la app
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  // 🟢 Registro de usuario
  const signUp = async (email, password, name = "") => {
    try {
      setAuthLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // name queda en raw_user_meta_data y lo usa el trigger
          data: { name },
          // adónde redirigir después de confirmar el correo
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        const msg = error.message || "";

        if (msg.includes("User already registered")) {
          showAlert(
            "Este correo ya está registrado. Intenta iniciar sesión.",
            "warning"
          );
        } else if (
          msg.toLowerCase().includes("too many requests") ||
          msg.toLowerCase().includes("rate limit")
        ) {
          showAlert(
            "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.",
            "warning"
          );
        } else {
          showAlert(`No se pudo completar el registro: ${msg}`, "failure");
        }
        return null;
      }

      // Con confirmación de email, no hay sesión aún (session = null)
      showAlert(
        "Registro exitoso ✨. Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja o spam.",
        "success",
        6000
      );

      return data; // { user, session: null }
    } finally {
      setAuthLoading(false);
    }
  };

  // 🟡 Inicio de sesión
  const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  const signIn = async (email, password) => {
    // 1) Validaciones locales
    if (!email || !password) {
      showAlert("Completa correo y contraseña.", "failure");
      return;
    }
    if (!isValidEmail(email)) {
      showAlert("El correo no tiene un formato válido.", "failure");
      return;
    }
    if (password.length < 6) {
      showAlert("La contraseña debe tener al menos 6 caracteres.", "failure");
      return;
    }

    try {
      setAuthLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Analizamos el tipo de error
        if (error.message.includes("Invalid login credentials")) {
          showAlert(
            "Credenciales incorrectas. Verifica tu correo y contraseña.",
            "failure"
          );
        } else if (error.message.includes("User not found")) {
          showAlert("No se encontró un usuario con este correo.", "failure");
        } else {
          showAlert(`Error al iniciar sesión: ${error.message}`, "failure");
        }
        return;
      }
      setUser(data.user);
      showAlert("Inicio de sesión exitoso. ¡Bienvenida/o!", "success");
      setShowLogin(false); // cerrar modal
    } finally {
      setAuthLoading(false);
    }

    setUser(data.user);
    showAlert("Inicio de sesión exitoso. ¡Bienvenida/o!", "success");
    setShowLogin(false); // cierra modal
  };

  // 🔴 Cerrar sesión
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    showAlert("Sesión cerrada.", "info");
  };

  // 💕 Obtener perfil y pareja
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        await fetchProfileAndPair(data.user.id);
      }
      setLoading(false);
    })();
  }, []);

  const fetchProfileAndPair = async (uid) => {
    const { data: me, error } = await supabase
      .from("usuarios")
      .select("id, email, nombre, pareja_id")
      .eq("id", uid)
      .maybeSingle();
    if (!error) setProfile(me);

    if (me?.pareja_id) {
      const { data: couple } = await supabase
        .from("parejas")
        .select("id, nombre, invite_code")
        .eq("id", me.pareja_id)
        .maybeSingle();
      setPair(couple || null);
    } else {
      setPair(null);
    }
  };

  // Generar un código aleatorio
  const makeCode = (len = 6) =>
    Math.random()
      .toString(36)
      .slice(2, 2 + len)
      .toUpperCase();

  // Crear pareja y asignar al usuario actual
  const createOrGetPairCode = async () => {
    if (!user) return showAlert("Inicia sesión primero.", "warning");
    // Si ya tiene pareja y tiene código, devolverlo
    if (pair?.invite_code) return pair.invite_code;

    // Si ya tiene pareja pero sin código, actualizarla con un código
    if (profile?.pareja_id && !pair?.invite_code) {
      const code = makeCode(6);
      const { data, error } = await supabase
        .from("parejas")
        .update({ invite_code: code })
        .eq("id", profile.pareja_id)
        .select()
        .maybeSingle();
      if (error) return showAlert(error.message, "failure");
      setPair(data);
      return data.invite_code;
    }

    // No tiene pareja: crear una nueva
    let code = makeCode(6);
    // asegurar unicidad simple (reintento si existe)
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
    if (insErr) return showAlert(insErr.message, "failure");

    // Asignar pareja al usuario
    const { error: updErr } = await supabase
      .from("usuarios")
      .update({ pareja_id: pareja.id })
      .eq("id", user.id);
    if (updErr) return showAlert(updErr.message, "failure");

    setPair(pareja);
    setProfile((p) => ({ ...p, pareja_id: pareja.id }));
    showAlert("Código de pareja generado.", "success");
    return pareja.invite_code;
  };

  // Unirse a una pareja por código
  const joinPairByCode = async (code) => {
    if (!user) return showAlert("Inicia sesión primero.", "warning");
    if (!code) return showAlert("Ingresa un código válido.", "failure");

    const { data, error } = await supabase.rpc("join_pareja_by_code", {
      p_code: code,
    });

    if (error) return showAlert(error.message, "failure");

    // data devuelve [{ id, nombre, invite_code }]
    const couple = data?.[0] ?? null;
    if (!couple) return showAlert("Código inválido.", "failure");

    setPair(couple);
    setProfile((p) => ({ ...p, pareja_id: couple.id }));
    showAlert("¡Pareja conectada!", "success");

    // Asignar al usuario
    const { error: updErr } = await supabase
      .from("usuarios")
      .update({ pareja_id: couple.id })
      .eq("id", user.id);
    if (updErr) return showAlert(updErr.message, "failure");

    setPair(couple);
    setProfile((p) => ({ ...p, pareja_id: couple.id }));
    showAlert("¡Pareja conectada!", "success");
  };

// === TMDB core ===
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG = (p, size = "w500") => (p ? `https://image.tmdb.org/t/p/${size}${p}` : "/placeholder.jpg");

// cache simple en memoria
const tmdbCache = new Map(); // key -> { v, t }

/** Fetch con cache y soporte de AbortController */
const tmdbFetch = async (endpoint, { ttlMs = 60_000, signal } = {}) => {
  const key = endpoint;
  const now = Date.now();
  const cached = tmdbCache.get(key);
  if (cached && now - cached.t < ttlMs) return cached.v;

  const res = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" },
    signal,
  });
  if (!res.ok) throw new Error(`Error en TMDB: ${res.status} (${endpoint})`);
  const json = await res.json();
  tmdbCache.set(key, { v: json, t: now });
  return json;
};

// Endpoints de uso común
const tmdb = {
  trending: (window = "day", opt) =>
    tmdbFetch(`/trending/all/${window}?language=es-ES`, opt),
  search: (q, page = 1, opt) =>
    tmdbFetch(`/search/multi?language=es-ES&page=${page}&query=${encodeURIComponent(q)}`, opt),
  details: (type, id, opt) =>
    tmdbFetch(`/${type}/${id}?language=es-ES&append_to_response=videos,credits`, opt),
};

  // Funcion para homogeneizar la info de tmdb
  const normalizeItem = (r) => {
    const media_type = r.media_type || (r.first_air_date ? "tv" : "movie");
    const title = r.title || r.name || "(Sin título)";
    return {
      id: r.id,
      media_type, // 'movie' | 'tv'
      title,
      overview: r.overview ?? "",
      poster: IMG(r.poster_path, "w342"),
      backdrop: IMG(r.backdrop_path, "w780"),
      rating: r.vote_average ?? null,
      date: r.release_date || r.first_air_date || null,
      genres: r.genres?.map((g) => g.name) ?? [],
    };
  };
  // Agregar un ítem (desde TMDB) a la lista de la pareja
  const addToList = async (tmdbItem) => {
    if (!user || !profile?.pareja_id)
      return showAlert("Conecta una pareja primero.", "warning");
    const it = normalizeItem(tmdbItem);

    const { error } = await supabase.from("listas").insert([
      {
        pareja_id: profile.pareja_id,
        tmdb_id: it.id,
        media_type: it.media_type,
        estado: "agregada",
        agregado_por: user.id,
      },
    ]);

    if (error) {
      if (error.message?.includes("uq_listas_pareja_tmdb_media"))
        return showAlert("Ya está en la lista.", "info");
      return showAlert(error.message, "failure");
    }
    showAlert("Agregado a la lista 💜", "success");
  };

  // Traer la lista y “hidratar” con detalles de TMDB (incluye normalización)
  const getCoupleList = async () => {
    if (!profile?.pareja_id) return [];
    const { data, error } = await supabase
      .from("listas")
      .select("*")
      .eq("pareja_id", profile.pareja_id)
      .order("fecha_agregado", { ascending: false });

    if (error) {
      showAlert(error.message, "failure");
      return [];
    }

    const hydrated = await Promise.all(
      (data || []).map(async (row) => {
        try {
          const det = await tmdb.details(row.media_type, row.tmdb_id);
          return { ...row, tmdb: normalizeItem(det) };
        } catch {
          return { ...row, tmdb: null }; // fallback si TMDB falla
        }
      })
    );
    return hydrated;
  };

  const setListStatus = async (id, estado) => {
    const { error } = await supabase
      .from("listas")
      .update({ estado })
      .eq("id", id);
    if (error) showAlert(error.message, "failure");
  };

  const deleteFromList = async (id) => {
    const { error } = await supabase.from("listas").delete().eq("id", id);
    if (error) showAlert(error.message, "failure");
  };
  // Citas: crear / listar / eliminar
const addCita = async (isoDate) => {
  if (!user || !profile?.pareja_id) return showAlert("Conecta una pareja primero.", "warning");
  const { error } = await supabase.from("citas").insert([{
    pareja_id: profile.pareja_id,
    fecha: isoDate,          // 'YYYY-MM-DD'
    agregado_por: user.id
  }]);
  if (error) {
    if (error.message?.includes("uq_citas_fecha_pareja"))
      return showAlert("Esa fecha ya estaba agendada.", "info");
    return showAlert(error.message, "failure");
  }
  showAlert("Cita agregada ✅", "success");
};

const listCitas = async () => {
  if (!profile?.pareja_id) return [];
  const { data, error } = await supabase
    .from("citas")
    .select("id, fecha, agregado_por, created_at")
    .eq("pareja_id", profile.pareja_id)
    .order("fecha", { ascending: true });
  if (error) { showAlert(error.message, "failure"); return []; }
  // opcional: mapea con nombre del agregador si ya lo tienes en memoria:
  return data;
};

const deleteCita = async (id) => {
  const { error } = await supabase.from("citas").delete().eq("id", id);
  if (error) return showAlert(error.message, "failure");
};

  return (
    <GlobalContext.Provider
      value={{
        user,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        showLogin,
        setShowLogin,
        alert,
        setAlert,
        showAlert,
        profile,
        pair,
        createOrGetPairCode,
        joinPairByCode,
        tmdb,
        normalizeItem,
        addToList,
        getCoupleList,
        setListStatus,
        deleteFromList,
        addCita,
        listCitas,
        deleteCita,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
