import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/AdminDashboard';
import { ResidentsDirectory } from './pages/ResidentsDirectory';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { Financials } from './pages/Financials';
import { Helpdesk } from './pages/Helpdesk';
import { Notices } from './pages/Notices';
import { Visitors } from './pages/Visitors';

const App = () => {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#18181B', // surface-hover
            color: '#fff',
            border: '1px solid #27272A', // border-dark
            fontSize: '14px',
            borderRadius: '8px',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/residents" element={<ResidentsDirectory />} />
            </Route>
          </Route>

          {/* Shared Admin & Resident Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RESIDENT']} />}>
            <Route element={<Layout />}>
              <Route path="/financials" element={<Financials />} />
              <Route path="/helpdesk" element={<Helpdesk />} />
              <Route path="/notices" element={<Notices />} />
            </Route>
          </Route>

        {/* Security Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SECURITY', 'ADMIN']} />}>
          <Route element={<Layout />}>
            <Route path="/security" element={<SecurityDashboard />} />
            {/* Admin can also access visitors log */}
            <Route path="/visitors" element={<Visitors />} />
          </Route>
        </Route>

        {/* Resident Routes */}
        <Route element={<ProtectedRoute allowedRoles={['RESIDENT']} />}>
          <Route element={<Layout />}>
            <Route path="/resident" element={<ResidentDashboard />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
