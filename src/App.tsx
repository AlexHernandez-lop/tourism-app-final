import React, { ReactNode } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { AgregarServicio } from './pages/AddService';
import { ProviderProfile } from './pages/Provider_profile';
import { ServiceDetail } from './pages/ServiceDetail';
import { TouristProfile } from "./pages/Tourist_profile";
import { ProviderServiceDetail } from './pages/ProviderServiceDetail';
import { RecommendationPreferences } from "./pages/Tourist_preferences";
import { EditarServicio } from "./pages/ProviderEditService";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { RecommendedServices } from "./pages/RecommendedServices"; 
import "@aws-amplify/ui-react/styles.css";
import "./index.css";

interface NavLinkProps {
  to: string;
  children: ReactNode;
  isLogin?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, isLogin = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const linkClass = isLogin 
    ? 'login-link' 
    : 'text-gray-600';

  return (
    <Link 
      to={to} 
      className={`nav-link ${linkClass} ${isActive ? 'current-page' : ''}`}
    >
      {children}
    </Link>
  );
};

const NavLinksMain = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [userGroup, setUserGroup] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const checkUserGroup = async () => {
      if (user) {
        setLoading(true);
        try {
          const { tokens } = await fetchAuthSession();
          const groups = (tokens?.accessToken?.payload["cognito:groups"] as string[]) || [];
          
          if (groups.includes("Proveedores")) {
            setUserGroup("Proveedores");
          } else if (groups.includes("Turistas")) {
            setUserGroup("Turistas");
          } else {
            setUserGroup(null);
          }
        } catch (error) {
          console.error("Error al verificar grupos:", error);
          setUserGroup(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUserGroup(null);
      }
    };

    checkUserGroup();
  }, [user]);

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>;
  }

  if (userGroup === "Turistas") {
    return (
      <>
        <NavLink to="/">Todos los servicios</NavLink>
        <NavLink to="/recommended-services">Servicios recomendados</NavLink>
      </>
    );
  }

  // Por defecto o para "Proveedores"
  return (
    <NavLink to="/">Inicio</NavLink>
  );
};

const AuthNavLinks = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [userGroup, setUserGroup] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const checkUserGroup = async () => {
      if (user) {
        setLoading(true);
        try {
          const { tokens } = await fetchAuthSession();
          const groups = (tokens?.accessToken?.payload["cognito:groups"] as string[]) || [];
          
          if (groups.includes("Proveedores")) {
            setUserGroup("Proveedores");
          } else if (groups.includes("Turistas")) {
            setUserGroup("Turistas");
          }
        } catch (error) {
          console.error("Error al verificar grupos:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkUserGroup();
  }, [user]);

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>;
  }

  return (
    <>
      {user ? (
        <NavLink to={userGroup === "Proveedores" ? "/provider-profile" : "/tourist-profile"}>
          Perfil
        </NavLink>
      ) : (
        <>
          <NavLink to="/login" isLogin>Iniciar Sesión</NavLink>
        </>
      )}
    </>
  );
};

const AuthCheck = ({ children }: { children: ReactNode }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  
  if (authStatus === "configuring") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando autenticación...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Authenticator.Provider>
      <Router>
        <nav className="bg-white border-b border-gray-500 py-4">
          <div className="nav-container flex justify-between items-center">
            <div className="nav-left flex gap-4">
              <NavLinksMain />
            </div>
            <div className="nav-right flex gap-4">
              <AuthNavLinks />
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/provider/service/:index" element={<ProviderServiceDetail />} />
          <Route path="/service/:index" element={<ServiceDetail />} />
          <Route path="/editar-servicio/:index" element={<EditarServicio />} />
          <Route 
            path="/agregar-servicio" 
            element={
              <Authenticator>
                <AuthCheck>
                  <AgregarServicio />
                </AuthCheck>
              </Authenticator>
            } 
          />
          <Route 
            path="/provider-profile" 
            element={
              <Authenticator>
                <AuthCheck>
                  <ProviderProfile />
                </AuthCheck>
              </Authenticator>
            } 
          />
          <Route 
            path="/tourist-profile"
            element={
              <Authenticator>
                <AuthCheck>
                  <TouristProfile />
                </AuthCheck>
              </Authenticator>
            }
          />
          <Route 
            path="/tourist-preferences"
            element={
              <Authenticator>
                <AuthCheck>
                  <RecommendationPreferences />
                </AuthCheck>
              </Authenticator>
            }
          />
          <Route 
            path="/recommended-services"
            element={
              <Authenticator>
                <AuthCheck>
                  <RecommendedServices />
                </AuthCheck>
              </Authenticator>
            }
          />
        </Routes>
      </Router>
    </Authenticator.Provider>
  );
}
