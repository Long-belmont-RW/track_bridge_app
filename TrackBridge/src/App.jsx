import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RequireRole from "./routes/RequireRole";

import PublicLayout from "./layouts/PublicLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import CompanyLayout from "./layouts/CompanyLayout";
import DriverLayout from "./layouts/DriverLayout";

// Route-level code splitting — every page below is its own chunk.
const Landing = lazy(() => import("./pages/public/Landing"));
const HowItWorks = lazy(() => import("./pages/public/HowItWorks"));
const WhoItsFor = lazy(() => import("./pages/public/WhoItsFor"));
const Developers = lazy(() => import("./pages/public/Developers"));
const TrackPublic = lazy(() => import("./pages/public/TrackPublic"));
const Login = lazy(() => import("./pages/public/Login"));
const Register = lazy(() => import("./pages/public/Register"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const Forbidden = lazy(() => import("./pages/public/Forbidden"));
const PrivacyPage = lazy(() =>
  import("./pages/public/LegalPages").then((m) => ({ default: m.Privacy }))
);
const TermsPage = lazy(() =>
  import("./pages/public/LegalPages").then((m) => ({ default: m.Terms }))
);

const CustomerOverview = lazy(() => import("./pages/customer/Overview"));
const MyDeliveries = lazy(() => import("./pages/customer/MyDeliveries"));
const CustomerTrack = lazy(() => import("./pages/customer/TrackDelivery"));
const CustomerSettings = lazy(() => import("./pages/customer/Settings"));

const CompanyOverview = lazy(() => import("./pages/company/Overview"));
const CompanyDeliveries = lazy(() => import("./pages/company/Deliveries"));
const CompanyDisputes = lazy(() => import("./pages/company/Disputes"));
const CompanyDrivers = lazy(() => import("./pages/company/Drivers"));
const CompanyIntegrations = lazy(() => import("./pages/company/Integrations"));
const CompanyBilling = lazy(() => import("./pages/company/Billing"));
const CompanySettings = lazy(() => import("./pages/company/Settings"));

const DriverOverview = lazy(() => import("./pages/driver/Overview"));
const DriverMyRoute = lazy(() => import("./pages/driver/MyRoute"));
const DriverSettings = lazy(() => import("./pages/driver/Settings"));

function LoadingFallback() {
  return <div className="route-loading">Loading…</div>;
}

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/who-its-for" element={<WhoItsFor />} />
              <Route path="/developers" element={<Developers />} />
              <Route path="/track" element={<TrackPublic />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/dashboard" element={<RoleHomeSafe />} />
            </Route>

            <Route
              path="/customer"
              element={
                <RequireRole role="customer">
                  <CustomerLayout />
                </RequireRole>
              }
            >
              <Route index element={<CustomerOverview />} />
              <Route path="deliveries" element={<MyDeliveries />} />
              <Route path="track" element={<CustomerTrack />} />
              <Route path="settings" element={<CustomerSettings />} />
            </Route>

            <Route
              path="/company"
              element={
                <RequireRole role="company">
                  <CompanyLayout />
                </RequireRole>
              }
            >
              <Route index element={<CompanyOverview />} />
              <Route path="deliveries" element={<CompanyDeliveries />} />
              <Route path="disputes" element={<CompanyDisputes />} />
              <Route path="drivers" element={<CompanyDrivers />} />
              <Route path="integrations" element={<CompanyIntegrations />} />
              <Route path="billing" element={<CompanyBilling />} />
              <Route path="settings" element={<CompanySettings />} />
            </Route>

            <Route
              path="/driver"
              element={
                <RequireRole role="driver">
                  <DriverLayout />
                </RequireRole>
              }
            >
              <Route index element={<DriverOverview />} />
              <Route path="route" element={<DriverMyRoute />} />
              <Route path="settings" element={<DriverSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

function RoleHomeSafe() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <RoleHome />;
}
