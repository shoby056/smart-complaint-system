import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <h2>Smart Complaint Management System</h2>
      <div className="nav-links">
        {user ? (
          <>
            <span>{user.name} ({user.role})</span>
            <button onClick={logoutUser} className="btn-logout">Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes for Student / User */}
              <Route element={<ProtectedRoute allowedRole="USER" />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
              </Route>

              {/* Protected Routes for Admin */}
              <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;