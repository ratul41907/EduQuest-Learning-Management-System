import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../api/api';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await courseAPI.getAll({ instructorId: user?.id });
      setMyCourses(res.data.courses || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await courseAPI.delete(courseId);
      toast.success('Course deleted!');
      fetchMyCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLinkActive}>Dashboard</button>
            <button onClick={() => navigate('/instructor/create-course')} style={styles.navLink}>Create Course</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👨‍🏫 Instructor Dashboard</h1>
            <p style={styles.subtitle}>Welcome, {user?.fullName}!</p>
          </div>
          <button onClick={() => navigate('/instructor/create-course')} style={styles.createBtn}>
            ➕ Create New Course
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📚</div>
            <div>
              <p style={styles.statLabel}>Total Courses</p>
              <p style={styles.statValue}>{myCourses.length}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div>
              <p style={styles.statLabel}>Total Students</p>
              <p style={styles.statValue}>{myCourses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div>
              <p style={styles.statLabel}>Avg Rating</p>
              <p style={styles.statValue}>
                {myCourses.length > 0 
                  ? (myCourses.reduce((sum, c) => sum + (c.avgRating || 0), 0) / myCourses.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📚 My Courses</h2>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading courses...</p>
            </div>
          ) : myCourses.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
              <h3 style={{ color: '#ccd6f6', marginBottom: '0.5rem' }}>No courses yet</h3>
              <p style={{ color: '#8892b0', marginBottom: '1.5rem' }}>Create your first course to get started!</p>
              <button onClick={() => navigate('/instructor/create-course')} style={styles.createBtn}>
                ➕ Create Course
              </button>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {myCourses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                  {course.thumbnail && (
                    <div style={styles.thumbnail}>
                      <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={styles.courseContent}>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    <p style={styles.courseDesc}>{course.description?.substring(0, 100)}...</p>
                    
                    <div style={styles.courseMeta}>
                      <span style={styles.metaItem}>📊 Level {course.level}</span>
                      <span style={styles.metaItem}>👥 {course.enrollmentCount} students</span>
                      <span style={styles.metaItem}>⭐ {course.avgRating || 'N/A'}</span>
                    </div>

                    <div style={styles.courseActions}>
                      <button onClick={() => navigate(`/instructor/course/${course.id}`)} style={styles.manageBtn}>
                        ⚙️ Manage
                      </button>
                      <button onClick={() => navigate(`/instructor/course/${course.id}/add-lesson`)} style={styles.addLessonBtn}>
                        ➕ Add Lesson
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} style={styles.deleteBtn}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '2.5rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1.1rem', color: '#8892b0', margin: 0 },
  createBtn: { padding: '1rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' },
  statIcon: { fontSize: '2.5rem' },
  statLabel: { fontSize: '0.875rem', color: '#8892b0', margin: '0 0 0.25rem 0' },
  statValue: { fontSize: '1.75rem', color: '#ccd6f6', margin: 0, fontWeight: 'bold' },
  section: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem' },
  sectionTitle: { fontSize: '1.5rem', color: '#ccd6f6', margin: '0 0 1.5rem 0' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' },
  empty: { textAlign: 'center', padding: '3rem' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' },
  courseCard: { background: '#0f0f1e', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' },
  thumbnail: { height: '180px', background: '#1a1a2e' },
  courseContent: { padding: '1.5rem' },
  courseTitle: { fontSize: '1.25rem', color: '#ccd6f6', margin: '0 0 0.75rem 0', fontWeight: '600' },
  courseDesc: { fontSize: '0.9rem', color: '#8892b0', margin: '0 0 1rem 0', lineHeight: '1.5' },
  courseMeta: { display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' },
  metaItem: { fontSize: '0.875rem', color: '#8892b0' },
  courseActions: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  manageBtn: { flex: 1, padding: '0.75rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600' },
  addLessonBtn: { flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600' },
  deleteBtn: { padding: '0.75rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', borderRadius: '6px', fontSize: '0.9rem' },
};

export default InstructorDashboard;