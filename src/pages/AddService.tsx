import React, { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

import "/src/amplify_override.css";

const API_UPLOAD_URL = "https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/add-images";

const TIPOS_DE_ACTIVIDAD = [
  'Tour guiado',
  'Caminata en senderos naturales',
  'Buceo en arrecifes',
  'Esnórquel en bahías',
  'Nadar en playas o piscinas naturales',
  'Paseo en lancha rápida',
  'Observación de aves migratorias',
  'Experiencia cultural indígena',
  'Excursión en kayak',
  'Camping en la montaña',
  'Avistamiento de fauna silvestre',
  'Tour arqueológico',
  'Paseo en bicicleta de montaña',
  'Tour de jardines botánicos',
  'Tour de templos y monumentos',
  'Observación de estrellas',
];


// ... importaciones y constantes igual ...

export const AgregarServicio = () => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const newUrls: string[] = [];
    setUploading(true);

    for (const file of selectedFiles) {
      try {
        const res = await fetch(API_UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type,
          }),
        });

        if (!res.ok) throw new Error("Error al obtener URL presignada");

        const { uploadUrl, fileUrl } = await res.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadRes.ok) throw new Error("Error al subir archivo a S3");

        newUrls.push(fileUrl);
      } catch (error: any) {
        alert(`Error subiendo archivo ${file.name}: ${error.message}`);
      }
    }

    setUploading(false);
    return newUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!tipoSeleccionado) {
      setError('Debes seleccionar un tipo de actividad.');
      return;
    }

    try {
      // Primero subimos las imágenes
      const urls = await uploadFiles();

      // Luego continuamos con la lógica original
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const data = {
        titulo,
        descripcion,
        tipoActividad: tipoSeleccionado,
        ubicacion,
        precio: Number(precio),
        imagenes: urls,
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
        setTitulo('');
        setDescripcion('');
        setTipoSeleccionado('');
        setUbicacion('');
        setPrecio('');
        setSelectedFiles([]);
        setUploadedUrls([]);
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
        <div style={{ textAlign: 'center' }}>
          <h2 className="titulo-principal">Agrega un nuevo servicio</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-fields">

          <div className="form-group">
            <p className="titulo-galeria">Nombre</p>
            <p className="subtitulo-galeria">Escribe el nombre o título de la actividad.</p>
            <input
              type="text"
              placeholder="Nombre de la actividad"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="form-input campo-grande"
            />
          </div>

          <div className="form-group">
            <p className="titulo-galeria">Descripción</p>
            <p className="subtitulo-galeria">Añade una amplia descripción de tu servicio para que los clientes sepan de qué se trata y qué es lo que incluye.</p>
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="form-input campo-grande"
            />
          </div>

          <div className="form-group">
            <p className="titulo-galeria">Ubicación</p>
            <p className="subtitulo-galeria">Indica dónde se llevará a cabo el servicio.</p>
            <input
              type="text"
              placeholder="Ubicación"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="form-input campo-grande"
            />
          </div>

          <div className="form-group">
            <p className="titulo-galeria">Precio</p>
            <p className="subtitulo-galeria">Establece el costo por persona o por servicio.</p>
            <input
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
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
                    checked={tipoSeleccionado === tipo}
                    onChange={() =>
                      setTipoSeleccionado(tipoSeleccionado === tipo ? '' : tipo)
                    }
                  />
                  <span>{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          <p className="titulo-galeria">Galería</p>
          <p className="subtitulo-galeria">Añade Fotos de tu servicio</p>
          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="form-input"
              disabled={uploading}
            />
          </div>

          <button type="submit" className="form-button" disabled={uploading}>
            {uploading ? 'Subiendo imágenes...' : 'Agregar servicio'}
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
