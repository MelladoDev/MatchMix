import { useEffect, useState, useContext } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { IoClose } from "react-icons/io5";
import { GlobalContext } from "../context/GlobalContext";

const fmtLabel = (date) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

export default function CalendarioCita() {
  const { addCita, listCitas, deleteCita, user } = useContext(GlobalContext);
  const [selected, setSelected] = useState(null);
  const [citas, setCitas] = useState([]);

  const reload = async () => setCitas(await listCitas());

  useEffect(() => {
    reload();
  }, []);

  const onSelectDay = async (d) => {
    if (!d) return;
    setSelected(d);
    const iso = d.toISOString().split("T")[0]; // YYYY-MM-DD
    await addCita(iso);
    await reload();
  };
  return (
    <div className="p-4">
      <h2 className="text-3xl mb-3">📅 Próxima Cita</h2>

      {/* Calendario siempre visible */}
      <DayPicker
        className="bg-indigo-200/30 p-2 rounded-xl shadow-md shadow-black/50"
        mode="single"
        selected={selected}
        onSelect={onSelectDay} // fija la fecha
        disabled={{ before: new Date() }} // evita fechas pasadas
        weekStartsOn={1} // comienza en lunes
      />

      {/* Mostrar fecha seleccionada + eliminar */}
      <div className="mt-4 space-y-2">
        {citas.length === 0 && (
          <p className="text-sm text-white/80">
            No hay fechas aún. Elige una en el calendario.
          </p>
        )}

        {citas.map((c) => {
          const dateObj = new Date(c.fecha + "T00:00:00");
          return (
            <div
              key={c.id}
              className="flex justify-between items-center bg-indigo-200/30 p-2 rounded-xl shadow-md shadow-black/50"
            >
              <div className="flex flex-col">
                <span className="text-lg font-semibold capitalize">
                  {fmtLabel(dateObj)}
                </span>
                {/* Si quieres indicar quién agregó: */}
                <span className="text-xs text-white/70">
                  Agregada por: {c.agregado_por === user?.id ? "Tú" : "Pareja"}
                </span>
              </div>
              <button
                onClick={async () => {
                  await deleteCita(c.id);
                  await reload();
                }}
                className="p-2 rounded bg-indigo-600/60 text-white hover:bg-indigo-700"
                title="Eliminar"
              >
                <IoClose strokeWidth={33} size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
