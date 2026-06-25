import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManager from './pages/admin/UsersManager';
import BulkUploader from './pages/admin/BulkUploader';
import PremiumSettings from './pages/admin/PremiumSettings';
import DistributionManager from './pages/admin/DistributionManager';
import PaymentHistory from './pages/admin/PaymentHistory';
import ReportsManager from './pages/admin/ReportsManager';

const App = () => {
  const { initialize, isInitializing } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing) {
    return <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">Loading Admin Portal...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="bulk-upload" element={<BulkUploader />} />
          <Route path="settings" element={<PremiumSettings />} />
          <Route path="distribution" element={<DistributionManager />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="reports" element={<ReportsManager />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
