import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage          from './pages/HomePage';
import Signup            from './pages/Signup';
import Signin            from './pages/Signin';
import VerifyEmail       from './pages/VerifyEmail';
import VerifyPhone       from './pages/VerifyPhone';
import Dashboard         from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard    from './pages/AdminDashboard';
import About             from './pages/About';
import Contact           from './pages/Contact';
import ProtectedRoute    from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<HomePage />} />
        <Route path="/signup"             element={<Signup />} />
        <Route path="/signin"             element={<Signin />} />
        <Route path="/about"              element={<About />} />
        <Route path="/contact"            element={<Contact />} />
        <Route path="/verify-email"       element={<VerifyEmail />} />
        <Route path="/verify-phone"       element={<VerifyPhone />} />

        {/* User dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['User']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Employee dashboard */}
        <Route path="/employee-dashboard" element={
          <ProtectedRoute roles={['Employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />

        {/* Admin dashboard */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute roles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
