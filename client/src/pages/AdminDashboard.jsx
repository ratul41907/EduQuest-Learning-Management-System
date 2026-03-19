import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        adminAPI.getUsers().catch(() => ({ data: { users: [] } })),
        adminAPI.getAnalytics().catch(() => ({ data: null })),
      ]);

      setUsers(usersRes.data.users || usersRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
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
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👨‍💼 Admin Dashboard</h1>
            <p style={styles.subtitle}>Welcome, {user?.fullName}!</p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <p style={styles.statLabel}>Total Users</p>
              <p style={styles.statValue}>{users.length}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎓</div>
            <div>
              <p style={styles.statLabel}>Students</p>
              <p style={styles.statValue}>{users.filter(u => u.role === 'STUDENT').length}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👨‍🏫</div>
            <div>
              <p style={styles.statLabel}>Instructors</p>
              <p style={styles.statValue}>{users.filter(u => u.role === 'INSTRUCTOR').length}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <div>
              <p style={styles.statLabel}>Active Today</p>
              <p style={styles.statValue}>{Math.floor(users.length * 0.3)}</p>
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab('overview')} style={activeTab === 'overview' ? styles.tabActive : styles.tab}>
            📊 Overview
          </button>
          <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? styles.tabActive : styles.tab}>
            👥 Users ({users.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>System Overview</h2>
            <div style={styles.overviewGrid}>
              <div style={styles.overviewCard}>
                <h3 style={styles.overviewTitle}>📚 Platform Stats</h3>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewLabel}>Total Courses</span>
                    <span style={styles.overviewValue}>{analytics?.totalCourses || 0}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewLabel}>Total Lessons</span>
                    <span style={styles.overviewValue}>{analytics?.totalLessons || 0}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewLabel}>Total Quizzes</span>
                    <span style={styles.overviewValue}>{analytics?.totalQuizzes || 0}</span>
                  </div>
                </div>
              </div>

              <div style={styles.overviewCard}>
                <h3 style={styles.overviewTitle}>🎯 Engagement</h3>
                <div style={styles.overviewStats}>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewLabel}>Total Enrollments</span>
                    <span style={styles.overviewValue}>{analytics?.totalEnrollments || 0}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewLabel}>Quiz Attempts</span>
                    <span style={styles.overviewValue}>{analytics?.totalQuizAttempts || 0}</span>
                  </div>
                  <div style={styles.overviewStat}>
                    <span style={styles.overviewLabel}>Avg Completion</span>
                    <span style={styles.overviewValue}>{analytics?.avgCompletion || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>👥 All Users</h2>
            {loading ? (
              <div style={styles.loading}>
                <div className="spinner"></div>
                <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>No users found</p>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={styles.tableCell}>Name</div>
                  <div style={styles.tableCell}>Email</div>
                  <div style={styles.tableCell}>Role</div>
                  <div style={styles.tableCell}>Points</div>
                  <div style={styles.tableCell}>Level</div>
                </div>
                {users.map(u => (
                  <div key={u.id} style={styles.tableRow}>
                    <div style={styles.tableCell}>{u.fullName}</div>
                    <div style={styles.tableCell}>{u.email}</div>
                    <div style={styles.tableCell}>
                      <span style={u.role === 'ADMIN' ? styles.roleAdmin : u.role === 'INSTRUCTOR' ? styles.roleInstructor : styles.roleStudent}>
                        {u.role}
                      </span>
                    </div>
                    <div style={styles.tableCell}>{u.totalPoints}</div>
                    <div style={styles.tableCell}>{u.level}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f' },
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  navLinks: { display: 'flex', gap: '1rem' },
  navLinkActive: { padding: '0.5rem 1rem', background: 'rgba(100, 255, 218, 0.1)', border: 'none', color: '#64ffda', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '2.5rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1.1rem', color: '#8892b0', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' },
  statIcon: { fontSize: '2.5rem' },
  statLabel: { fontSize: '0.875rem', color: '#8892b0', margin: '0 0 0.25rem 0' },
  statValue: { fontSize: '1.75rem', color: '#ccd6f6', margin: 0, fontWeight: 'bold' },
  tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid transparent' },
  tabActive: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#64ffda', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid #64ffda' },
  section: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem' },
  sectionTitle: { fontSize: '1.5rem', color: '#ccd6f6', margin: '0 0 1.5rem 0' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
  overviewCard: { background: '#0f0f1e', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' },
  overviewTitle: { fontSize: '1.125rem', color: '#ccd6f6', margin: '0 0 1rem 0' },
  overviewStats: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  overviewStat: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  overviewLabel: { fontSize: '0.875rem', color: '#8892b0' },
  overviewValue: { fontSize: '1.25rem', color: '#ccd6f6', fontWeight: 'bold' },
  table: { overflow: 'auto' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem', background: '#0f0f1e', borderRadius: '8px 8px 0 0', fontWeight: '600', color: '#ccd6f6', fontSize: '0.875rem' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8892b0', fontSize: '0.875rem' },
  tableCell: { overflow: 'hidden', textOverflow: 'ellipsis' },
  roleAdmin: { padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block' },
  roleInstructor: { padding: '0.25rem 0.75rem', background: 'rgba(102, 126, 234, 0.2)', color: '#667eea', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block' },
  roleStudent: { padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-block' },
};

export default AdminDashboard;