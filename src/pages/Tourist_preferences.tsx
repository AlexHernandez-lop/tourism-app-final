import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import preguntasJSON from "../questions.json";
import '@aws-amplify/ui-react/styles.css';

type Pregunta = {
  pregunta: string;
  opciones: {
    texto: string;
    categoria: string;
  }[];
};

type PuntosCategoria = {
  [categoria: string]: number;
};

function obtenerPreguntasAleatorias(preguntas: Pregunta[], cantidad: number): Pregunta[] {
  const barajadas = [...preguntas].sort(() => Math.random() - 0.5);
  return barajadas.slice(0, cantidad).map((pregunta) => ({
    ...pregunta,
    opciones: [...pregunta.opciones]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4),
  }));
}

export function RecommendationPreferences() {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [puntos, setPuntos] = useState<PuntosCategoria>({});
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      const seleccionadas = obtenerPreguntasAleatorias(preguntasJSON, 3);
      setPreguntas(seleccionadas);
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-lg text-gray-800">No autenticado. Redirigiendo...</p>
      </div>
    );
  }

  const manejarRespuesta = (categoria: string) => {
    setPuntos((prev) => ({
      ...prev,
      [categoria]: (prev[categoria] || 0) + 1,
    }));

    if (indice < preguntas.length - 1) {
      setIndice(indice + 1);
    } else {
      setFinalizado(true);
    }
  };

  const colores = [
    "bg-blue-600 hover:bg-blue-700",
    "bg-orange-500 hover:bg-orange-600",
    "bg-purple-600 hover:bg-purple-700",
    "bg-green-600 hover:bg-green-700",
  ];

  return (
    <div
  className="min-h-screen bg-cover bg-center p-6 flex flex-col items-center relative"
  style={{ backgroundImage: "url('/img/questions-bg.jpg')" }}
>
      <div className="max-w-3xl w-full mt-12">
  <button
    onClick={() => navigate("/tourist-profile")}
    className="text-blue-600 hover:text-blue-800 text-lg font-medium flex items-center mb-4"
    title="Regresar"
  >
    ← <span className="ml-1">Regresar al perfil</span>
  </button>

  <h2 className="text-3xl font-bold text-white mb-6 text-left">
    Preferencias de Recomendaciones
  </h2>
        <p className="text-white mb-8">
          Estas preguntas nos ayudarán a conocer tus preferencias turísticas y a personalizar tu experiencia en la plataforma. A través de tus respuestas, podremos entender mejor qué tipo de destinos, actividades o ambientes te resultan más atractivos. Ya sea que prefieras naturaleza, cultura, aventura o relajación, este breve cuestionario es clave para ofrecerte recomendaciones más acertadas y relevantes. No te tomará mucho tiempo, pero marcará una gran diferencia en la calidad de las sugerencias que recibirás.
        </p>
        {!finalizado ? (
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-left">
              {preguntas[indice]?.pregunta}
            </h3>
            <div className="flex flex-col gap-4">
              {preguntas[indice]?.opciones.map((opcion, i) => (
                <button
                  key={i}
                  onClick={() => manejarRespuesta(opcion.categoria)}
                  className={`w-full ${colores[i % colores.length]} text-white font-semibold py-3 px-4 rounded-lg shadow`}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
            <p className="mt-4 text-gray-500 text-right">
              Pregunta {indice + 1} de {preguntas.length}
            </p>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-semibold text-green-700 mb-4">¡Gracias por responder!</h3>
            <p className="text-gray-600 mb-4">
              Tus preferencias han sido registradas. Puedes continuar o ajustar tus elecciones más adelante.
            </p>
            <button
              onClick={() => navigate("/tourist-profile")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Volver al perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
