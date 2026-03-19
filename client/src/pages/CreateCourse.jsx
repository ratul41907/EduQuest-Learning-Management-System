import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../api/api';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await courseAPI.create(formData);
      toast.success('✅ Course created successfully!');
      navigate(`/instructor/course/${res.data.id || res.data.course?.id}`);
    } catch (error) {
      toast.error('Failed to create course');
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
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>

        <div style={styles.formCard}>
          <h1 style={styles.title}>Create New Course</h1>
          <p style={styles.subtitle}>Fill in the details to create your course</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., React Advanced Patterns"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what students will learn..."
                style={styles.textarea}
                rows={6}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                style={styles.select}
                required
              >
                <option value={1}>Level 1 - Beginner</option>
                <option value={2}>Level 2 - Intermediate</option>
                <option value={3}>Level 3 - Advanced</option>
                <option value={4}>Level 4 - Expert</option>
                <option value={5}>Level 5 - Master</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Creating...' : '✓ Create Course'}
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

export default CreateCourse;