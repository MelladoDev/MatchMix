import { useState, useEffect } from 'react'
import { Wheel } from 'react-custom-roulette'

const Ruleta = ({ itemsFiltrados }) => {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [data, setData] = useState([])

  useEffect(() => {
    if (itemsFiltrados && itemsFiltrados.length > 0) {
      const opciones = itemsFiltrados.map(item => ({ option: item }))
      setData(opciones)
      setResultado(null) // Reinicia resultado al cambiar la lista
    }
  }, [itemsFiltrados])

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * data.length)
    setPrizeNumber(newPrizeNumber)
    setMustSpin(true)
  }

  return (
    <div className="text-white">
      <h2 className="text-3xl font-bold mb-4">🎯 Ruleta de Recomendaciones</h2>

      {data.length > 0 ? (
        <>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            backgroundColors={['#fbcfe8', '#d8b4fe']}
            textColors={['#000']}
            onStopSpinning={() => {
              setMustSpin(false)
              setResultado(data[prizeNumber].option)
            }}
          />
          <button
            onClick={handleSpinClick}
            className="mt-4 bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-full"
          >
            Girar Ruleta
          </button>
        </>
      ) : (
        <p className="text-pink-300">No hay elementos para mostrar en la ruleta.</p>
      )}

      {resultado && (
        <p className="mt-4 text-lg font-semibold">
          🎉 ¡Hoy toca ver: <span className="text-pastelPurple">{resultado}</span>!
        </p>
      )}
    </div>
  )
}

export default Ruleta