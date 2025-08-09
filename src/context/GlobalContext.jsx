import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { makeAlert } from "../utils/alerts";
import {
  isValidEmail, getSessionUser, onAuthChange,
  signIn as sIn, signOut as sOut, signUp as sUp
} from "../services/authService";
import {
  fetchProfile, fetchPair,
  createOrGetPairCode as createPair,
  joinPairByCode as joinPair
} from "../services/pairService";
import {
  addToList as _addToList, fetchCoupleList,
  setListStatus as _setListStatus, deleteFromList as _deleteFromList
} from "../services/listService";
import {
  addCita as _addCita, listCitas as _listCitas, deleteCita as _deleteCita
} from "../services/citasService";
import { tmdb, normalizeItem } from "../services/tmdbClient";
// (opcional)
import { ssGet, ssSet, ssDel } from "../utils/cache";

export const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export function GlobalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pair, setPair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const showAlert = makeAlert(setAlert);

  // Hydrate auth + profile + pair
  useEffect(() => {
    let alive = true;
    const hydrate = async (u) => {
      if (!alive) return;
      setUser(u ?? null);
      if (u?.id) {
        try {
          const p = await fetchProfile(u.id);
          if (!alive) return;
          setProfile(p);
          const pr = await fetchPair(p?.pareja_id);
          if (!alive) return;
          setPair(pr ?? null);
        } catch {
          if (!alive) return;
          setProfile(null); setPair(null);
        }
      } else {
        setProfile(null); setPair(null);
      }
    };

    getSessionUser().then(hydrate).finally(() => alive && setLoading(false));
    const off = onAuthChange(hydrate);
    return () => { alive = false; off?.(); };
  }, []);

  // Auth API
  const signUp = async (email, password, name = "") => {
    try {
      setAuthLoading(true);
      const { data, error } = await sUp({ email, password, name });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("User already registered"))
          showAlert("Este correo ya está registrado. Intenta iniciar sesión.", "warning");
        else if (msg.toLowerCase().includes("too many requests") || msg.toLowerCase().includes("rate limit"))
          showAlert("Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.", "warning");
        else
          showAlert(`No se pudo completar el registro: ${msg}`, "failure");
        return null;
      }
      showAlert("Registro exitoso ✨. Revisa tu correo para confirmar.", "success", 6000);
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email, password) => {
    if (!email || !password) return showAlert("Completa correo y contraseña.", "failure");
    if (!isValidEmail(email)) return showAlert("El correo no tiene un formato válido.", "failure");
    if (password.length < 6) return showAlert("La contraseña debe tener al menos 6 caracteres.", "failure");
    try {
      setAuthLoading(true);
      const { data, error } = await sIn({ email, password });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("Invalid login credentials")) return showAlert("Credenciales incorrectas.", "failure");
        if (msg.includes("User not found")) return showAlert("No se encontró un usuario con este correo.", "failure");
        return showAlert(`Error al iniciar sesión: ${msg}`, "failure");
      }
      setUser(data.user);
      showAlert("Inicio de sesión exitoso. ¡Bienvenid@!", "success");
      setShowLogin(false);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    await sOut();
    setUser(null); setProfile(null); setPair(null);
    showAlert("Sesión cerrada.", "info");
  };

  // Pair API
  const createOrGetPairCode = async () => {
    if (!user) return showAlert("Inicia sesión primero.", "warning");
    try {
      const code = await createPair({ user, profile });
      // refrescar pair
      const pr = await fetchPair(profile?.pareja_id);
      setPair(pr ?? pair);
      showAlert("Código de pareja listo.", "success");
      return code;
    } catch (e) {
      showAlert(e.message, "failure");
      return null;
    }
  };

  const joinPairByCode = async (code) => {
    if (!user) return showAlert("Inicia sesión primero.", "warning");
    if (!code) return showAlert("Ingresa un código válido.", "failure");
    try {
      const couple = await joinPair({ userId: user.id, code });
      setPair(couple);
      setProfile(p => ({ ...p, pareja_id: couple.id }));
      showAlert("¡Pareja conectada!", "success");
    } catch (e) {
      showAlert(e.message, "failure");
    }
  };

  // List API (con cache opcional por pareja)
  const getCoupleList = async ({ preferCache = true, ttlMs = 60_000 } = {}) => {
    const pid = profile?.pareja_id;
    if (!pid) return [];
    const cacheKey = `lists:${pid}`;
    if (preferCache) {
      const cached = ssGet(cacheKey);
      if (cached) return cached;
    }
    const fresh = await fetchCoupleList({ pareja_id: pid, userId: user?.id });
    ssSet(cacheKey, fresh, ttlMs);
    return fresh;
  };

  const refreshCoupleListCache = () => {
    const pid = profile?.pareja_id;
    if (!pid) return;
    const cacheKey = `lists:${pid}`;
    ssDel(cacheKey);
  };

  const addToList = async (tmdbItem) => {
    try {
      await _addToList({ user, pareja_id: profile?.pareja_id, tmdbItem });
      refreshCoupleListCache();
      showAlert("Agregado a la lista 💜", "success");
      window.dispatchEvent(new Event("lists-updated"));
    } catch (e) {
      showAlert(e.message, e.message.includes("Ya está en la lista") ? "info" : "failure");
    }
  };

  const setListStatus = async (id, estado) => {
    try {
      await _setListStatus(id, estado);
      refreshCoupleListCache();
      window.dispatchEvent(new Event("lists-updated"));
    } catch (e) {
      showAlert(e.message, "failure");
    }
  };

  const deleteFromList = async (id) => {
    try {
      await _deleteFromList(id);
      refreshCoupleListCache();
      window.dispatchEvent(new Event("lists-updated"));
    } catch (e) {
      showAlert(e.message, "failure");
    }
  };

  // Citas API
  const addCita = async (isoDate) => {
    try {
      await _addCita({ pareja_id: profile?.pareja_id, userId: user?.id, isoDate });
      showAlert("Cita agregada ✅", "success");
    } catch (e) {
      showAlert(e.message, e.message.includes("ya estaba") ? "info" : "failure");
    }
  };

  const listCitas = () => _listCitas({ pareja_id: profile?.pareja_id });
  const deleteCita = async (id) => {
    try { await _deleteCita(id); }
    catch (e) { showAlert(e.message, "failure"); }
  };

  useEffect(() => {
  if (profile?.pareja_id) {
    localStorage.setItem("lastPairId", profile.pareja_id);
  }
}, [profile?.pareja_id]);

  const value = useMemo(() => ({
    // state
    user, profile, pair, loading, authLoading, alert, showLogin, setShowLogin,
    // ui
    showAlert,
    // tmdb
    tmdb, normalizeItem,
    // auth
    signUp, signIn, signOut,
    // pair
    createOrGetPairCode, joinPairByCode,
    // list
    getCoupleList, addToList, setListStatus, deleteFromList,
    // citas
    addCita, listCitas, deleteCita,
  }), [user, profile, pair, loading, authLoading, alert, showLogin]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}
