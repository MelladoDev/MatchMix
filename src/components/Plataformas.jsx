const plataformas = [
  { nombre: 'Netflix', icono: '/icons/netflix.svg' },
  { nombre: 'Prime Video', icono: '/icons/prime.svg' },
  { nombre: 'Disney+', icono: '/icons/disney.svg' },
  { nombre: 'HBO Max', icono: '/icons/hbo.svg' },
  { nombre: 'YouTube', icono: '/icons/youtube.svg' },
]

const Plataformas = () => (
  <div className="p-4 rounded-xl bg-white/20 shadow-lg">
    <h2 className="text-xl font-bold mb-4">📺 Dónde Ver</h2>
    <div className="flex gap-4 flex-wrap">
      {plataformas.map((p) => (
        <img
          key={p.nombre}
          src={p.icono}
          alt={p.nombre}
          title={p.nombre}
          className="w-12 h-12 hover:scale-110 transition-transform"
        />
      ))}
    </div>
  </div>
)

export default Plataformas