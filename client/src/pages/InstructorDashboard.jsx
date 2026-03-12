import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <nav style={{ background: '#1a1a2e', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#667eea', margin: 0 }}>🎓 EduQuest</h1>
        <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px' }}>Logout</button>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', fontSize: '2rem', color: 'white', flexDirection: 'column' }}>
        <p>👨‍🏫 Instructor Dashboard</p>
        <p style={{ fontSize: '1.2rem', color: '#64ffda' }}>Welcome, {user?.fullName}!</p>
        <p style={{ fontSize: '1rem', color: '#8892b0' }}>Coming in next steps...</p>
      </div>
    </div>
  );
};

export default InstructorDashboard;