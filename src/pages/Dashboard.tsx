import { Authenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import '@aws-amplify/ui-react/styles.css';

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Bienvenido al Dashboard</h1>
        <p className="mb-6 text-gray-600">Has iniciado sesión correctamente.</p>
        
        <Authenticator>
          {({ signOut, user }) => (
            <div className="text-center">
              <p className="mb-4">Usuario: {user?.username}</p>
              <button
                onClick={() => {
                  signOut?.();
                  navigate('/'); // Redirige a la página principal (login) después de cerrar sesión
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </Authenticator>
      </div>
    </div>
  );
}