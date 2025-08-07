import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

export default function ProfileButton({ onOpenPair = () => {} }) {
  const { user, profile, signOut, pair } = useContext(GlobalContext); 
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const displayName = profile?.nombre || user.email;

return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
            console.log('[ProfileButton] toggle open');
            setOpen(v => !v)}}
        className="bg-white/20 text-white px-3 py-2 rounded-xl shadow hover:bg-white/30"
      >
        {displayName}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="w-56 bg-white text-gray-800 rounded-xl shadow-xl p-2">
            <div className="px-3 py-2 text-sm">
              {pair?.invite_code ? (
                <span className="text-gray-600">Pareja conectada</span>
              ) : (
                <span className="text-gray-600">Sin pareja</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                 console.log('[ProfileButton] onOpenPair clicked', typeof onOpenPair);
                onOpenPair?.();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
            >
              Conectar pareja
            </button>

            <button
              type="button"
              onClick={signOut}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-rose-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
