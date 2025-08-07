const ListaSeries = () => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-white">⏳ Estamos Viendo</h2>
      <div className="space-y-4">
        <div className="bg-white/10 p-3 rounded-lg text-white">
          <p className="font-semibold">Serie: Ejemplo</p>
          <p>Capítulo 3 de 10</p>
          <div className="w-full bg-white/20 h-2 rounded-full mt-2">
            <div className="bg-purple-400 h-2 rounded-full w-1/3"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ListaSeries