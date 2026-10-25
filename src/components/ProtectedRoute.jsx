import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";
import { useUserStore } from "../store/useUserStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/api/user");
        const body = res.data?.data || res.data || res;
        const freshUser = body.data || body;
        setUser(freshUser);
      } catch {
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    if (user.role === 'super_admin') {
      return <Navigate to="/user-management" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;