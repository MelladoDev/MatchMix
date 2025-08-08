import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

const IMG = (p) => (p ? `https://image.tmdb.org/t/p/w92${p}` : "/placeholder.jpg");

export default function BuscadorTMDB() {
  const { tmdb, addToList, showAlert } = useContext(GlobalContext); // usamos tmdb.search y tmdb.details
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const timer = useRef(null);
  const abortRef = useRef(null);
  const detailsCache = useRef(new Map()); // key: `${type}-${id}` -> {runtime, episodes}
  const rootRef = useRef(null);

  // Cierra el panel si haces click fuera

  useEffect(() => {
    const onClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fetchExtras = async (type, id) => {
    const key = `${type}-${id}`;
    if (detailsCache.current.has(key)) return detailsCache.current.get(key);
    const det = await tmdb.details(type, id);
    const extras =
      type === "movie"
        ? { runtime: det.runtime ?? null, episodes: null }
        : { runtime: null, episodes: det.number_of_episodes ?? null };
    detailsCache.current.set(key, extras);
    return extras;
  };

  const search = async (query) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const data = await tmdb.search(query);
      const base = (data.results || [])
        .filter((r) => r && (r.media_type === "movie" || r.media_type === "tv"))
        .slice(0, 4);

      // hidrata con duración/capítulos en paralelo
      const withExtras = await Promise.all(
        base.map(async (r) => {
          const type = r.media_type;
          const extras = await fetchExtras(type, r.id);
          return {
            id: r.id,
            media_type: type,
            title: r.title || r.name,
            poster_path: r.poster_path,
            runtime: extras.runtime,      // min (movie)
            episodes: extras.episodes,    // cantidad episodios (tv)
          };
        })
      );

      setItems(withExtras);
      setOpen(true);
    } catch (e) {
      // silencio: si aborta o falla, simplemente no mostramos nada
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const v = e.target.value;
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    if (!v.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(() => search(v.trim()), 350); // debounce 350ms
  };
   const onAdd = async (item) => {
    try {
      setAddingId(`${item.media_type}-${item.id}`);
      await addToList(item);  
      setQ(""); setItems([]); setOpen(false);
    } finally {
      setAddingId(null);
    }
  };

  const onKeyDown = async (e) => {
    if (e.key === "Enter" && items[0]) {
      e.preventDefault();
      await onAdd(items[0]);
      showAlert?.("Agregado desde búsqueda 💜", "success");
    }
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-xl mx-auto ">
      <input
        value={q}
        onChange={onChange}
        onFocus={() => items.length && setOpen(true)}
        placeholder="Buscar película o serie…"
        className="w-full p-3 rounded-xl bg-white/85 outline-none shadow"
      />

      {open && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl bg-white  overflow-hidden z-50">
          {loading && (
            <div className="p-3 text-sm text-gray-500">Buscando…</div>
          )}

          {!loading && items.length === 0 && (
            <div className="p-3 text-sm text-gray-500">Sin resultados</div>
          )}

          {!loading &&
            items.map((it) => (
              <div
                key={`${it.media_type}-${it.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-default"
              >
                <img
                  src={IMG(it.poster_path)}
                  alt={it.title}
                  className="w-12 h-18 rounded object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-xs text-gray-600">
                    {it.media_type === "movie" && it.runtime != null
                      ? `Película · ${it.runtime} min`
                      : it.media_type === "tv" && it.episodes != null
                      ? `Serie · ${it.episodes} capítulos`
                      : it.media_type === "movie"
                      ? "Película"
                      : "Serie"}
                  </div>
                </div>
               <button
                  disabled={isAdding}
                  onClick={() => onAdd(it)}
                  className="text-sm px-2 py-1 rounded bg-purple-600 text-white disabled:opacity-50"
                >
                  {isAdding ? "Agregando…" : "Agregar"}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
