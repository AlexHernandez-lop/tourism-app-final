// === Archivo: ProviderServiceDetail.tsx ===
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';

export type Servicio = {
  titulo: string;
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

export function ProviderServiceDetail() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { index } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchServicio = async () => {
      try {
        const res = await fetch(`https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/get-by-provider?providerId=${user.username}`);
        const data = await res.json();
        const servicios = data.servicios || [];
        const idx = Number(index);
        if (isNaN(idx) || !servicios[idx]) {
          setError("Servicio no encontrado");
        } else {
          setServicio(servicios[idx]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar el servicio.");
      }
    };

    fetchServicio();
  }, [user, index, navigate]);

  if (!user) {
    return <div>No autenticado. Redirigiendo...</div>;
  }

  if (error) return <div>{error}</div>;
  if (!servicio) return <div>Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        ← Regresar
      </button>

      <h1 className="text-3xl font-bold mb-2">{servicio.titulo}</h1>
      <p className="text-gray-600 mb-4">{servicio.tipoActividad} | {servicio.ubicacion}</p>
      <p className="text-lg text-green-700 font-semibold mb-4">${servicio.precio} MXN</p>
      <p className="mb-6">{servicio.descripcion}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {servicio.imagenes.map((img, i) => (
          <img key={i} src={img} alt={`Imagen ${i + 1}`} className="w-full h-64 object-cover rounded" />
        ))}
      </div>

      <button
        onClick={() => navigate(`/editar-servicio/${index}`)}
        className="form-button"
      >
        Editar servicio
      </button>
    </div>
  );
}
