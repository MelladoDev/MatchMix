import CardPelicula from './CardPelicula'

const ListaPeliculas = () => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-white">🎬 Películas y Series</h2>
      <div className="space-y-4">
        <CardPelicula />
        <CardPelicula />
      </div>
    </>
  )
}

export default ListaPeliculas