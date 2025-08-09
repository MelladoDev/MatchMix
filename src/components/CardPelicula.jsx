export default function CardPelicula({ item, onSetStatus, onDelete }) {
  const t = item.tmdb;
  return (
    <div className="p-4 rounded-xl bg-white/20 shadow-lg flex gap-3">
      <img src={t?.poster || "/placeholder.jpg"} alt={t?.title} className="w-20 h-28 rounded object-cover" />
      <div className="flex-1">
        <h3 className="font-semibold text-white">{t?.title || `${item.media_type} #${item.tmdb_id}`}</h3>
        <p className="text-white/80 text-sm line-clamp-2">{t?.overview}</p>
        <div className="mt-1 text-xs text-white/70">
          Agregado por: <span className="font-medium">{item.added_by_name}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {/* <button onClick={() => onSetStatus("viendo")} className="px-2 py-1 rounded bg-amber-500 text-white">Viendo</button> */}
          {/* <button onClick={() => onSetStatus("completada")} className="px-2 py-1 rounded bg-emerald-600 text-white">Vista</button> */}
          <button onClick={onDelete} className="px-2 py-1 rounded-md  bg-rose-600 text-white">Eliminar</button>
        </div>
      </div>
    </div>
  );
}