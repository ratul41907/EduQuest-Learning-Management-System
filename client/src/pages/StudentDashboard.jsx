import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, badgeAPI, leaderboardAPI } from '../api/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Try to fetch data, but don't crash if it fails
      const promises = [];
      
      promises.push(
        courseAPI.getMyCourses().catch(() => ({ data: { enrollments: [] } }))
      );
      promises.push(
        badgeAPI.getMyBadges().catch(() => ({ data: { badges: [] } }))
      );
      promises.push(
        leaderboardAPI.getAllTime(5).catch(() => ({ data: { leaderboard: [] } }))
      );

      const [coursesRes, badgesRes, leaderboardRes] = await Promise.all(promises);
      
      setMyCourses(coursesRes.data.enrollments || []);
      setMyBadges(badgesRes.data.badges || []);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLinkActive}>Dashboard</button>
            <button onClick={() => navigate('/courses')} style={styles.navLink}>Browse Courses</button>
            <button onClick={() => navigate('/leaderboard')} style={styles.navLink}>Leaderboard</button>
            <button onClick={() => navigate('/badges')} style={styles.navLink}>Badges</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p style={styles.subtitle}>Here's your learning dashboard</p>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👤</div>
            <div>
              <p style={styles.statLabel}>Role</p>
              <p style={styles.statValue}>{user?.role}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <div>
              <p style={styles.statLabel}>Total Points</p>
              <p style={styles.statValue}>{user?.totalPoints}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <p style={styles.statLabel}>Level</p>
              <p style={styles.statValue}>{user?.level}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎖️</div>
            <div>
              <p style={styles.statLabel}>Badges</p>
              <p style={styles.statValue}>{myBadges.length}</p>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📚 My Courses ({myCourses.length})</h2>
          {loading ? (
            <p style={{ color: '#8892b0' }}>Loading...</p>
          ) : myCourses.length === 0 ? (
            <p style={{ color: '#8892b0' }}>No courses yet. Browse courses to get started!</p>
          ) : (
            <div style={styles.coursesList}>
              {myCourses.map(enrollment => (
                <div key={enrollment.id} style={styles.courseCard}>
                  <h3 style={styles.courseTitle}>{enrollment.course?.title}</h3>
                  <p style={styles.courseDesc}>{enrollment.course?.description?.substring(0, 100)}...</p>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${enrollment.progress}%`}}></div>
                  </div>
                  <p style={styles.progressText}>{enrollment.progress}% Complete</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsGrid}>
          <button onClick={() => navigate('/courses')} style={styles.actionCard}>
            <span style={{ fontSize: '2rem' }}>📚</span>
            <div>
              <h3 style={styles.actionTitle}>Browse Courses</h3>
              <p style={styles.actionDesc}>Explore new courses</p>
            </div>
          </button>
          <button onClick={() => navigate('/leaderboard')} style={styles.actionCard}>
            <span style={{ fontSize: '2rem' }}>🏆</span>
            <div>
              <h3 style={styles.actionTitle}>Leaderboard</h3>
              <p style={styles.actionDesc}>Check your ranking</p>
            </div>
          </button>
          <button onClick={() => navigate('/badges')} style={styles.actionCard}>
            <span style={{ fontSize: '2rem' }}>🎖️</span>
            <div>
              <h3 style={styles.actionTitle}>My Badges</h3>
              <p style={styles.actionDesc}>View achievements</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f' },
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  navLinks: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  navLinkActive: { padding: '0.5rem 1rem', background: 'rgba(100, 255, 218, 0.1)', border: 'none', color: '#64ffda', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
  title: { fontSize: '2.5rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1.1rem', color: '#8892b0', margin: '0 0 2rem 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' },
  statIcon: { fontSize: '2.5rem' },
  statLabel: { fontSize: '0.875rem', color: '#8892b0', margin: '0 0 0.25rem 0' },
  statValue: { fontSize: '1.75rem', color: '#ccd6f6', margin: 0, fontWeight: 'bold' },
  section: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.5rem', color: '#ccd6f6', margin: '0 0 1.5rem 0' },
  coursesList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  courseCard: { background: '#0f0f1e', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' },
  courseTitle: { fontSize: '1.125rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  courseDesc: { fontSize: '0.9rem', color: '#8892b0', margin: '0 0 1rem 0' },
  progressBar: { width: '100%', height: '8px', background: '#0f0f1e', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', transition: 'width 0.3s' },
  progressText: { fontSize: '0.875rem', color: '#8892b0', margin: 0 },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  actionCard: { background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' },
  actionTitle: { fontSize: '1.125rem', color: '#ccd6f6', margin: '0 0 0.25rem 0' },
  actionDesc: { fontSize: '0.875rem', color: '#8892b0', margin: 0 },
};

export default StudentDashboard;