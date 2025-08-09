import { useContext, useEffect, useState, useCallback } from "react";
import { GlobalContext } from "../context/GlobalContext";
import CardPelicula from "./CardPelicula";

export default function ListaPeliculas() {
  const {
    getCoupleList,
    setListStatus,
    deleteFromList,
    profile, // <- para saber cuándo hay pareja
  } = useContext(GlobalContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (preferCache = true) => {
      if (!profile?.pareja_id) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getCoupleList({ preferCache });
        setItems(data || []);
      } finally {
        setLoading(false);
      }
    },
    [getCoupleList, profile?.pareja_id]
  );

  useEffect(() => {
    let alive = true;

    const firstLoad = async () => {
      await load(true); // usa cache en la primera carga para UX
    };

    if (profile?.pareja_id) firstLoad();

    const onUpdated = () => {
      if (!alive) return;
      // después de cambios, trae fresco (sin cache)
      load(false);
    };

    window.addEventListener("lists-updated", onUpdated);
    return () => {
      alive = false;
      window.removeEventListener("lists-updated", onUpdated);
    };
  }, [profile?.pareja_id, load]);

  const handleSetStatus = async (rowId, estado) => {
    await setListStatus(rowId, estado);
    await load(false);
  };

  const handleDelete = async (rowId) => {
    await deleteFromList(rowId);
    await load(false);
  };

  if (loading) return <p className="text-white/80">Cargando…</p>;
  if (!items.length) return <p className="text-white/80">Aún no hay títulos. Usa el buscador arriba ✨</p>;

  return (
 <div className="flex h-full min-h-0 flex-col">
      <h2 className="text-2xl font-bold mb-3 text-white">🎬 Películas y Series</h2>

      {/* Área scrolleable: ocupa el resto del alto del card */}
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain pr-1">
        <div className="space-y-3">
          {items.map((row) => (
            <CardPelicula
              key={row.id}
              item={row}
              onSetStatus={(estado) => handleSetStatus(row.id, estado)}
              onDelete={() => handleDelete(row.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
