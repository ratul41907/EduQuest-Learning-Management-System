import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseDetails = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <nav style={{ background: '#1a1a2e', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#667eea', margin: 0 }}>🎓 EduQuest</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer' }}>Dashboard</button>
          <button onClick={() => navigate('/courses')} style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer' }}>Courses</button>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px' }}>Logout</button>
        </div>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', fontSize: '2rem', color: 'white', flexDirection: 'column' }}>
        <p>📖 Course Details Page</p>
        <p style={{ fontSize: '1rem', color: '#8892b0' }}>Coming in next steps...</p>
      </div>
    </div>
  );
};

export default CourseDetails;