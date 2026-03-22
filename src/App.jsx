import Login from "./pages/Login";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter,Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/UserManagement";
import EvacuationAlerts from "./pages/EvacuationAlerts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
        />
        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
        />
        <Route path="/evacuation-alerts" element={
          <ProtectedRoute>
            <EvacuationAlerts />
          </ProtectedRoute>
        }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;