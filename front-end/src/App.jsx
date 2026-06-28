import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Contacts from "./pages/Contacts.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Register />
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
