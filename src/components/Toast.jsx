import { FcOk } from "react-icons/fc";
import { FcInfo } from "react-icons/fc";
import { AiTwotoneExclamationCircle } from "react-icons/ai";
import { AiOutlineStop } from "react-icons/ai";

export default function Toast({ alert, onClose }) {
  if (!alert) return null;
  const { type = "info", message } = alert;

  const base =
    "fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl text-white shadow-xl transition-all duration-300";
  const bg = {
    success: "bg-gradient-to-r from-purple-600 to-pink-600",
    info: "bg-purple-500",
    warning: "bg-amber-500",
    failure: "bg-rose-400",
  }[type];

  const icon = {
    success: <FcOk size={20} />,
    info: <FcInfo size={20} />,
    warning: <AiTwotoneExclamationCircle size={20} />,
    failure: <AiOutlineStop strokeWidth={33} size={20} />,
  }[type];

  return (
    <div role="status" className={`${base} ${bg}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none">{icon}</span>
        <div className="text-sm leading-5">
          {message}
        </div>
        <button
          onClick={onClose}
          className="ml-2 opacity-80 hover:opacity-100"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
