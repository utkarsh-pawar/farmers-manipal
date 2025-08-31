import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminPanel from "./pages/AdminPanel";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />

          {user ? (
            <>
              {user.role === "farmer" && (
                <Route path="/farmer" element={<FarmerDashboard />} />
              )}
              {user.role === "buyer" && (
                <>
                  <Route path="/buyer" element={<BuyerDashboard />} />
                  <Route path="/cart" element={<Cart />} />
                </>
              )}
              {user.role === "admin" && (
                <Route path="/admin" element={<AdminPanel />} />
              )}
              <Route path="/products" element={<Products />} />
              <Route
                path="/"
                element={
                  <Navigate
                    to={
                      user.role === "farmer"
                        ? "/farmer"
                        : user.role === "buyer"
                        ? "/buyer"
                        : "/admin"
                    }
                  />
                }
              />
            </>
          ) : (
            <Route path="/" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </main>
    </div>
  );
};

export default App;
