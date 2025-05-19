import { Authenticator } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '@aws-amplify/ui-react/styles.css';

type Servicio = {
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

export function ProviderProfile() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchServices = async (providerId: string) => {
    try {
      const response = await fetch(`https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/get-by-provider?providerId=${encodeURIComponent(providerId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los servicios');
      }

      const data = await response.json();
      setServices(data.servicios || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => {
        useEffect(() => {
          if (user?.username) {
            fetchServices(user.username);
          }
        }, [user]);

        return (
          <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Encabezado */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Perfil del Proveedor</h2>
                  <p className="text-gray-600">Usuario: {user?.username}</p>
                </div>
                <button
                  onClick={() => navigate('/agregar-servicio')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
                >
                  Agregar Servicio
                </button>
              </div>

              {/* Contenido de servicios */}
              {loading ? (
                <p className="text-center text-gray-500">Cargando servicios...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <img
                        src={service.imagenes?.[0] || "https://via.placeholder.com/400x300?text=Imagen+no+disponible"}
                        alt={service.descripcion}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <p className="text-gray-600 mt-1">{service.descripcion}</p>
                        <p className="text-sm text-gray-500 mt-1">Categoría: {service.tipoActividad}</p>
                        {service.precio !== undefined && (
                          <p className="text-green-700 font-bold mt-2">${service.precio} MXN</p>
                        )}
                        {service.ubicacion && (
                          <p className="text-sm text-gray-500">{service.ubicacion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No hay servicios registrados.</p>
              )}

              {/* Botón de cerrar sesión */}
              <div className="text-center mt-10">
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
            </div>
          </div>
        );
      }}
    </Authenticator>
  );
}
