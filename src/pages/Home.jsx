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
const cardStyle = "bg-indigo-300/50 rounded-xl p-4 shadow-black/60 shadow-xl flex justify-center  items-center ";
  return (
    <div className=" p-6 bg-gradient-to-br from-violet-900 via-violet-950 to-purple-900 overflow-auto ">
      <h1 className="text-5xl font-bold text-white mb-6 text-center  ">
        💞 MatchMix
      </h1>

<div className="relative mb-5 text-center">
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


      {showLogin && <LoginModal />}
      <div className='flex h-screen w-full items-center justify-center p-4'>
      <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-flow-dense  lg:grid-cols-12 lg:grid-rows-6 gap-10  ">
        <div className={`col-span-4 row-span-5 ${cardStyle}`}>
          <ListaPeliculas />
        </div>

        <div className={`col-span-4 row-span-1   ${cardStyle}`}>
          <BuscadorTMDB />
        </div>

        <div className={` col-span-4 row-span-4  ${cardStyle}`}>
          <Ruleta />
        </div>

        <div className={`col-span-3 row-span-2  ${cardStyle}`}>
          <Plataformas />       
        </div>

        <div className={`col-span-3 row-span-3  ${cardStyle}`}>
          <CalendarioCita />
        </div>

        {/* <div className={`col-span-4 row-span-1 ${cardStyle}`}>
          <ListaSeries />
        </div> */}

      </div>
      </div>

      <PairModal open={showPair} onClose={() => setShowPair(false)} />
      <Toast alert={alert} onClose={() => setAlert(null)} />
    </div>
  )
}

export default Home