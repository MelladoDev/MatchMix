import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { GlobalContext } from "../context/GlobalContext";
import { BiSolidLeftArrow } from "react-icons/bi";

const SLOT_H = 88; // alto de cada fila (px)
const VISIBLE_ROWS = 3; // ventana visible (3 * 88 = 264px)
const CENTER_Y = (VISIBLE_ROWS * SLOT_H) / 2; // línea central

const cut = (s, n = 30) =>
  s?.length > n ? s.slice(0, n - 1) + "…" : s || "Sin título";

export default function SlotOneReelInfinite() {
  const { getCoupleList, profile, normalizeItem } = useContext(GlobalContext);

  const [mode, setMode] = useState("movie"); // 'movie' | 'tv'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const reelRef = useRef(null);

  // anim refs
  const rafId = useRef(null);
  const phaseRef = useRef("idle"); // 'idle' | 'accel' | 'cruise' | 'decel'
  const offsetRef = useRef(0); // px acumulados (mod total)
  const velRef = useRef(0); // px/s
  const startTsRef = useRef(0);
  const phaseStartRef = useRef(0);
  const targetOffsetRef = useRef(null); // px absoluto para el fin

  // config anim
  const MAX_V = 1800; // px/s
  const ACCEL_MS = 300;
  const CRUISE_MS = 800;
  const DECEL_MS = 900;

  // Cargar lista
  const load = useCallback(
    async (preferCache = true) => {
      if (!profile?.pareja_id) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const list = await getCoupleList({ preferCache });
        const pool = (list || [])
          .filter((i) => (i.media_type || i.tmdb?.media_type) === mode)
          .map((i) => (i.tmdb ? i : { ...i, tmdb: normalizeItem(i) }));
        setItems(pool);
      } finally {
        setLoading(false);
      }
    },
    [getCoupleList, profile?.pareja_id, mode, normalizeItem]
  );

  useEffect(() => {
    let alive = true;
    if (profile?.pareja_id) load(true);
    const onUpd = () => alive && load(false);
    window.addEventListener("lists-updated", onUpd);
    return () => {
      alive = false;
      window.removeEventListener("lists-updated", onUpd);
    };
  }, [profile?.pareja_id, load]);

  // Datos extendidos para loop infinito (pintamos 3 copias)
  const reelData = useMemo(() => {
    const base = items.length ? items : [];
    return [...base, ...base, ...base]; // triple para cubrir el loop visual
  }, [items]);

  const totalLenPx = useMemo(
    () => (items.length || 1) * SLOT_H,
    [items.length]
  );

  // RAF loop
  const tick = useCallback(
    (ts) => {
      if (!startTsRef.current) startTsRef.current = ts;
      if (!phaseStartRef.current) phaseStartRef.current = ts;
      const dt = Math.max(0, ts - (tick.prevTs || ts)) / 1000; // s
      tick.prevTs = ts;

      let offset = offsetRef.current;
      let vel = velRef.current;
      const phase = phaseRef.current;

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      if (phase === "accel") {
        const t = ts - phaseStartRef.current;
        const a = MAX_V / ACCEL_MS; // px/s per ms
        vel = Math.min(MAX_V, vel + a * (dt * 1000));
        offset += vel * dt;
        if (t >= ACCEL_MS) {
          phaseRef.current = "cruise";
          phaseStartRef.current = ts;
          vel = MAX_V;
        }
      } else if (phase === "cruise") {
        const t = ts - phaseStartRef.current;
        offset += MAX_V * dt;
        if (t >= CRUISE_MS) {
          phaseRef.current = "decel";
          phaseStartRef.current = ts;
          // preparar interpolación de posición hacia el target
          tick.decelStart = offset;
        }
      } else if (phase === "decel") {
        const t = ts - phaseStartRef.current;
        const d = Math.min(1, t / DECEL_MS);
        const start = tick.decelStart || offset;
        const target = targetOffsetRef.current ?? start;
        const eased = start + (target - start) * easeOutCubic(d);
        vel = (eased - offset) / dt; // derivada aprox
        offset = eased;
        if (d >= 1) {
          // fin
          offset = target;
          vel = 0;
          phaseRef.current = "idle";
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
          setSpinning(false);

          // emitir resultado
          const idx = Math.round(
            (((offset % totalLenPx) + totalLenPx) % totalLenPx) / SLOT_H
          );
          const finalIdx = idx % (items.length || 1);
          setResult(items[finalIdx] || null);
          return; // no solicitar siguiente frame
        }
      } else {
        // idle -> mantener loop visual suave por si queremos “reposo animado” (opcional)
        vel = 0;
      }

      // wrap infinito
      if (totalLenPx > 0) {
        offset = ((offset % totalLenPx) + totalLenPx) % totalLenPx;
      }

      // pintar
      offsetRef.current = offset;
      velRef.current = vel;

      const reel = reelRef.current;
      if (reel) {
        // movemos hacia arriba => usamos negativo
        reel.style.transform = `translateY(-${offset}px)`;
      }

      rafId.current = requestAnimationFrame(tick);
    },
    [items, totalLenPx]
  );

  // Calcular offset objetivo para dejar item k centrado
  const computeTargetForIndex = useCallback(
    (k) => {
      // Queremos: (k * SLOT_H + SLOT_H/2) - offset = CENTER_Y
      // => target = k*SLOT_H + SLOT_H/2 - CENTER_Y
      const baseTarget = k * SLOT_H + SLOT_H / 2 - CENTER_Y;
      // aseguramos que sea > offset actual añadiendo ciclos completos
      const cycles = Math.ceil(
        (offsetRef.current - baseTarget) / totalLenPx + 2
      ); // +2 vueltas extra
      return baseTarget + cycles * totalLenPx;
    },
    [totalLenPx]
  );

  const spin = () => {
    if (!items.length || spinning) return;
    setResult(null);
    setSpinning(true);

    // índice ganador real
    const finalIdx = Math.floor(Math.random() * items.length);

    // setear fases
    phaseRef.current = "accel";
    phaseStartRef.current = 0;
    startTsRef.current = 0;
    velRef.current = 0;
    // destino para el decel
    targetOffsetRef.current = computeTargetForIndex(finalIdx);

    if (!rafId.current) rafId.current = requestAnimationFrame(tick);
  };

  const ReelItem = ({ it }) => (
    <div className="flex items-center gap-3 px-3 h-[88px]">
      <img
        src={it.tmdb?.poster || it.poster || "/placeholder.jpg"}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.jpg";
        }}
        alt=""
        className="w-12 h-16 object-cover rounded-md shadow"
      />
      <div className="text-white">
        <div className="font-semibold leading-tight">
          {cut(it.tmdb?.title || it.tmdb?.name)}
        </div>
        <div className="text-xs opacity-75">
          {(it.media_type || it.tmdb?.media_type) === "movie"
            ? "Película"
            : "Serie"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 p-4" >
      <h2 className="text-3xl font-bold text-white">
        🎰 Ruleta MatchMix – ¡Dale al Spin!
      </h2>

      {/* Tabs */}
      <div className="inline-flex rounded-xl bg-white/15 p-">
        <button
          className={`px-3 py-1 rounded-lg text-sm ${
            mode === "movie" ? "bg-white text-indigo-700" : "text-white/80"
          }`}
          onClick={() => !spinning && setMode("movie")}
          disabled={spinning}
        >
          Películas
        </button>
        <button
          className={`px-3 py-1 rounded-lg text-sm ${
            mode === "tv" ? "bg-white text-indigo-700" : "text-white/80"
          }`}
          onClick={() => !spinning && setMode("tv")}
          disabled={spinning}
        >
          Series
        </button>
      </div>

      {/* Máquina */}
      <div className="w-full max-w-xl rounded-2xl bg-indigo-300/60 p-4 shadow-xl ">
        <div className="relative mx-auto w-full overflow-hidden rounded-xl bg-indigo-900/50">
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-white/20" />
          <div className="h-[264px]">
            {" "}
            {/* 3 filas visibles */}
            <div
              ref={reelRef}
              style={{ willChange: "transform", transform: "translateY(0px)" }}
            >
              {/* Pintamos 3 copias para loop visual continuo */}
              {reelData.map((it, i) => (
                <ReelItem key={`r-${i}`} it={it} />
              ))}
            </div>
          </div>
          {/* guía central */}
          <div className="relative w-full overflow-hidden" />
  <BiSolidLeftArrow 
    size={96}
    className="pointer-events-none absolute left-120  top-0 text-purple-800 drop-shadow-lg drop-shadow-black z-20"
    />
        </div>

        {/* Botón */}
        <div className="flex justify-center mt-4">
          <button
            onClick={spin}
            disabled={loading || !items.length || spinning}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow disabled:opacity-60"
          >
            {spinning ? "Girando…" : "Spin"}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <div className="bg-white/10 p-4 rounded-xl text-white w-full max-w-xl">
          <div className="font-semibold mb-1">🎉 Resultado:</div>
          <div className="flex items-center gap-3">
            <img
              src={result.tmdb?.poster || result.poster || "/placeholder.jpg"}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
              className="w-12 h-16 object-cover rounded-md"
              alt=""
            />
            <div>
              <div className="font-bold">
                {result.tmdb?.title || result.tmdb?.name}
              </div>
              <div className="text-xs opacity-75">
                {(result.media_type || result.tmdb?.media_type) === "movie"
                  ? "Película"
                  : "Serie"}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="text-white/80">Cargando…</p>}
      {!loading && !items.length && (
        <p className="text-white/80">No hay elementos para la máquina.</p>
      )}
    </div>
  );
}
