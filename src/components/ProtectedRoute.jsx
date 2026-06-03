import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem("token");
    const cachedUser = localStorage.getItem("user");
    return !(token && cachedUser);
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/api/user");
      } catch (err) {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return null;

  if (!user) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;