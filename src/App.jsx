import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";

// Public Pages
import Landing from "./pages/Landing";
import PublicPortal from "./pages/PublicPortal"; 
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

// Admin Pages
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/UserManagement";
import EvacuationAlerts from "./pages/EvacuationAlerts";
import VerifyHousehold from "./pages/VerifyHousehold";
import EvacuationList from "./pages/evacuation/EvacuationList";
import DashboardLayout from "./layout/DashboardLayout";
import EvacuationDetail from "./pages/evacuation/EvacuationDetail";
import EventManagement from "./pages/EventManagement";
import HouseholdManagement from './pages/HouseholdManagement';
import HouseholdDetail from './pages/HouseholdDetail';
import ResourceRequests from './pages/ResourceRequests';
import CenterIssueReports from './pages/CenterIssueReports';

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC ROUTES (With Navbar) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/portal" element={<PublicPortal />} />
        </Route>

        {/* STANDALONE ROUTE (No Navbar) */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ADMIN ROUTES (With DashboardLayout) */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/evacuation-alerts" element={<EvacuationAlerts />} />
          <Route path="/household-verification" element={<VerifyHousehold />} />
          <Route path="/events" element={<EventManagement />} />

          <Route path="/evacuation-centers">
            <Route index element={<EvacuationList />} />
            <Route path=":id" element={<EvacuationDetail />} />
          </Route>

          <Route path="/households">
            <Route index element={<HouseholdManagement />} />
            <Route path=":id" element={<HouseholdDetail />} />
          </Route>

          <Route path="/resource-requests" element={<ResourceRequests />} />
          <Route path="/center-issue-reports" element={<CenterIssueReports />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;