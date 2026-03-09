import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v2',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: e.target.email.value,
        password: e.target.password.value,
      });
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data.user);
      setView('dashboard');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.error?.message || 'Login failed'));
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data.courses);
    } catch (err) {
      console.error('Failed to fetch courses');
    }
    setLoading(false);
  };

  const enrollCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      alert('✅ Successfully enrolled!');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Enrollment failed'));
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setView('login');
  };

  useEffect(() => {
    if (view === 'courses') fetchCourses();
  }, [view]);

  // LOGIN VIEW
  if (view === 'login') {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <div style={styles.loginHeader}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>🎓</span>
              <span style={styles.logoText}>EduQuest</span>
            </div>
            <p style={styles.loginSubtitle}>Enterprise Learning Management System</p>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                defaultValue="student@test.com"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                defaultValue="password123"
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.loginButton} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.testAccounts}>
            <p style={styles.testAccountsTitle}>Demo Accounts</p>
            <div style={styles.testAccountsList}>
              <span style={styles.badge}>Student: student@test.com</span>
              <span style={styles.badge}>Instructor: instructor@test.com</span>
              <span style={styles.badge}>Admin: admin@test.com</span>
            </div>
            <p style={styles.testAccountsPassword}>Password: password123</p>
          </div>
        </div>

        <div style={styles.loginFooter}>
          <p style={styles.footerText}>© 2026 EduQuest. Enterprise Edition.</p>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  if (view === 'dashboard') {
    return (
      <div style={styles.dashboard}>
        <nav style={styles.navbar}>
          <div style={styles.navContent}>
            <div style={styles.navLeft}>
              <div style={styles.navLogo}>
                <span style={styles.navLogoIcon}>🎓</span>
                <span style={styles.navLogoText}>EduQuest</span>
              </div>
              <div style={styles.navLinks}>
                <button onClick={() => setView('dashboard')} style={styles.navLink}>Dashboard</button>
                <button onClick={() => setView('courses')} style={styles.navLink}>Courses</button>
                <button onClick={() => alert('Coming soon')} style={styles.navLink}>Leaderboard</button>
              </div>
            </div>
            <div style={styles.navRight}>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>{user?.fullName?.charAt(0)}</div>
                <div style={styles.userDetails}>
                  <span style={styles.userName}>{user?.fullName}</span>
                  <span style={styles.userRole}>{user?.role}</span>
                </div>
              </div>
              <button onClick={logout} style={styles.logoutButton}>
                <span>⎋</span> Logout
              </button>
            </div>
          </div>
        </nav>

        <div style={styles.dashboardContent}>
          <div style={styles.dashboardHeader}>
            <h1 style={styles.dashboardTitle}>Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p style={styles.dashboardSubtitle}>Here's what's happening with your learning journey</p>
          </div>

          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, ...styles.statCardPurple}}>
              <div style={styles.statIcon}>👤</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Role</p>
                <p style={styles.statValue}>{user?.role}</p>
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.statCardBlue}}>
              <div style={styles.statIcon}>⚡</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Total Points</p>
                <p style={styles.statValue}>{user?.totalPoints?.toLocaleString()}</p>
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.statCardGreen}}>
              <div style={styles.statIcon}>📊</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Current Level</p>
                <p style={styles.statValue}>Level {user?.level}</p>
              </div>
            </div>

            <div style={{...styles.statCard, ...styles.statCardOrange}}>
              <div style={styles.statIcon}>🎯</div>
              <div style={styles.statContent}>
                <p style={styles.statLabel}>Next Milestone</p>
                <p style={styles.statValue}>{1000 - (user?.totalPoints % 1000)} pts</p>
              </div>
            </div>
          </div>

          <div style={styles.actionsGrid}>
            <button onClick={() => setView('courses')} style={styles.actionCard}>
              <div style={styles.actionIcon}>📚</div>
              <div style={styles.actionContent}>
                <h3 style={styles.actionTitle}>Browse Courses</h3>
                <p style={styles.actionDescription}>Explore our extensive course library</p>
              </div>
              <div style={styles.actionArrow}>→</div>
            </button>

            <button onClick={() => alert('Coming soon')} style={styles.actionCard}>
              <div style={styles.actionIcon}>🏆</div>
              <div style={styles.actionContent}>
                <h3 style={styles.actionTitle}>Leaderboard</h3>
                <p style={styles.actionDescription}>See how you rank globally</p>
              </div>
              <div style={styles.actionArrow}>→</div>
            </button>

            <button onClick={() => alert('Coming soon')} style={styles.actionCard}>
              <div style={styles.actionIcon}>🎖️</div>
              <div style={styles.actionContent}>
                <h3 style={styles.actionTitle}>My Badges</h3>
                <p style={styles.actionDescription}>View your achievements</p>
              </div>
              <div style={styles.actionArrow}>→</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COURSES VIEW
  if (view === 'courses') {
    const filteredCourses = courses.filter(c => 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div style={styles.dashboard}>
        <nav style={styles.navbar}>
          <div style={styles.navContent}>
            <div style={styles.navLeft}>
              <div style={styles.navLogo}>
                <span style={styles.navLogoIcon}>🎓</span>
                <span style={styles.navLogoText}>EduQuest</span>
              </div>
              <div style={styles.navLinks}>
                <button onClick={() => setView('dashboard')} style={styles.navLink}>Dashboard</button>
                <button onClick={() => setView('courses')} style={{...styles.navLink, ...styles.navLinkActive}}>Courses</button>
                <button onClick={() => alert('Coming soon')} style={styles.navLink}>Leaderboard</button>
              </div>
            </div>
            <div style={styles.navRight}>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>{user?.fullName?.charAt(0)}</div>
                <div style={styles.userDetails}>
                  <span style={styles.userName}>{user?.fullName}</span>
                  <span style={styles.userRole}>{user?.role}</span>
                </div>
              </div>
              <button onClick={logout} style={styles.logoutButton}>
                <span>⎋</span> Logout
              </button>
            </div>
          </div>
        </nav>

        <div style={styles.dashboardContent}>
          <div style={styles.coursesHeader}>
            <div>
              <h1 style={styles.dashboardTitle}>Course Library</h1>
              <p style={styles.dashboardSubtitle}>{courses.length} courses available</p>
            </div>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="🔍 Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>No courses found</h3>
              <p style={styles.emptyDescription}>Try adjusting your search</p>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {filteredCourses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                  <div style={styles.courseImageContainer}>
                    {course.thumbnail ? (
                      <img 
                        src={`http://localhost:5000${course.thumbnail}`} 
                        alt={course.title}
                        style={styles.courseImage}
                      />
                    ) : (
                      <div style={styles.courseImagePlaceholder}>
                        <span style={styles.placeholderIcon}>📚</span>
                      </div>
                    )}
                    <div style={styles.courseBadge}>Level {course.level}</div>
                  </div>

                  <div style={styles.courseContent}>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    <p style={styles.courseDescription}>
                      {course.description?.substring(0, 120)}
                      {course.description?.length > 120 ? '...' : ''}
                    </p>

                    <div style={styles.courseStats}>
                      <div style={styles.courseStat}>
                        <span style={styles.statIcon}>📖</span>
                        <span style={styles.statText}>{course.lessonCount} lessons</span>
                      </div>
                      <div style={styles.courseStat}>
                        <span style={styles.statIcon}>👥</span>
                        <span style={styles.statText}>{course.enrollmentCount} enrolled</span>
                      </div>
                      <div style={styles.courseStat}>
                        <span style={styles.statIcon}>⭐</span>
                        <span style={styles.statText}>{course.avgRating || 'New'}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => enrollCourse(course.id)}
                      style={styles.enrollButton}
                    >
                      Enroll Now →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  // LOGIN STYLES
  loginContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  loginBox: {
    background: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '3rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  logoIcon: {
    fontSize: '3rem',
  },
  logoText: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  loginSubtitle: {
    color: '#8892b0',
    fontSize: '0.9rem',
    margin: 0,
  },
  form: {
    marginBottom: '2rem',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    color: '#ccd6f6',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(100, 255, 218, 0.05)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '12px',
    color: '#ccd6f6',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  },
  loginButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
  },
  testAccounts: {
    background: 'rgba(100, 255, 218, 0.05)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  testAccountsTitle: {
    color: '#64ffda',
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0 0 0.75rem 0',
  },
  testAccountsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    background: 'rgba(102, 126, 234, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '6px',
    color: '#a8b2d1',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  },
  testAccountsPassword: {
    color: '#8892b0',
    fontSize: '0.8rem',
    margin: 0,
    fontFamily: 'monospace',
  },
  loginFooter: {
    marginTop: '3rem',
    textAlign: 'center',
  },
  footerText: {
    color: '#495670',
    fontSize: '0.875rem',
  },

  // DASHBOARD STYLES
  dashboard: {
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  navbar: {
    background: 'rgba(15, 15, 30, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '3rem',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLogoIcon: {
    fontSize: '1.75rem',
  },
  navLogoText: {
    fontSize: '1.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    gap: '0.5rem',
  },
  navLink: {
    padding: '0.625rem 1rem',
    background: 'transparent',
    border: 'none',
    color: '#8892b0',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    background: 'rgba(100, 255, 218, 0.1)',
    color: '#64ffda',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    color: '#ccd6f6',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  userRole: {
    color: '#64ffda',
    fontSize: '0.75rem',
  },
  logoutButton: {
    padding: '0.625rem 1.25rem',
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    borderRadius: '8px',
    color: '#f43f5e',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },

  // DASHBOARD CONTENT
  dashboardContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  dashboardHeader: {
    marginBottom: '2.5rem',
  },
  dashboardTitle: {
    color: '#ccd6f6',
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
  },
  dashboardSubtitle: {
    color: '#8892b0',
    fontSize: '1rem',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    background: 'rgba(26, 26, 46, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    transition: 'all 0.3s ease',
  },
  statCardPurple: {
    borderLeft: '3px solid #a78bfa',
  },
  statCardBlue: {
    borderLeft: '3px solid #60a5fa',
  },
  statCardGreen: {
    borderLeft: '3px solid #34d399',
  },
  statCardOrange: {
    borderLeft: '3px solid #fb923c',
  },
  statIcon: {
    fontSize: '2.5rem',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    color: '#8892b0',
    fontSize: '0.875rem',
    margin: '0 0 0.25rem 0',
  },
  statValue: {
    color: '#ccd6f6',
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: 0,
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  actionCard: {
    background: 'rgba(26, 26, 46, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  actionIcon: {
    fontSize: '2.5rem',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#ccd6f6',
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: '0 0 0.25rem 0',
  },
  actionDescription: {
    color: '#8892b0',
    fontSize: '0.875rem',
    margin: 0,
  },
  actionArrow: {
    color: '#64ffda',
    fontSize: '1.5rem',
    fontWeight: '300',
  },

  // COURSES STYLES
  coursesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  searchContainer: {
    flex: '0 1 400px',
  },
  searchInput: {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(26, 26, 46, 0.6)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '12px',
    color: '#ccd6f6',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '2rem',
  },
  courseCard: {
    background: 'rgba(26, 26, 46, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  courseImageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  courseImagePlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: '4rem',
    opacity: 0.3,
  },
  courseBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.375rem 0.875rem',
    background: 'rgba(100, 255, 218, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    color: '#0a0a0f',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  courseContent: {
    padding: '1.5rem',
  },
  courseTitle: {
    color: '#ccd6f6',
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 0.75rem 0',
  },
  courseDescription: {
    color: '#8892b0',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    margin: '0 0 1.25rem 0',
  },
  courseStats: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1.25rem',
  },
  courseStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  statText: {
    color: '#8892b0',
    fontSize: '0.875rem',
  },
  enrollButton: {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // LOADING & EMPTY STATES
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(100, 255, 218, 0.1)',
    borderTop: '4px solid #64ffda',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#8892b0',
    marginTop: '1.5rem',
    fontSize: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'rgba(26, 26, 46, 0.4)',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    color: '#ccd6f6',
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
  emptyDescription: {
    color: '#8892b0',
    fontSize: '1rem',
    margin: 0,
  },
};

export default App;