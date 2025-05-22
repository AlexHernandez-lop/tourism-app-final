import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

type Servicio = {
  titulo: string;
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

export function ServiceDetail() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<Servicio | null>(null);

  useEffect(() => {
    fetch("https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/getallservices")
      .then((res) => res.json())
      .then((data) => {
        const parsedBody = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
        const servicios = parsedBody?.servicios || data?.servicios || [];
        setServicio(servicios[Number(index)]);
      })
      .catch((err) => {
        console.error("Error al cargar servicio:", err);
      });
  }, [index]);

  if (!servicio) return <div className="p-6 text-center">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center text-blue-600 hover:underline"
      >
        ← Regresar
      </button>

      <h1 className="text-3xl font-bold mb-2">{servicio.titulo}</h1>
      <p className="text-gray-600 mb-4">{servicio.tipoActividad} | {servicio.ubicacion}</p>
      <p className="text-lg text-green-700 font-semibold mb-4">${servicio.precio} MXN</p>
      <p className="text-gray-800 mb-6 whitespace-pre-wrap">{servicio.descripcion}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {servicio.imagenes.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Imagen ${i + 1}`}
            className="w-full h-64 object-cover rounded-lg shadow"
          />
        ))}
      </div>
    </div>
  );
}
