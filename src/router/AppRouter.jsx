import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    {/* Puedes agregar más rutas aquí */}
  </Routes>
)

export default AppRouter