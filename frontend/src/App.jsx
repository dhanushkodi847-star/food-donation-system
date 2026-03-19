import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import DonorRegister from './pages/DonorRegister';
import ReceiverRegister from './pages/ReceiverRegister';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

import './App.css';

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    switch (user?.role) {
      case 'donor': return <Navigate to="/donor/dashboard" replace />;
      case 'receiver': return <Navigate to="/receiver/dashboard" replace />;
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register/donor" element={<PublicRoute><DonorRegister /></PublicRoute>} />
              <Route path="/register/receiver" element={<PublicRoute><ReceiverRegister /></PublicRoute>} />

              {/* Protected Routes - Donor */}
              <Route path="/donor/dashboard" element={
                <ProtectedRoute roles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Routes - Receiver */}
              <Route path="/receiver/dashboard" element={
                <ProtectedRoute roles={['receiver']}>
                  <ReceiverDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Routes - Admin */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Profile - Any authenticated user */}
              <Route path="/profile" element={
                <ProtectedRoute roles={['donor', 'receiver', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
