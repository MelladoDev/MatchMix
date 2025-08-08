import netflix from '../assets/Netflix.svg';
import prime from '../assets/PrimeVideo.svg';
import disney from '../assets/Disney.svg';
import hbo from '../assets/HBOMax.svg';
import yt from '../assets/youtube.svg';
import crunchy from '../assets/crunchyroll.svg';

const plataformas = [
  { nombre: 'Netflix', icono: netflix, url: 'https://www.netflix.com/' },
  { nombre: 'Prime Video', icono: prime, url: 'https://www.primevideo.com/' },
  { nombre: 'Disney+', icono: disney, url: 'https://www.disneyplus.com/' },
  { nombre: 'HBO Max', icono: hbo, url: 'https://www.max.com/' },
  { nombre: 'YouTube', icono: yt, url: 'https://www.youtube.com/' },
  { nombre: 'Crunchyroll', icono: crunchy, url: 'https://www.crunchyroll.com/' },
];

const Plataformas = () => (
  <div className="p-2 ">
  <h2 className="text-3xl font-bold mb-4">📺 Dónde Ver</h2>
    <div className="grid grid-cols-3 gap-4 place-items-center p-2">
      {plataformas.map((p) => (
        <a
          key={p.nombre}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          title={p.nombre}
        >
          <img
            src={p.icono}
            alt={p.nombre}
            className="w-18 h-18 hover:scale-110 transition-transform bg-indigo-200/60 p-2 rounded-xl shadow-md shadow-black"
          />
        </a>
      ))}
    </div>
  </div>
);


    

export default Plataformas