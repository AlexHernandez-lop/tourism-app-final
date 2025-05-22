import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';

export function TouristProfile() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-800">No autenticado. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8">
        {/* Encabezado alineado a la izquierda */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Perfil del Turista</h2>
          <p className="text-gray-600 mt-1">Usuario: {user.username}</p>
        </div>

        {/* Botón grande ancho */}
        <button
          onClick={() => navigate('/tourist-preferences')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow text-xl mb-10"
        >
          Modificar preferencias de recomendaciones
        </button>

        {/* Botón cerrar sesión */}
        <div className="text-left">
          <button
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
