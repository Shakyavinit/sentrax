import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DEMO_MODE } from './utils/demo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { useAuthStore } from './store/authStore';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitor } from './pages/LiveMonitor';
import { Investigation } from './pages/Investigation';
import { VehicleJourney } from './pages/VehicleJourney';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AlertsPage } from './pages/AlertsPage';
import { CameraRegistry } from './pages/CameraRegistry';
import { Analytics } from './pages/Analytics';
import ResearchAgent from './pages/ResearchAgent';
import { VehicleDetailsPage } from './pages/VehicleDetailsPage';
import { DemoMonitor } from './pages/DemoMonitor';
import DemoResearch from './pages/DemoResearch';
import { DemoDossier } from './pages/DemoDossier';
import { AuditLogPage } from './pages/AuditLogPage';
import { CameraStreamPage } from './pages/CameraStreamPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const basename = typeof window !== 'undefined' && window.location.pathname.startsWith('/sentrax') ? '/sentrax' : '';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/live" element={DEMO_MODE ? <DemoMonitor /> : <LiveMonitor />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/journey" element={<VehicleJourney />} />
            <Route path="/vehicles/journey" element={<VehicleJourney />} />
            <Route path="/vehicles/journey/:plate" element={<VehicleJourney />} />
            <Route path="/vehicles/details/:plate" element={<VehicleDetailsPage />} />
            <Route path="/vehicles/details" element={<VehicleDetailsPage />} />
            <Route path="/vehicle/:plate" element={<VehicleDetailsPage />} />
            <Route path="/vehicle" element={<VehicleDetailsPage />} />
            <Route path="/dossier/:plate" element={<VehicleDetailsPage />} />
            <Route path="/dossier" element={<VehicleDetailsPage />} />
            <Route path="/camera-stream/:id" element={<CameraStreamPage />} />
            <Route path="/camera-stream" element={<CameraStreamPage />} />
            <Route path="/evidence" element={<EvidenceVaultPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/cameras" element={<CameraRegistry />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="/research-agent"
              element={
                <ProtectedRoute requiredRole="admin">
                  {DEMO_MODE ? <DemoResearch /> : <ResearchAgent />}
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
