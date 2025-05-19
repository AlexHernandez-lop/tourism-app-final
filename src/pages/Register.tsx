import { useState } from "react";

export function Register() {
  const [role, setRole] = useState<"tourist" | "provider">("tourist");

  // Definir rutas de imagen según el rol
  const imageSrc = role === "tourist" ? "/img/regsiter-tourist.jpg" : "/img/register-provider2.jpg";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex max-w-5xl w-full transition-all duration-500 ease-in-out">
        
        {/* Imagen dinámica */}
        <div className="w-1/2 hidden md:block">
          <img
            src={imageSrc}
            alt="Register visual"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Formulario */}
        <div className="w-full md:w-1/2 p-10 relative">

           <h2 className="text-2xl font-bold mb-1">Regístrate</h2>
          <p className="mb-6 text-gray-600">Y comienza a disfrutar del turismo sustentable</p>

          {/* Tabs */}
          <div className="flex mb-8 rounded-full overflow-hidden transition-all tab-container">
            <button
              onClick={() => setRole("tourist")}
              className={`rounded flex-1 py-3 transition-all duration-300 font-semibold ${
                role === "tourist" ? "bg-red-500 text-white" : "bg-gray-200" 
              }`}
            >
              Turista
            </button>
            <button
              onClick={() => setRole("provider")}
              className={`flex-1 py-3 transition-all duration-300 font-semibold ${
                role === "provider" ? "bg-red-500 text-white" : "bg-gray-200"
              }`}
            >
              Proveedor
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4 animate-fade-in">
            <input type="text" placeholder="Full Name" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
            <input type="email" placeholder="Email Address" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
            <input type="password" placeholder="Create Password" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
            <input type="password" placeholder="Confirm Password" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
            <input type="tel" placeholder="Phone Number" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
            <input type="text" placeholder="City" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
            {role === "provider" && (
              <>
                <input type="text" placeholder="Company Name" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
                <textarea placeholder="Description of Services" className="border border-red-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"></textarea>
              </>
            )}
           <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white py-3 rounded transition-all duration-300 font-semibold"
            >
              Registrarse como {role === "tourist" ? "Turista" : "Proveedor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
