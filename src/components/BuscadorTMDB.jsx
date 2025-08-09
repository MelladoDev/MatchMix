import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

const IMG = (p) => (p ? `https://image.tmdb.org/t/p/w92${p}` : "/placeholder.jpg");

export default function BuscadorTMDB() {
  const { tmdb, addToList, showAlert } = useContext(GlobalContext);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null); // 👈 loading por ítem

  const timer = useRef(null);
  const abortRef = useRef(null);
  const detailsCache = useRef(new Map());
  const rootRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fetchExtras = async (type, id, signal) => {
    const key = `${type}-${id}`;
    if (detailsCache.current.has(key)) return detailsCache.current.get(key);
    const det = await tmdb.details(type, id, { signal });
    const extras = type === "movie"
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
      const data = await tmdb.search(query, 1, { signal: abortRef.current.signal });
      const base = (data.results || [])
        .filter(r => r && (r.media_type === "movie" || r.media_type === "tv"))
        .slice(0, 6);

      const withExtras = await Promise.all(
        base.map(async (r) => {
          const extras = await fetchExtras(r.media_type, r.id, abortRef.current.signal);
          return {
            id: r.id,
            media_type: r.media_type,
            title: r.title || r.name,
            poster_path: r.poster_path,
            runtime: extras.runtime,
            episodes: extras.episodes,
          };
        })
      );

      setItems(withExtras);
      setOpen(true);
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
      setItems([]);
      setOpen(!!q.trim());
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const v = e.target.value;
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    if (!v.trim()) { setItems([]); setOpen(false); return; }
    timer.current = setTimeout(() => search(v.trim()), 350);
  };

  const onAdd = async (item) => {
    const key = `${item.media_type}-${item.id}`;
    try {
      setAddingId(key);
      await addToList(item);
      setQ(""); setItems([]); setOpen(false);
      showAlert?.("Agregado desde búsqueda 💜", "success");
    } finally {
      setAddingId(null);
    }
  };

  const onKeyDown = async (e) => {
    if (e.key === "Enter" && items[0]) {
      e.preventDefault();
      await onAdd(items[0]);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-xl mx-auto" onKeyDown={onKeyDown}>
      <input
        value={q}
        onChange={onChange}
        onFocus={() => items.length && setOpen(true)}
        placeholder="Buscar película o serie…"
        className="w-full p-3 rounded-xl bg-white/85 outline-none shadow"
      />

      {open && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl bg-white overflow-hidden z-50">
          {loading && <div className="p-3 text-sm text-gray-500">Buscando…</div>}

          {!loading && items.length === 0 && (
            <div className="p-3 text-sm text-gray-500">Sin resultados</div>
          )}

          {!loading && items.map((it) => {
            const key = `${it.media_type}-${it.id}`;
            const isAdding = addingId === key; // 👈 definir aquí

            return (
              <div key={key} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <img
                  src={IMG(it.poster_path)}
                  alt={it.title}
                  className="w-12 h-16 rounded object-cover"
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
            );
          })}
        </div>
      )}
    </div>
  );
}
