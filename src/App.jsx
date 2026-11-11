import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";

// Public Pages
import Landing from "./pages/Landing";
import PublicPortal from "./pages/PublicPortal"; 
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import { AlertProvider } from "./context/AlertContext";
import { ThemeProvider } from "./context/ThemeContext";

// Error Pages & Components
import NotFound from "./pages/errors/NotFound";
import AccessDenied from "./pages/errors/AccessDenied";
import ServerError from "./pages/errors/ServerError";
import ErrorBoundary from "./components/ErrorBoundary";

// Admin Pages
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/UserManagement";
import EvacuationAlerts from "./pages/EvacuationAlerts";
import VerifyHousehold from "./pages/VerifyHousehold";
import EvacuationList from "./pages/evacuation/EvacuationList";
import DashboardLayout from "./layout/DashboardLayout";
import EvacuationDetail from "./pages/evacuation/EvacuationDetail";
import HouseholdManagement from './pages/HouseholdManagement';
import HouseholdDetail from './pages/HouseholdDetail';
import ResourceRequests from './pages/ResourceRequests';
import CenterIssueReports from './pages/CenterIssueReports';
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

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
    <ThemeProvider>
      <AlertProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* PUBLIC ROUTES (With Navbar) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/portal" element={<PublicPortal />} />
              </Route>

              {/* STANDALONE ROUTE (No Navbar) */}
              <Route path="/login" element={<Login />} />

              {/* ERROR ROUTES */}
              <Route path="/403" element={<AccessDenied />} />
              <Route path="/unauthorized" element={<AccessDenied />} />
              <Route path="/500" element={<ServerError />} />

              {/* PROTECTED ROUTES — All authenticated users */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                {/* Super Admin + Evac Admin */}
                <Route path="/user-management" element={<ProtectedRoute allowedRoles={["super_admin", "evac_admin"]}><UserManagement /></ProtectedRoute>} />

                {/* All authenticated users */}
                <Route path="/profile" element={<Profile />} />

                {/* Operational routes — Evac Admin + Evac Personnel only (NOT Super Admin) */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><Dashboard /></ProtectedRoute>} />
                <Route path="/evacuation-alerts" element={<ProtectedRoute allowedRoles={["evac_admin"]}><EvacuationAlerts /></ProtectedRoute>} />
                <Route path="/household-verification" element={<ProtectedRoute allowedRoles={["evac_personnel"]}><VerifyHousehold /></ProtectedRoute>} />
                <Route path="/events" element={<Navigate to="/dashboard" replace />} />

                <Route path="/evacuation-centers">
                  <Route index element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><EvacuationList /></ProtectedRoute>} />
                  <Route path=":id" element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><EvacuationDetail /></ProtectedRoute>} />
                </Route>

                <Route path="/households">
                  <Route index element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><HouseholdManagement /></ProtectedRoute>} />
                  <Route path=":id" element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><HouseholdDetail /></ProtectedRoute>} />
                </Route>

                <Route path="/resource-requests" element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><ResourceRequests /></ProtectedRoute>} />
                <Route path="/center-issue-reports" element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><CenterIssueReports /></ProtectedRoute>} />

                <Route path="/analytics" element={<ProtectedRoute allowedRoles={["evac_admin", "evac_personnel"]}><Analytics /></ProtectedRoute>} />
              </Route>

              {/* GLOBAL CATCH-ALL (404 Not Found) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;