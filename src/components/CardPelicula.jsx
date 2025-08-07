const CardPelicula = () => {
  return (
    <div className="p-4 rounded-xl bg-white/20 shadow-lg">
      <h2 className="text-xl font-bold mb-2">🎬 Película Destacada</h2>
      <div className="bg-white/10 p-2 rounded-lg">
        <img src="/placeholder.jpg" alt="Poster" className="rounded-md mb-2" />
        <p className="font-semibold">Título: Ejemplo</p>
        <p>Plataforma: Netflix</p>
        <p>Género: Drama</p>
      </div>
    </div>
  )
}

export default CardPelicula