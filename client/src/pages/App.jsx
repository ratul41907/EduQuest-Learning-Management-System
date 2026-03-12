import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={
        user ? (
          <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉 Welcome, {user.fullName}!</h1>
            <p style={{ fontSize: '1.5rem', color: '#8892b0' }}>Role: {user.role}</p>
            <p style={{ fontSize: '1.2rem', color: '#64ffda' }}>Points: {user.totalPoints} | Level: {user.level}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ marginTop: '2rem', padding: '1rem 2rem', background: '#667eea', border: 'none', borderRadius: '8px', color: 'white', fontSize: '1rem', cursor: 'pointer' }}
            >
              Dashboard Coming Soon...
            </button>
          </div>
        ) : <Navigate to="/login" />
      } />
      
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;