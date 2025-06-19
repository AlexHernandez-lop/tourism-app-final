import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';

type Servicio = {
  titulo: string;
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

type Reservation = {
  serviceId: string;
  providerId: string;
  fechaReserva: string;
  numPersonas: number;
  nombreCliente: string;
  emailCliente: string;
};

type ReservationWithService = Reservation & {
  titulo: string;
  imagen: string;
};

export function ProviderProfile() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [services, setServices] = useState<Servicio[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorServices, setErrorServices] = useState('');

  const [reservations, setReservations] = useState<ReservationWithService[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [errorReservations, setErrorReservations] = useState('');

  const navigate = useNavigate();

  // Fetch servicios del proveedor
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
      setErrorServices('No se pudieron cargar los servicios.');
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch reservaciones del proveedor
  const fetchReservations = async (providerId: string) => {
    try {
      const response = await fetch(
        `https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/reservations/get-by-providerid?providerId=${encodeURIComponent(providerId)}`
      );
      if (!response.ok) {
        throw new Error('Error al obtener reservaciones');
      }
      const data = await response.json();
      const rawReservations: Reservation[] = data.reservations || [];

      // Enriquecer reservaciones con info de servicio
      const enrichedReservations = await Promise.all(
        rawReservations.map(async (res) => {
          try {
            const serviceRes = await fetch(
              `https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/service/get-by-id?ServiceID=${res.serviceId}`
            );
            const serviceData = await serviceRes.json();

            return {
              ...res,
              titulo: serviceData.servicio?.titulo || "Título no disponible",
              imagen: serviceData.servicio?.imagenes?.[0] || "",
            };
          } catch (err) {
            console.error("Error al obtener detalles del servicio:", err);
            return {
              ...res,
              titulo: "Título no disponible",
              imagen: "",
            };
          }
        })
      );

      setReservations(enrichedReservations);
    } catch (err) {
      console.error("Error al cargar reservaciones:", err);
      setErrorReservations('No se pudieron cargar las reservaciones.');
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchReservations(user.username);
      fetchServices(user.username);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-800">No autenticado. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Título principal */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Perfil del Proveedor</h1>
          </div>
          <button
            onClick={() => navigate('/agregar-servicio')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            Agregar Servicio
          </button>
        </div>

        {/* Panel Reservaciones */}
        <div className="border-2 border-red-500 rounded-xl p-6 mb-10 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Reservaciones</h2>

          {loadingReservations ? (
            <p className="text-gray-600">Cargando reservaciones...</p>
          ) : errorReservations ? (
            <p className="text-red-500">{errorReservations}</p>
          ) : reservations.length === 0 ? (
            <p className="text-gray-600">No tienes reservaciones registradas.</p>
          ) : (
            <ul className="space-y-4">
              {reservations.map((res, idx) => (
                <li key={idx} className="border border-gray-300 rounded-lg p-4 shadow-sm bg-gray-50 flex flex-col sm:flex-row items-start gap-4">
                  {res.imagen && (
                    <img
                      src={res.imagen}
                      alt="Imagen del servicio"
                      className="w-full sm:w-48 h-32 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="text-xl font-semibold">{res.titulo}</p>
                    <p className="text-gray-600"><strong>Fecha:</strong> {new Date(res.fechaReserva).toLocaleString()}</p>
                    <p className="text-gray-600"><strong>Personas:</strong> {res.numPersonas}</p>
                    <p className="text-gray-600"><strong>Cliente:</strong> {res.nombreCliente}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel Servicios */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tus servicios</h2>

          {loadingServices ? (
            <p className="text-center text-gray-500">Cargando servicios...</p>
          ) : errorServices ? (
            <p className="text-center text-red-500">{errorServices}</p>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer"
                  onClick={() => navigate(`/provider/service/${idx}`)}
                >
                  <img
                    src={service.imagenes?.[0] || "https://via.placeholder.com/400x300?text=Imagen+no+disponible"}
                    alt={service.descripcion}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800">{service.titulo}</h3>
                    <p className="text-gray-600 mt-1">{service.tipoActividad}</p>
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
        </div>

        {/* Botón cerrar sesión */}
        <div className="text-center mt-10">
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
