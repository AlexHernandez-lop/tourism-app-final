import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";

type Servicio = {
  ServiceID: string;
  providerId: string;
  titulo: string;
  descripcion: string;
  tipoActividad: string;
  ubicacion: string;
  precio: number;
  imagenes: string[];
};

export function ServiceDetail() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [numPersonas, setNumPersonas] = useState(1);
  const [fechaReserva, setFechaReserva] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [userGroup, setUserGroup] = useState<string | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    const checkUserGroup = async () => {
      if (user) {
        setLoadingGroup(true);
        try {
          const session = await fetchAuthSession();
          const groups = (session.tokens?.accessToken?.payload["cognito:groups"] as string[]) || [];
          if (groups.includes("Turistas")) {
            setUserGroup("Turistas");
          } else if (groups.includes("Proveedores")) {
            setUserGroup("Proveedores");
          } else {
            setUserGroup(null);
          }
        } catch (error) {
          console.error("Error al obtener grupos Cognito:", error);
          setUserGroup(null);
        } finally {
          setLoadingGroup(false);
        }
      } else {
        setUserGroup(null);
        setLoadingGroup(false);
      }
    };
    checkUserGroup();
  }, [user]);

  useEffect(() => {
    if (!id) return;
    fetch(`https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/service/get-by-id?ServiceID=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setServicio(data.servicio);
      })
      .catch((err) => {
        console.error("Error al cargar servicio:", err);
      });
  }, [id]);

  const enviarReserva = async () => {
    if (!servicio || !user) {
      setMensaje("❌ Usuario no autenticado o servicio no encontrado");
      return;
    }

    const datosReserva = {
      serviceId: servicio.ServiceID,
      providerId: servicio.providerId,
      numPersonas,
      fechaReserva,
      nombreCliente,
      emailCliente,
      TouristID: user.username,
    };

    try {
      const res = await fetch(
        "https://ac57fn0hv8.execute-api.us-east-2.amazonaws.com/dev/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosReserva),
        }
      );

      const result = await res.json();
      if (res.status === 201) {
        setMensaje("✅ Reservación exitosa");
        setMostrarFormulario(false);
        setTimeout(() => navigate("/tourist-profile"), 2000);
      } else {
        setMensaje(`❌ Error: ${result.error || "No se pudo completar la reservación"}`);
      }
    } catch (error) {
      console.error("Error al enviar reserva:", error);
      setMensaje("❌ Error al conectar con el servidor");
    }
  };

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
      <p className="text-gray-600 mb-4">
        {servicio.tipoActividad} | {servicio.ubicacion}
      </p>
      <p className="text-lg text-green-700 font-semibold mb-4">${servicio.precio} MXN</p>
      <p className="text-gray-800 mb-6 whitespace-pre-wrap">{servicio.descripcion}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {servicio.imagenes.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Imagen ${i + 1}`}
            className="w-full h-64 object-cover rounded-lg shadow"
          />
        ))}
      </div>

      {!loadingGroup && userGroup === "Turistas" && (
        <>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold mb-4"
          >
            Reservar
          </button>

          {mostrarFormulario && (
            <div className="mt-6 border rounded-lg p-4 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4">Datos de la reserva</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block font-medium mb-1">Nombre completo</label>
                  <input
                    type="text"
                    className="p-2 border rounded w-full"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    className="p-2 border rounded w-full"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Número de personas</label>
                  <input
                    type="number"
                    min={1}
                    className="p-2 border rounded w-full"
                    value={numPersonas}
                    onChange={(e) => setNumPersonas(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Fecha y hora</label>
                  <input
                    type="datetime-local"
                    className="p-2 border rounded w-full"
                    value={fechaReserva}
                    onChange={(e) => setFechaReserva(e.target.value)}
                  />
                </div>

                <button
                  onClick={enviarReserva}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                >
                  Confirmar reserva
                </button>

                {mensaje && (
                  <p className="mt-2 text-center text-sm text-gray-800">{mensaje}</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
