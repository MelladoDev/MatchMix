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
import BuscadorTMDB from "../components/BuscadorTMDB";

const Home = () => {

 const { showLogin, setShowLogin, alert, setAlert, user } = useContext(GlobalContext);
const [showPair, setShowPair] = useState(false);
const cardStyle = "bg-indigo-300/50 rounded-xl p-4 shadow-black/60 shadow-xl h-fit ";
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-violet-900 via-violet-950 to-purple-900 ">
      <h1 className="text-5xl font-bold text-white mb-6 text-center  ">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.5fr_1fr] auto-rows-min gap-10 z-10">
        <div className={`col-start-1 row-start-1 row-span-2 ${cardStyle}`}>
          <Ruleta />
        </div>

        <div className={`col-start-2 row-start-1 h-fit ${cardStyle}`}>
          <BuscadorTMDB />
        </div>

        <div className={`col-start-2 row-start-2 ${cardStyle}`}>
          <Plataformas />       
        </div>

        <div className={`col-start-3 row-start-1 ${cardStyle}`}>
          <ListaPeliculas />
        </div>

        <div className={`col-start-1 row-start-3  ${cardStyle}`}>
          <ListaSeries />
        </div>

        <div className={`col-start-2 row-start-3 ${cardStyle}`}>
          <CalendarioCita />
        </div>
      </div>
      <PairModal open={showPair} onClose={() => setShowPair(false)} />
      <Toast alert={alert} onClose={() => setAlert(null)} />
    </div>
  )
}

export default Home