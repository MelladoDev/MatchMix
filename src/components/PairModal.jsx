import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

export default function PairModal({ open, onClose }) {
  const { pair, createOrGetPairCode, joinPairByCode, showAlert } = useContext(GlobalContext);
  const [myCode, setMyCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (!open) return;
    // precargar código si ya existe
    if (pair?.invite_code) setMyCode(pair.invite_code);
    else setMyCode("");
    setJoinCode("");
  }, [open, pair]);

  if (!open) return null;

  const handleGenerate = async () => {
    const code = await createOrGetPairCode();
    if (code) setMyCode(code);
  };

  const handleCopy = async () => {
    if (!myCode) return;
    await navigator.clipboard.writeText(myCode);
    showAlert("Código copiado al portapapeles.", "info");
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    await joinPairByCode(joinCode);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-purple-700">Conectar pareja</h2>

        <div className="mb-5">
          <p className="text-sm text-gray-600 mb-2">Tu código para compartir</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={myCode || "— aún no generado —"}
              className="flex-1 p-2 border rounded bg-gray-50"
            />
            <button
              onClick={myCode ? handleCopy : handleGenerate}
              className="px-3 py-2 rounded text-white bg-purple-500 hover:bg-purple-600"
            >
              {myCode ? "Copiar" : "Generar"}
            </button>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-2">
          <p className="text-sm text-gray-600">Unirme con un código</p>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="w-full p-2 border rounded"
            maxLength={8}
            required
          />
          <button
            type="submit"
            className="w-full py-2 rounded text-white bg-purple-500 hover:bg-purple-600"
          >
            Conectar
          </button>
        </form>
      </div>
    </div>
  );
}
