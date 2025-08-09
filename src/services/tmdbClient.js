const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const cache = new Map();

const IMG = (p, size = "w500") => (p ? `https://image.tmdb.org/t/p/${size}${p}` : "/placeholder.jpg");

async function tmdbFetch(endpoint, { ttlMs = 60_000, signal } = {}) {
  const now = Date.now();
  const hit = cache.get(endpoint);
  if (hit && now - hit.t < ttlMs) return hit.v;

  const res = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" },
    signal,
  });
  if (!res.ok) throw new Error(`Error en TMDB: ${res.status} (${endpoint})`);
  const json = await res.json();
  cache.set(endpoint, { v: json, t: now });
  return json;
}

export const tmdb = {
  trending: (window = "day", opt) => tmdbFetch(`/trending/all/${window}?language=es-ES`, opt),
  search: (q, page = 1, opt) =>
    tmdbFetch(`/search/multi?language=es-ES&page=${page}&query=${encodeURIComponent(q)}`, opt),
  details: (type, id, opt) =>
    tmdbFetch(`/${type}/${id}?language=es-ES&append_to_response=videos,credits`, opt),
};

export const normalizeItem = (r) => {
  const media_type = r.media_type || (r.first_air_date ? "tv" : "movie");
  const title = r.title || r.name || "(Sin título)";
  return {
    id: r.id,
    media_type,
    title,
    overview: r.overview ?? "",
    poster: IMG(r.poster_path, "w342"),
    backdrop: IMG(r.backdrop_path, "w780"),
    rating: r.vote_average ?? null,
    date: r.release_date || r.first_air_date || null,
    genres: r.genres?.map((g) => g.name) ?? [],
  };
};
