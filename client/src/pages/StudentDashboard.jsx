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
      const [coursesRes, badgesRes, leaderboardRes] = await Promise.all([
        courseAPI.getMyCourses(),
        badgeAPI.getMyBadges(),
        leaderboardAPI.getAllTime(5),
      ]);
      
      setMyCourses(coursesRes.data.enrollments || []);
      setMyBadges(badgesRes.data.badges || []);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner"></div>
        <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLinkActive}>Dashboard</button>
            <button onClick={() => navigate('/courses')} style={styles.navLink}>Browse Courses</button>
            <button onClick={() => navigate('/leaderboard')} style={styles.navLink}>Leaderboard</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>Welcome back, {user.fullName}! 👋</h2>
          <p style={styles.welcomeSubtitle}>Here's your learning progress</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderLeft: '4px solid #a78bfa'}}>
            <div style={styles.statIcon}>👤</div>
            <div>
              <p style={styles.statLabel}>Role</p>
              <p style={styles.statValue}>{user.role}</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #60a5fa'}}>
            <div style={styles.statIcon}>⚡</div>
            <div>
              <p style={styles.statLabel}>Total Points</p>
              <p style={styles.statValue}>{user.totalPoints}</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #34d399'}}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <p style={styles.statLabel}>Level</p>
              <p style={styles.statValue}>{user.level}</p>
            </div>
          </div>

          <div style={{...styles.statCard, borderLeft: '4px solid #fb923c'}}>
            <div style={styles.statIcon}>🎖️</div>
            <div>
              <p style={styles.statLabel}>Badges</p>
              <p style={styles.statValue}>{myBadges.length}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={styles.twoColumnGrid}>
          {/* My Courses */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📚 My Courses ({myCourses.length})</h3>
            {myCourses.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
                <p style={{ color: '#8892b0' }}>No courses enrolled yet</p>
                <button onClick={() => navigate('/courses')} style={styles.primaryBtn}>
                  Browse Courses
                </button>
              </div>
            ) : (
              <div style={styles.coursesList}>
                {myCourses.map((enrollment) => (
                  <div key={enrollment.id} style={styles.courseCard}>
                    <h4 style={styles.courseTitle}>{enrollment.course.title}</h4>
                    <p style={styles.courseProgress}>Progress: {enrollment.progress}%</p>
                    <div style={styles.progressBar}>
                      <div style={{...styles.progressFill, width: `${enrollment.progress}%`}}></div>
                    </div>
                    <button 
                      onClick={() => navigate(`/courses/${enrollment.course.id}`)}
                      style={styles.courseBtn}
                    >
                      Continue Learning →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Preview */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🏆 Top Learners</h3>
            {leaderboard.length === 0 ? (
              <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>No data yet</p>
            ) : (
              <div style={styles.leaderboardList}>
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} style={styles.leaderboardItem}>
                    <span style={styles.rank}>#{index + 1}</span>
                    <span style={styles.leaderboardName}>{entry.fullName}</span>
                    <span style={styles.leaderboardPoints}>{entry.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/leaderboard')} style={styles.secondaryBtn}>
              View Full Leaderboard
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actionsGrid}>
          <button onClick={() => navigate('/courses')} style={styles.actionCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
            <h4 style={styles.actionTitle}>Browse Courses</h4>
            <p style={styles.actionDesc}>Explore new courses</p>
          </button>

          <button onClick={() => navigate('/badges')} style={styles.actionCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎖️</div>
            <h4 style={styles.actionTitle}>My Badges</h4>
            <p style={styles.actionDesc}>View achievements</p>
          </button>

          <button onClick={() => navigate('/profile')} style={styles.actionCard}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👤</div>
            <h4 style={styles.actionTitle}>Profile</h4>
            <p style={styles.actionDesc}>Manage your account</p>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f' },
  loading: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  navLinkActive: { padding: '0.5rem 1rem', background: 'rgba(100, 255, 218, 0.1)', border: 'none', color: '#64ffda', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  
  content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
  
  welcomeSection: { marginBottom: '2rem' },
  welcomeTitle: { fontSize: '2rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  welcomeSubtitle: { fontSize: '1rem', color: '#8892b0', margin: 0 },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: '#1a1a2e', padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' },
  statIcon: { fontSize: '2.5rem' },
  statLabel: { fontSize: '0.875rem', color: '#8892b0', margin: '0 0 0.25rem 0' },
  statValue: { fontSize: '1.75rem', fontWeight: 'bold', color: '#ccd6f6', margin: 0 },
  
  twoColumnGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' },
  
  section: { background: '#1a1a2e', padding: '1.5rem', borderRadius: '12px' },
  sectionTitle: { fontSize: '1.25rem', color: '#ccd6f6', marginBottom: '1rem' },
  
  emptyState: { textAlign: 'center', padding: '2rem' },
  
  coursesList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  courseCard: { background: '#0f0f1e', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' },
  courseTitle: { fontSize: '1rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  courseProgress: { fontSize: '0.875rem', color: '#8892b0', margin: '0 0 0.5rem 0' },
  progressBar: { width: '100%', height: '8px', background: '#0a0a0f', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', transition: 'width 0.3s ease' },
  courseBtn: { padding: '0.5rem 1rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '6px', fontSize: '0.875rem', width: '100%' },
  
  leaderboardList: { marginBottom: '1rem' },
  leaderboardItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#0f0f1e', borderRadius: '8px', marginBottom: '0.5rem' },
  rank: { fontSize: '1.25rem', fontWeight: 'bold', color: '#64ffda', minWidth: '3rem' },
  leaderboardName: { flex: 1, color: '#ccd6f6' },
  leaderboardPoints: { color: '#8892b0', fontSize: '0.875rem' },
  
  primaryBtn: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', marginTop: '1rem' },
  secondaryBtn: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #667eea', color: '#667eea', cursor: 'pointer', borderRadius: '8px', fontSize: '0.875rem', width: '100%' },
  
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  actionCard: { background: '#1a1a2e', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' },
  actionTitle: { fontSize: '1.125rem', color: '#ccd6f6', margin: '0 0 0.25rem 0' },
  actionDesc: { fontSize: '0.875rem', color: '#8892b0', margin: 0 },
};

export default StudentDashboard;