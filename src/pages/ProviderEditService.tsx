import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Servicio } from './ProviderServiceDetail';

const API_UPDATE_URL = "https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/service";
const API_GET_URL = "https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/get-by-provider";

const TIPOS_DE_ACTIVIDAD = [
  'Tour guiado', 'Caminata en senderos', 'Buceo', 'Cascadas', 'Paseo en lancha rápida',
  'Observación de aves migratorias', 'Experiencia cultural', 'Excursión en kayak',
  'Camping en la montaña', 'Avistamiento de fauna silvestre', 'Tour arqueológico',
  'Paseo en bicicleta de montaña', 'Tour de jardines botánicos',
  'Tour de templos y monumentos', 'Observación de estrellas', 'Piscinas naturales, cenotes'
];

export function EditarServicio() {
  const { index } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const res = await fetch(`${API_GET_URL}?providerId=${session.tokens?.idToken?.payload['cognito:username']}`);
        const data = await res.json();
        const idx = Number(index);
        setServicio(data.servicios[idx]);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el servicio.');
      }
    };

    fetchData();
  }, [index]);

  const handleChange = (field: keyof Servicio, value: any) => {
    setServicio((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const response = await fetch(API_UPDATE_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify(servicio),
      });

      const result = await response.json();

      if (response.ok) {
        setMensaje('Servicio actualizado correctamente');
        setTimeout(() => navigate(-1), 2000);
      } else {
        setError(result.error || 'Error al actualizar el servicio');
      }
    } catch (err) {
      console.error(err);
      setError('Error al enviar la solicitud');
    }
  };

  if (!servicio) return <div className="p-6">Cargando...</div>;

  return (
    <div className="servicio-container">
      <div className="servicio-form ancho-personalizado">
        <h2 className="titulo-principal" style={{textAlign: 'center'}}>Editar Servicio</h2>

        <form onSubmit={handleSubmit} className="form-fields">

          <div className="form-group">
            <p className="titulo-galeria">Nombre</p>
            <p className="subtitulo-galeria">Escribe el nombre o título de la actividad.</p>
            <input
              type="text"
              placeholder="Nombre de la actividad"
              value={servicio.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              className="form-input campo-grande"
            />
          </div>

          <div className="form-group">
            <p className="titulo-galeria">Descripción</p>
            <p className="subtitulo-galeria">Añade una amplia descripción de tu servicio para que los clientes sepan de qué se trata y qué es lo que incluye.</p>
            <input
              type="text"
              placeholder="Descripción"
              value={servicio.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className="form-input campo-grande"
            />
          </div>

          <div className="form-group">
            <p className="titulo-galeria">Ubicación</p>
            <p className="subtitulo-galeria">Indica dónde se llevará a cabo el servicio.</p>
            <input
              type="text"
              placeholder="Ubicación"
              value={servicio.ubicacion}
              onChange={(e) => handleChange('ubicacion', e.target.value)}
              className="form-input campo-grande"
            />
          </div>

          <div className="form-group">
            <p className="titulo-galeria">Precio</p>
            <p className="subtitulo-galeria">Establece el costo por persona o por servicio.</p>
            <input
              type="number"
              placeholder="Precio"
              value={servicio.precio}
              onChange={(e) => handleChange('precio', Number(e.target.value))}
              className="form-input campo-grande"
            />
          </div>

          <div className="form-group">
            <p className="titulo-galeria">Selecciona el tipo de actividad:</p>
            <p className="subtitulo-galeria">Selecciona solo una categoría que mejor describa tu actividad.</p>
            <div className="checkbox-list">
              {TIPOS_DE_ACTIVIDAD.map((tipo) => (
                <label key={tipo} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={servicio.tipoActividad === tipo}
                    onChange={() =>
                      handleChange('tipoActividad', servicio.tipoActividad === tipo ? '' : tipo)
                    }
                  />
                  <span>{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="form-button">Guardar cambios</button>

          {mensaje && <p className="form-success">{mensaje}</p>}
          {error && <p className="form-error">{error}</p>}
        </form>
      </div>

      <div className="carousel-background">
        <div className="carousel-images"></div>
      </div>
    </div>
  );
}
