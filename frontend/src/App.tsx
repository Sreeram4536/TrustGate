import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import KYC from './pages/KYC';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from "react-toastify";


const RootRedirect = () => {
  const role = localStorage.getItem('userRole');
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/kyc" replace />;
};

function App() {
  return (
    <>
    <ToastContainer/>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/kyc" element={<KYC />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
