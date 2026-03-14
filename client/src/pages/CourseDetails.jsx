import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, lessonAPI, quizAPI } from '../api/api';
import toast from 'react-hot-toast';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes, quizzesRes] = await Promise.all([
        courseAPI.getById(id),
        lessonAPI.getByCourse(id),
        quizAPI.getByCourse(id),
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data || []);
      setQuizzes(quizzesRes.data || []);
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await courseAPI.enroll(id);
      toast.success('✅ Enrolled successfully!');
      fetchCourseData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      await lessonAPI.markComplete(lessonId);
      toast.success('✅ Lesson completed!');
      fetchCourseData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner"></div>
        <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return <div style={styles.loading}>Course not found</div>;
  }

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
            <button onClick={() => navigate('/courses')} style={styles.navLink}>Courses</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Course Header */}
        <div style={styles.header}>
          {course.thumbnail && (
            <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} style={styles.thumbnail} />
          )}
          <div style={styles.headerContent}>
            <h1 style={styles.title}>{course.title}</h1>
            <p style={styles.description}>{course.description}</p>
            <div style={styles.meta}>
              <span style={styles.metaItem}>📊 Level {course.level}</span>
              <span style={styles.metaItem}>📖 {course.lessonCount} lessons</span>
              <span style={styles.metaItem}>❓ {course.quizCount} quizzes</span>
              <span style={styles.metaItem}>👥 {course.enrollmentCount} enrolled</span>
            </div>
            <button onClick={handleEnroll} style={styles.enrollBtn}>
              Enroll in Course
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('lessons')} 
            style={activeTab === 'lessons' ? styles.tabActive : styles.tab}
          >
            📚 Lessons ({lessons.length})
          </button>
          <button 
            onClick={() => setActiveTab('quizzes')} 
            style={activeTab === 'quizzes' ? styles.tabActive : styles.tab}
          >
            ❓ Quizzes ({quizzes.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'lessons' && (
          <div style={styles.section}>
            {lessons.length === 0 ? (
              <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>No lessons yet</p>
            ) : (
              <div style={styles.list}>
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>
                        <span style={styles.lessonNumber}>{index + 1}</span>
                        {lesson.title}
                      </h3>
                      <span style={styles.lessonType}>{lesson.type || 'TEXT'}</span>
                    </div>
                    {lesson.content && (
                      <p style={styles.cardDesc}>{lesson.content.substring(0, 150)}...</p>
                    )}
                    <div style={styles.cardActions}>
                      <button onClick={() => handleLessonComplete(lesson.id)} style={styles.completeBtn}>
                        ✓ Mark Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div style={styles.section}>
            {quizzes.length === 0 ? (
              <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>No quizzes yet</p>
            ) : (
              <div style={styles.list}>
                {quizzes.map((quiz, index) => (
                  <div key={quiz.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>
                        <span style={styles.quizIcon}>❓</span>
                        {quiz.title}
                      </h3>
                      <span style={styles.passingScore}>Pass: {quiz.passingScore}%</span>
                    </div>
                    {quiz.description && (
                      <p style={styles.cardDesc}>{quiz.description}</p>
                    )}
                    <div style={styles.cardActions}>
                      <button 
                        onClick={() => navigate(`/quizzes/${quiz.id}`)} 
                        style={styles.takeQuizBtn}
                      >
                        Take Quiz →
                      </button>
                    </div>
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
  loading: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  header: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  thumbnail: { width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' },
  headerContent: { flex: 1 },
  title: { fontSize: '2.5rem', color: '#ccd6f6', margin: '0 0 1rem 0', fontWeight: 'bold' },
  description: { fontSize: '1.1rem', color: '#8892b0', margin: '0 0 1.5rem 0', lineHeight: '1.6' },
  meta: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  metaItem: { fontSize: '0.9rem', color: '#8892b0' },
  enrollBtn: { padding: '1rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600' },
  tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid transparent' },
  tabActive: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#64ffda', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid #64ffda' },
  section: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#0f0f1e', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  cardTitle: { fontSize: '1.25rem', color: '#ccd6f6', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' },
  lessonNumber: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#667eea', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 'bold' },
  quizIcon: { fontSize: '1.5rem' },
  lessonType: { padding: '0.25rem 0.75rem', background: 'rgba(100, 255, 218, 0.1)', color: '#64ffda', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  passingScore: { padding: '0.25rem 0.75rem', background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  cardDesc: { fontSize: '0.95rem', color: '#8892b0', margin: '0 0 1rem 0', lineHeight: '1.5' },
  cardActions: { display: 'flex', gap: '1rem' },
  completeBtn: { padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  takeQuizBtn: { padding: '0.75rem 1.5rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' },
};

export default CourseDetails;