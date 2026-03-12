import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../api/api';
import toast from 'react-hot-toast';

const Courses = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseAPI.getAll();
      setCourses(res.data.courses || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseAPI.enroll(courseId);
      toast.success('✅ Enrolled successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
            <button onClick={() => navigate('/courses')} style={styles.navLinkActive}>Browse Courses</button>
            <button onClick={() => navigate('/leaderboard')} style={styles.navLink}>Leaderboard</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📚 Course Library</h2>
            <p style={styles.subtitle}>{courses.length} courses available</p>
          </div>
          <input
            type="text"
            placeholder="🔍 Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="spinner"></div>
            <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
            <h3 style={{ color: '#ccd6f6', marginBottom: '0.5rem' }}>No courses found</h3>
            <p style={{ color: '#8892b0' }}>Try adjusting your search</p>
          </div>
        ) : (
          <div style={styles.coursesGrid}>
            {filteredCourses.map(course => (
              <div key={course.id} style={styles.courseCard}>
                <div style={styles.courseImage}>
                  {course.thumbnail ? (
                    <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.3 }}>
                      📚
                    </div>
                  )}
                  <div style={styles.courseBadge}>Level {course.level}</div>
                </div>
                <div style={styles.courseContent}>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <p style={styles.courseDescription}>{course.description?.substring(0, 100)}...</p>
                  <div style={styles.courseStats}>
                    <span style={styles.stat}>📖 {course.lessonCount} lessons</span>
                    <span style={styles.stat}>👥 {course.enrollmentCount} enrolled</span>
                  </div>
                  <div style={styles.courseActions}>
                    <button onClick={() => navigate(`/courses/${course.id}`)} style={styles.viewBtn}>View Details</button>
                    <button onClick={() => handleEnroll(course.id)} style={styles.enrollBtn}>Enroll →</button>
                  </div>
                </div>
              </div>
            ))}
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
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  navLinkActive: { padding: '0.5rem 1rem', background: 'rgba(100, 255, 218, 0.1)', border: 'none', color: '#64ffda', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '2rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1rem', color: '#8892b0', margin: 0 },
  searchInput: { padding: '0.75rem 1rem', background: '#1a1a2e', border: '1px solid rgba(100, 255, 218, 0.2)', borderRadius: '8px', color: '#ccd6f6', fontSize: '1rem', outline: 'none', width: '300px' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' },
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: '#1a1a2e', borderRadius: '12px' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  courseCard: { background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' },
  courseImage: { position: 'relative', height: '180px', overflow: 'hidden' },
  courseBadge: { position: 'absolute', top: '1rem', right: '1rem', padding: '0.375rem 0.75rem', background: 'rgba(100, 255, 218, 0.9)', borderRadius: '20px', color: '#0a0a0f', fontSize: '0.75rem', fontWeight: '600' },
  courseContent: { padding: '1.5rem' },
  courseTitle: { fontSize: '1.25rem', color: '#ccd6f6', margin: '0 0 0.75rem 0', fontWeight: '600' },
  courseDescription: { fontSize: '0.9rem', color: '#8892b0', margin: '0 0 1rem 0', lineHeight: '1.5' },
  courseStats: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  stat: { fontSize: '0.875rem', color: '#8892b0' },
  courseActions: { display: 'flex', gap: '0.75rem' },
  viewBtn: { flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid #667eea', color: '#667eea', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  enrollBtn: { flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' },
};

export default Courses;