import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './pages/Overview';
import { CameraNetwork } from './pages/CameraNetwork';
import { VideoSources } from './pages/VideoSources';
import { LiveIntelligence } from './pages/LiveIntelligence';
import { GisMap } from './pages/GisMap';
import { VehicleSearch } from './pages/VehicleSearch';
import { Watchlist } from './pages/Watchlist';
import { Alerts } from './pages/Alerts';
import { Investigations } from './pages/Investigations';
import { EvidenceVault } from './pages/EvidenceVault';
import { AuditLogs } from './pages/AuditLogs';
import { Administration } from './pages/Administration';
import { Login } from './pages/Login';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-[#050811] text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-[#060913]">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/cameras" element={<CameraNetwork />} />
              <Route path="/sources" element={<VideoSources />} />
              <Route path="/live" element={<LiveIntelligence />} />
              <Route path="/map" element={<GisMap />} />
              <Route path="/search" element={<VehicleSearch />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/investigations" element={<Investigations />} />
              <Route path="/evidence" element={<EvidenceVault />} />
              <Route path="/audit" element={<AuditLogs />} />
              <Route path="/admin" element={<Administration />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
};

export default App;
