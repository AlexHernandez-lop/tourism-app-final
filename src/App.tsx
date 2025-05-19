import React, { ReactNode } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { AgregarServicio } from './pages/AddService';
import {ProviderProfile} from './pages/Provider_profile'

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
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

const AuthNavLinks = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  
  return (
    <>
      {user ? (
        <NavLink to="/provider-profile">Perfil</NavLink>
      ) : (
        <>
          <NavLink to="/login" isLogin>Login Proveedor</NavLink>
          <NavLink to="/register">Login Turista</NavLink>
        </>
      )}
    </>
  );
};

export default function App() {
  return (
    <Authenticator.Provider>
      <Router>
        <nav className="bg-white border-b border-gray-500 py-4">
          <div className="nav-container flex justify-between items-center">
            <div className="nav-left flex">
              <NavLink to="/">Inicio</NavLink>
              <NavLink to="/about">Sobre nosotros</NavLink>
            </div>
            <div className="nav-right flex">
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
          <Route path="/agregar-servicio" element={<AgregarServicio />} />
          <Route path="/provider-profile" element={<ProviderProfile />} />

        </Routes>
      </Router>
    </Authenticator.Provider>
  );
}
