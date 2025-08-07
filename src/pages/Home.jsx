import { useContext, useState } from 'react'
import { GlobalContext } from '../context/GlobalContext'
import Ruleta from '../components/Ruleta'
import Plataformas from '../components/Plataformas'
import ListaPeliculas from '../components/ListaPeliculas'
import ListaSeries from '../components/ListaSeries'
import CalendarioCita from '../components/CalendarioCita'
import LoginModal from '../components/LoginModal'
import Toast from '../components/Toast'
import ProfileButton from "../components/ProfileButton";
import PairModal from "../components/PairModal";

const Home = () => {

 const { showLogin, setShowLogin, alert, setAlert, user } = useContext(GlobalContext);
const [showPair, setShowPair] = useState(false);
 
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-300 via-purple-200 to-pink-200">
      <h1 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
        💞 MatchMix
      </h1>

<div className="relative z-10 mb-5 text-center">
 {!user ? (
          <button
            onClick={() => setShowLogin(true)}
            className="bg-white/20 text-white px-3 py-2 rounded-xl shadow hover:bg-white/30"
          >
            Iniciar sesión
          </button>
        ) : (
          <ProfileButton onOpenPair={() => setShowPair(true)} />
        )}
      </div>

      {/* Solo se muestra si showLogin es true */}
      {showLogin && <LoginModal />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
        <div className="backdrop-blur-lg bg-white/20 rounded-xl p-4 shadow-lg">
          <Ruleta />
        </div>

        <div className="backdrop-blur-lg bg-white/20 rounded-xl p-4 shadow-lg">
          <ListaPeliculas />
        </div>

        <div className="backdrop-blur-lg bg-white/20 rounded-xl p-4 shadow-lg">
          <Plataformas />
        </div>

        <div className="backdrop-blur-lg bg-white/20 rounded-xl p-4 shadow-lg">
          <ListaSeries />
        </div>

        <div className="backdrop-blur-lg bg-white/20 rounded-xl p-4 shadow-lg">
          <CalendarioCita />
        </div>
      </div>
      <PairModal open={showPair} onClose={() => setShowPair(false)} />
      <Toast alert={alert} onClose={() => setAlert(null)} />
    </div>
  )
}

export default Home