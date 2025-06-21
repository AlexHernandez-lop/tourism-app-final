import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const images = [
  "/img/banner-bg-1.jpg",
  "/img/banner-bg-2.jpeg",
  "/img/banner-bg-3.jpg",
];

type Servicio = {
  ServiceID: string;   // <-- Agregado para el ID único
  titulo: string;
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

export function Home() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 7000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex]);

  const filteredServices = searchTerm
    ? services.filter((servicio) =>
        servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : services;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-gray-100 pb-20">
      {/* Carrusel con desplazamiento horizontal */}
      <div className="relative mx-auto mt-8 h-[40vh] w-[90%] overflow-hidden rounded-xl shadow-lg">
        <div
          className="flex h-full w-full transition-transform duration-[1000ms] ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${currentIndex * (100 / images.length)}%)`,
          }}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover flex-shrink-0"
              style={{ width: `${100 / images.length}%` }}
            />
          ))}
        </div>
        {/* Overlay oscuro */}
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

      {/* Buscador limpio y uniforme */}
      <div className="relative z-10 flex items-center justify-center mt-10 px-4">
        <div className="w-full max-w-2xl">
          <input
            type="text"
            placeholder="Buscar por descripción"
            className="w-full px-5 py-3 rounded-xl border border-red-300 focus:border-2 focus:border-red-600 hover:border-red-500 outline-none transition-all duration-300 text-gray-700"
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
            {filteredServices.map((servicio) => (
              <Link to={`/service/${servicio.ServiceID}`} key={servicio.ServiceID}>
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
    </div>
  );
}
