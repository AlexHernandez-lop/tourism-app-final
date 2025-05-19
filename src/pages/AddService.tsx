import React, { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import "/src/amplify_override.css";

const TIPOS_DE_ACTIVIDAD = [
  'Tour',
  'Caminata',
  'Buceo',
  'Esnórquel',
  'Paseo en lancha',
  'Ruta gastronómica',
  'Observación de aves',
  'Museo',
  'Experiencia cultural',
];

export const AgregarServicio = () => {
  const [descripcion, setDescripcion] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!tipoSeleccionado) {
      setError('Debes seleccionar un tipo de actividad.');
      return;
    }

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const data = {
        descripcion,
        tipoActividad: tipoSeleccionado,
        ubicacion,
        precio: Number(precio),
        imagenes: ['https://tourismimagesbucket.s3.us-east-2.amazonaws.com/celestun.png'],
      };

      const response = await fetch('https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMensaje(result.message || 'Servicio registrado correctamente');
        setDescripcion('');
        setTipoSeleccionado('');
        setUbicacion('');
        setPrecio('');
      } else {
        setError(result.error || 'Error al registrar el servicio');
      }
    } catch (err) {
      console.error(err);
      setError('Error de red o autenticación');
    }
  };

  return (
    <div className="servicio-container">
      <div className="servicio-form ancho-personalizado">
        <h2 className="form-title">Agregar nuevo servicio</h2>
        <form onSubmit={handleSubmit} className="form-fields">

          <div className="form-group">
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="form-input campo-grande"
            />
            <p className="campo-descripcion">Añade una descripción de tu servicio para que los clientes sepan de qué se trata.</p>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Ubicación"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="form-input campo-grande"
            />
            <p className="campo-descripcion">Indica dónde se llevará a cabo el servicio.</p>
          </div>

          <div className="form-group">
            <input
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="form-input campo-grande"
            />
            <p className="campo-descripcion">Establece el costo por persona o por servicio.</p>
          </div>

          <div className="form-group">
            <p className="checkbox-title">Selecciona el tipo de actividad:</p>
            <div className="checkbox-list">
              {TIPOS_DE_ACTIVIDAD.map((tipo) => (
                <label key={tipo} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={tipoSeleccionado === tipo}
                    onChange={() =>
                      setTipoSeleccionado(tipoSeleccionado === tipo ? '' : tipo)
                    }
                  />
                  <span>{tipo}</span>
                </label>
              ))}
            </div>
            <p className="campo-descripcion">Selecciona solo una categoría que mejor describa tu actividad.</p>
          </div>

          <button type="submit" className="form-button">
            Agregar servicio
          </button>

          {mensaje && <p className="form-success">{mensaje}</p>}
          {error && <p className="form-error">{error}</p>}
        </form>
      </div>

      <div className="carousel-background">
        <div className="carousel-images"></div>
      </div>
    </div>
  );
};
