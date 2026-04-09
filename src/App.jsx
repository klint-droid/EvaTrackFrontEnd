import Login from "./pages/Login";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter,Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/UserManagement";
import EvacuationAlerts from "./pages/EvacuationAlerts";
import VerifyHousehold from "./pages/VerifyHousehold";
import EvacuationList from "./pages/evacuation/EvacuationList";
import DashboardLayout from "./layout/DashboardLayout";
import EvacuationDetail from "./pages/evacuation/EvacuationDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/evacuation-alerts" element={<EvacuationAlerts />} />
        <Route path="/household-verification" element={<VerifyHousehold />} />

        {/* Evacuation Centers */}
        <Route path="/evacuation-centers">
          <Route index element={<EvacuationList />} />
          <Route path=":id" element={<EvacuationDetail />} />
        </Route>

      </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;