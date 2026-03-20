import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/api/user");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <p>Checking authentication...</p>;

  if (!user) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;