import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Link, useNavigate } from "react-router-dom";

type Servicio = {
  ServiceID: string;
  titulo: string;
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

const categoriaMap: { [key: string]: string } = {
  "Tour guiado": "tour",
  "Caminata en senderos": "caminata",
  "Buceo": "buceo",
  "Cascadas": "cascadas",
  "Paseo en lancha rápida": "lancha",
  "Snorkel": "snorkel",
  "Observación de aves migratorias": "aves",
  "Experiencia cultural": "cultura",
  "Excursión en kayak": "kayak",
  "Camping en la montaña": "camping",
  "Avistamiento de fauna silvestre": "fauna",
  "Tour arqueológico": "arqueologia",
  "Paseo en bicicleta de montaña": "bicicleta",
  "Tour de jardines botánicos": "jardines",
  "Tour de templos y monumentos": "templos",
  "Observación de estrellas": "estrellas",
  "Piscinas naturales, cenotes": "piscinas",
};

export function RecommendedServices() {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();

  const [services, setServices] = useState<Servicio[]>([]);
  const [preferences, setPreferences] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/getallservices")
      .then((res) => res.json())
      .then((data) => {
        const parsedBody = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
        const servicios = parsedBody?.servicios || data?.servicios || [];
        setServices(servicios);
      })
      .catch((err) => {
        console.error("Error al cargar servicios:", err);
        setError("Error al cargar servicios");
      });
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    fetch(`https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/add_preferences?TouristID=${user.username}`)
      .then((res) => res.json())
      .then((data) => {
        const prefs = { ...data.preferences };
        delete prefs.timestamp;
        delete prefs.TouristID;
        setPreferences(prefs);
      })
      .catch((err) => {
        console.error("Error al cargar preferencias:", err);
        setError("Error al cargar preferencias");
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><p>Usuario no autenticado, redirigiendo...</p></div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;
  }

  const top3Categorias = Object.entries(preferences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([categoria]) => categoria);

  const filteredServices = services.filter((servicio) => {
    const clavePref = categoriaMap[servicio.tipoActividad];
    return clavePref && top3Categorias.includes(clavePref);
  });

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Servicios recomendados para ti</h1>
      {filteredServices.length === 0 ? (
        <p className="text-center text-gray-600">
          No se encontraron servicios para tus preferencias actuales.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((servicio) => (
            <Link to={`/service/${servicio.ServiceID}`} state={{ from: location.pathname }} key={servicio.ServiceID}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer">
                <img
                  src={servicio.imagenes[0]}
                  alt={servicio.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">{servicio.titulo}</h3>
                  <p className="text-gray-600 mt-1">{servicio.tipoActividad}</p>
                  <p className="text-green-700 font-bold mt-2">${servicio.precio} MXN</p>
                  <p className="text-sm text-gray-500 mt-1">{servicio.ubicacion}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
