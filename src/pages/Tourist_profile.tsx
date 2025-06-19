import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';

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

export function TouristProfile() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationWithService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const fetchReservations = async () => {
        try {
          const response = await fetch(
            `https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/reservations/get-by-touristid?TouristID=${user.username}`
          );
          const data = await response.json();
          const rawReservations: Reservation[] = data.reservations || [];

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
        } finally {
          setLoading(false);
        }
      };

      fetchReservations();
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

        {/* Título principal */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Perfil del Turista
        </h1>

        {/* Contenedor de reservaciones con marco rojo */}
        <div className="border-2 border-red-500 rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tus reservaciones</h2>

          {loading ? (
            <p className="text-gray-600">Cargando reservaciones...</p>
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

        {/* Botones de acción */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/tourist-preferences')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow text-xl mb-6"
          >
            Modificar preferencias de recomendaciones
          </button>

          <button
            onClick={() => {
              signOut();
              navigate('/');
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
