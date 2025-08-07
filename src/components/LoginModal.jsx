import { useContext, useState } from "react";
import { GlobalContext } from "../context/GlobalContext";

export default function LoginModal() {
  const { showLogin, setShowLogin, signIn, signUp, authLoading, showAlert } =
    useContext(GlobalContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  
  const validatePassword = (password) => {
      const errors = [];
      
      if (password.length < 8) {
          errors.push("Debe tener al menos 8 caracteres.");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Debe incluir una letra mayúscula.");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("Debe incluir una letra minúscula.");
        }
        if (!/[0-9]/.test(password)) {
            errors.push("Debe incluir al menos un número.");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push("Debe incluir un carácter especial.");
        }
        
        return errors;
    };
    
      const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password)
          return showAlert("Completa correo y contraseña.", "failure");
        if (!isValidEmail(email))
          return showAlert("El correo no es válido.", "failure");
        await signIn(email, password);
      };
    
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !name)
      return showAlert("Completa todos los campos.", "failure");
    if (!isValidEmail(email))
      return showAlert("El correo no es válido.", "failure");

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordErrors([]); // Limpia si pasa validaciones
    await signUp(email, password, name);
  };

  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
          onClick={() => setShowLogin(false)}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
        </h2>

        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              className="w-full p-2 mb-3 border rounded"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="w-full p-2 mb-3 border rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full p-2 mb-3 border rounded"
            required
          />
          {isRegister && passwordErrors.length > 0 && (
            <ul className="text-sm text-red-600 mb-3 space-y-1">
              {passwordErrors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className={`w-full text-white py-2 rounded transition-colors ${
              authLoading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
          >
            {authLoading
              ? isRegister
                ? "Creando cuenta..."
                : "Ingresando..."
              : isRegister
              ? "Registrarse"
              : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-3">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-purple-600 hover:underline font-medium"
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
}
