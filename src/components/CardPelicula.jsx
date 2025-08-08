const IMG = "https://image.tmdb.org/t/p/w300";

export default function CardPelicula({ movie }) {
  if (!movie) return null;

  const title = movie.title || movie.name; // movie vs tv
  const poster = movie.poster_path ? `${IMG}${movie.poster_path}` : "/placeholder.jpg";
  const date = movie.release_date || movie.first_air_date || "—";

  return (
    <div className="p-4 rounded-xl bg-indigo-300/50 shadow-lg">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <div className="bg-white/10 p-2 rounded-lg">
        <img src={poster} alt={title} className="rounded-md mb-2" />
        <p className="font-semibold">Fecha: {date}</p>
        <p>Rating: {movie.vote_average?.toFixed(1) ?? "—"}</p>
      </div>
    </div>
  );
}
