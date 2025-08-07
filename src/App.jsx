import { BrowserRouter } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import { GlobalProvider } from './context/GlobalContext'

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter >
        <AppRouter />
      </BrowserRouter>
    </GlobalProvider>
  )
}

export default App