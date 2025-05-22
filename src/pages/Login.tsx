import { Link, useNavigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import "/src/index.css";
import "/src/amplify_override.css";

export function Login() {
  const navigate = useNavigate();

  const checkUserGroup = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      // Aseguramos el tipo como array de strings
      const groups = (tokens?.accessToken?.payload["cognito:groups"] as string[]) || [];
      
      // Redirigir según el grupo
      if (groups.includes("Proveedores")) {
        navigate('/provider-profile');
      } else if (groups.includes("Turistas")) {
        navigate('/tourist-profile');
      } else {
        navigate('/tourist-profile');
      }
    } catch (error) {
      console.error("Error al verificar grupos del usuario:", error);
      // Opcional: mostrar mensaje de error al usuario
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-100 pt-12">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex max-w-6xl w-full translate-y-[2rem]">
        
        {/* Imagen del lado izquierdo */}
        <div className="w-1/2 hidden md:block">
          <img
            src="img/login.jpg"
            alt="Login visual"
            className="object-cover h-full w-full"
          />
        </div>

        {/* Formulario del lado derecho */}
        <div className="w-full md:w-1/2 p-8 relative">
          <h2 className="text-2xl font-bold mb-1">Regístrate como proveedor</h2>
          <p className="mb-6 text-gray-600">Y expande el turismo sustentable</p>

          <Authenticator
            className="custom-auth"
            hideSignUp={false}
            loginMechanisms={['email']}
          >
            {({ user }) => {
              if (user) {
                checkUserGroup();
              }
              return <></>;
            }}
          </Authenticator>
          
        </div>
      </div>
    </div>
  );
}