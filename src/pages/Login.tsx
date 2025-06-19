import { useNavigate } from "react-router-dom";
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
      const groups = (tokens?.accessToken?.payload["cognito:groups"] as string[]) || [];

      if (groups.includes("Proveedores")) {
        navigate('/provider-profile');
      } else if (groups.includes("Turistas")) {
        navigate('/tourist-profile');
      } else {
        navigate('/tourist-profile');
      }
    } catch (error) {
      console.error("Error al verificar grupos del usuario:", error);
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
          <h2 className="text-2xl font-bold mb-1">Inicia Sesión o Regístrate</h2>
          <p className="mb-6 text-gray-600">Y expande el turismo sustentable</p>

          <Authenticator
            className="custom-auth"
            hideSignUp={false}
            loginMechanisms={['email']}
            signUpAttributes={['email']}
            components={{
              SignUp: {
                FormFields() {
                  return (
                    <>
                      <Authenticator.SignUp.FormFields />
                      <div className="amplify-field">
                        <label htmlFor="custom:grupo" className="amplify-label">Tipo de usuario</label>
                        <select
                          name="custom:grupo"
                          required
                          className="amplify-input"
                        >
                          <option value="">Selecciona una opción</option>
                          <option value="Turistas">Turista</option>
                          <option value="Proveedores">Proveedor</option>
                        </select>
                      </div>
                    </>
                  );
                }
              }
            }}
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
