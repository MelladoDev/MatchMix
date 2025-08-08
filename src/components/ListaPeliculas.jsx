import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";
import CardPelicula from "./CardPelicula";

export default function ListaPeliculas() {
  const { getPopularMovies } = useContext(GlobalContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPopularMovies(1); // TMDB page 1
        if (alive) setItems(data.results || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [getPopularMovies]);

  if (loading) return <p className="text-white">Cargando…</p>;

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-white">🎬 Películas y Series</h2>
      <div className="space-y-4">
        {items.slice(0, 2).map((m) => (
          <CardPelicula key={m.id} movie={m} />
        ))}
      </div>
    </>
  );
}
