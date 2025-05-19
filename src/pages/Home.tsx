import { useEffect, useState } from "react";

const images = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1920&q=80",
];

type Servicio = {
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

export function Home() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [current, setCurrent] = useState(0);

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
      });
  }, []);

  // Filtrar servicios según el searchTerm
  const filteredServices = searchTerm
    ? services.filter((servicio) =>
        servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : services;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-gray-100 pb-20">
      {/* Imagen fija con texto superpuesto */}
      <div className="relative mx-auto mt-8 h-[40vh] w-[90%] rounded-xl overflow-hidden shadow-lg">
        <img
          src={images[current]}
          alt="Background"
          className="w-full h-full object-cover transition-opacity duration-1000 rounded-xl"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>

        {/* Texto sobre la imagen */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Turismo Sustentable
          </h1>
          <p className="text-xl md:text-2xl drop-shadow-md">
            Conecta con la naturaleza, transforma tu viaje.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative z-10 flex items-center justify-center mt-10 px-4">
        <div className="flex rounded-xl overflow-hidden shadow-md w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar por descripción"
            className="custom-search-input px-4 py-2 outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Servicios cargados */}
      <div className="w-full mt-10 px-6 md:px-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Servicios disponibles</h2>
        {filteredServices.length === 0 ? (
          <p className="text-center text-gray-500">No se encontraron servicios.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((servicio, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={servicio.imagenes[0]}
                  alt={servicio.descripcion}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">{servicio.descripcion}</h3>
                  <p className="text-gray-600 mt-1">{servicio.tipoActividad}</p>
                  <p className="text-green-700 font-bold mt-2">${servicio.precio} MXN</p>
                  <p className="text-sm text-gray-500 mt-1">{servicio.ubicacion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
