import { useState } from "react";
import { isAuthenticated, logout } from "./api/authApi";
import Login from "./components/Login";
import Register from "./components/Register";
import ProductList from "./components/ProductList";
import CreateProduct from "./components/CreateProduct";
import GetProduct from "./components/GetProduct";
import CreateOrder from "./components/CreateOrder";
import InventoryStatus from "./components/InventoryStatus";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [showRegister, setShowRegister] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  if (!loggedIn) {
    return (
      <div>
        {showRegister ? (
          <>
            <Register onRegister={() => setShowRegister(false)} />
            <button onClick={() => setShowRegister(false)}>
              Ya tengo cuenta
            </button>
          </>
        ) : (
          <>
            <Login onLogin={() => setLoggedIn(true)} />
            <button onClick={() => setShowRegister(true)}>Registrarme</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          logout();
          setLoggedIn(false);
        }}>
        Cerrar sesión
      </button>

      <ProductList key={refreshKey} />

      <GetProduct />

      <InventoryStatus refreshKey={refreshKey} />

      <CreateOrder onOrderCreated={handleRefresh} />

      <CreateProduct onCreated={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
