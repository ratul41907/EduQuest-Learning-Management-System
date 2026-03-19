import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, lessonAPI, quizAPI } from '../api/api';
import toast from 'react-hot-toast';

const ManageCourse = () => {
  const { id } = useParams();
  const { logout } = useAuth();
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
        courseAPI.getById(id).catch(() => ({ data: null })),
        lessonAPI.getByCourse(id).catch(() => ({ data: [] })),
        quizAPI.getByCourse(id).catch(() => ({ data: [] })),
      ]);

      setCourse(courseRes.data);
      setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data?.lessons || []);
      setQuizzes(Array.isArray(quizzesRes.data) ? quizzesRes.data : quizzesRes.data?.quizzes || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    
    try {
      await lessonAPI.delete(lessonId);
      toast.success('Lesson deleted!');
      fetchCourseData();
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    
    try {
      await quizAPI.delete(quizId);
      toast.success('Quiz deleted!');
      fetchCourseData();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner"></div>
        <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={styles.loading}>
        <h2 style={{ color: '#ccd6f6' }}>Course not found</h2>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{course.title}</h1>
            <p style={styles.subtitle}>{course.description}</p>
          </div>
          <div style={styles.actions}>
            <button onClick={() => navigate(`/instructor/course/${id}/add-lesson`)} style={styles.addBtn}>
              ➕ Add Lesson
            </button>
            <button onClick={() => navigate(`/instructor/course/${id}/add-quiz`)} style={styles.addBtn}>
              ➕ Add Quiz
            </button>
          </div>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab('lessons')} style={activeTab === 'lessons' ? styles.tabActive : styles.tab}>
            📚 Lessons ({lessons.length})
          </button>
          <button onClick={() => setActiveTab('quizzes')} style={activeTab === 'quizzes' ? styles.tabActive : styles.tab}>
            ❓ Quizzes ({quizzes.length})
          </button>
        </div>

        {activeTab === 'lessons' && (
          <div style={styles.section}>
            {lessons.length === 0 ? (
              <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>No lessons yet. Click "➕ Add Lesson" to create one!</p>
            ) : (
              <div style={styles.list}>
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>
                        <span style={styles.number}>{index + 1}</span>
                        {lesson.title}
                      </h3>
                    </div>
                    <p style={styles.cardDesc}>{lesson.content?.substring(0, 150)}...</p>
                    <div style={styles.cardActions}>
                      <button onClick={() => handleDeleteLesson(lesson.id)} style={styles.deleteBtn}>
                        🗑️ Delete
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
              <p style={{ color: '#8892b0', textAlign: 'center', padding: '2rem' }}>No quizzes yet. Click "➕ Add Quiz" to create one!</p>
            ) : (
              <div style={styles.list}>
                {quizzes.map((quiz) => (
                  <div key={quiz.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>
                        <span style={styles.quizIcon}>❓</span>
                        {quiz.title}
                      </h3>
                    </div>
                    <p style={styles.cardDesc}>{quiz.description || 'No description'}</p>
                    <div style={styles.quizMeta}>
                      <span>Passing: {quiz.passingScore}%</span>
                      <span>Questions: {quiz.questions?.length || 0}</span>
                    </div>
                    <div style={styles.cardActions}>
                      <button onClick={() => handleDeleteQuiz(quiz.id)} style={styles.deleteBtn}>
                        🗑️ Delete
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
  loading: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', gap: '1rem' },
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0' },
  navContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  navLinks: { display: 'flex', gap: '1rem' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  backBtn: { padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #667eea', color: '#667eea', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', marginBottom: '2rem' },
  header: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '2rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1rem', color: '#8892b0', margin: 0 },
  actions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  addBtn: { padding: '0.75rem 1.5rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' },
  tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid transparent' },
  tabActive: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#64ffda', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid #64ffda' },
  section: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#0f0f1e', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' },
  cardHeader: { marginBottom: '1rem' },
  cardTitle: { fontSize: '1.25rem', color: '#ccd6f6', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' },
  number: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#667eea', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 'bold' },
  quizIcon: { fontSize: '1.5rem' },
  cardDesc: { fontSize: '0.95rem', color: '#8892b0', margin: '0 0 1rem 0', lineHeight: '1.5' },
  quizMeta: { fontSize: '0.875rem', color: '#8892b0', marginBottom: '1rem', display: 'flex', gap: '1.5rem' },
  cardActions: { display: 'flex', gap: '1rem' },
  deleteBtn: { padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
};

export default ManageCourse;