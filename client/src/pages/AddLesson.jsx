import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { lessonAPI } from '../api/api';
import toast from 'react-hot-toast';

const AddLesson = () => {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseId: id,
    title: '',
    content: '',
    type: 'TEXT',
    orderIndex: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await lessonAPI.create(formData);
      toast.success('✅ Lesson created!');
      navigate(`/instructor/course/${id}`);
    } catch (error) {
      toast.error('Failed to create lesson');
    } finally {
      setSubmitting(false);
    }
  };

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
        <button onClick={() => navigate(`/instructor/course/${id}`)} style={styles.backBtn}>
          ← Back to Course
        </button>

        <div style={styles.formCard}>
          <h1 style={styles.title}>Add New Lesson</h1>
          <p style={styles.subtitle}>Create a lesson for your course</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Lesson Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to React Hooks"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your lesson content here..."
                style={styles.textarea}
                rows={12}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Lesson Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="TEXT">Text</option>
                <option value="VIDEO">Video</option>
                <option value="INTERACTIVE">Interactive</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Order Index</label>
              <input
                type="number"
                name="orderIndex"
                value={formData.orderIndex}
                onChange={handleChange}
                min="1"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Creating...' : '✓ Create Lesson'}
            </button>
          </form>
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
  navLinks: { display: 'flex', gap: '1rem' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  backBtn: { padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #667eea', color: '#667eea', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', marginBottom: '2rem' },
  formCard: { background: '#1a1a2e', borderRadius: '12px', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)' },
  title: { fontSize: '2rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1rem', color: '#8892b0', margin: '0 0 2rem 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', color: '#ccd6f6', fontWeight: '500' },
  input: { padding: '0.875rem 1rem', background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccd6f6', fontSize: '1rem', outline: 'none' },
  textarea: { padding: '0.875rem 1rem', background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccd6f6', fontSize: '1rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
  select: { padding: '0.875rem 1rem', background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccd6f6', fontSize: '1rem', outline: 'none', cursor: 'pointer' },
  submitBtn: { padding: '1rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', marginTop: '1rem' },
};

export default AddLesson;