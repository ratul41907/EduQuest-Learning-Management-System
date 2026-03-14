import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
            <button onClick={() => navigate('/profile')} style={styles.navLinkActive}>Profile</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>👤 Profile</h1>
        
        <div style={styles.card}>
          <div style={styles.avatar}>{user?.fullName?.charAt(0)}</div>
          <h2 style={styles.name}>{user?.fullName}</h2>
          <p style={styles.email}>{user?.email}</p>
          <p style={styles.role}>{user?.role}</p>
          
          <div style={styles.stats}>
            <div style={styles.stat}>
              <p style={styles.statValue}>{user?.totalPoints}</p>
              <p style={styles.statLabel}>Points</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.statValue}>{user?.level}</p>
              <p style={styles.statLabel}>Level</p>
            </div>
          </div>

          <p style={{ color: '#8892b0', marginTop: '2rem' }}>Profile editing coming soon...</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f' },
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0' },
  navContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  navLinkActive: { padding: '0.5rem 1rem', background: 'rgba(100, 255, 218, 0.1)', border: 'none', color: '#64ffda', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '600px', margin: '0 auto', padding: '2rem' },
  title: { fontSize: '2rem', color: '#ccd6f6', marginBottom: '2rem', textAlign: 'center' },
  card: { background: '#1a1a2e', borderRadius: '12px', padding: '3rem', textAlign: 'center' },
  avatar: { width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: '600', margin: '0 auto 1.5rem auto' },
  name: { fontSize: '2rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  email: { fontSize: '1rem', color: '#8892b0', margin: '0 0 0.5rem 0' },
  role: { fontSize: '0.875rem', color: '#64ffda', margin: 0, padding: '0.5rem 1rem', background: 'rgba(100, 255, 218, 0.1)', borderRadius: '20px', display: 'inline-block' },
  stats: { display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' },
  stat: { textAlign: 'center' },
  statValue: { fontSize: '2rem', fontWeight: 'bold', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  statLabel: { fontSize: '0.875rem', color: '#8892b0', margin: 0, textTransform: 'uppercase' },
};

export default Profile;