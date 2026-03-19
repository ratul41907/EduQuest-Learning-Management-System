import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../api/api';
import toast from 'react-hot-toast';

const AddQuiz = () => {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courseId: id,
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 30,
  });
  const [questions, setQuestions] = useState([{
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  }]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least 1 question');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const quizData = {
        ...formData,
        passingScore: Number(formData.passingScore),
        timeLimit: Number(formData.timeLimit),
        questions,
      };
      
      await quizAPI.create(quizData);
      toast.success('✅ Quiz created!');
      navigate(`/instructor/course/${id}`);
    } catch (error) {
      toast.error('Failed to create quiz');
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
          <h1 style={styles.title}>Create New Quiz</h1>
          <p style={styles.subtitle}>Add a quiz to test your students</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Quiz Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., React Fundamentals Quiz"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the quiz..."
                style={styles.textarea}
                rows={3}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Passing Score (%) *</label>
                <input
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Time Limit (minutes)</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  min="1"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.questionsSection}>
              <div style={styles.questionHeader}>
                <h2 style={styles.questionsTitle}>Questions</h2>
                <button type="button" onClick={addQuestion} style={styles.addQuestionBtn}>
                  ➕ Add Question
                </button>
              </div>

              {questions.map((q, index) => (
                <div key={index} style={styles.questionCard}>
                  <div style={styles.questionCardHeader}>
                    <h3 style={styles.questionNumber}>Question {index + 1}</h3>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(index)} style={styles.removeBtn}>
                        🗑️ Remove
                      </button>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Question Text *</label>
                    <textarea
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                      placeholder="Enter your question..."
                      style={styles.textarea}
                      rows={2}
                      required
                    />
                  </div>

                  <div style={styles.optionsGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Option A *</label>
                      <input
                        type="text"
                        value={q.optionA}
                        onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)}
                        placeholder="Option A"
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Option B *</label>
                      <input
                        type="text"
                        value={q.optionB}
                        onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)}
                        placeholder="Option B"
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Option C *</label>
                      <input
                        type="text"
                        value={q.optionC}
                        onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)}
                        placeholder="Option C"
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Option D *</label>
                      <input
                        type="text"
                        value={q.optionD}
                        onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)}
                        placeholder="Option D"
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Correct Answer *</label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Creating...' : '✓ Create Quiz'}
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
  content: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  backBtn: { padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #667eea', color: '#667eea', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', marginBottom: '2rem' },
  formCard: { background: '#1a1a2e', borderRadius: '12px', padding: '3rem', border: '1px solid rgba(255,255,255,0.05)' },
  title: { fontSize: '2rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1rem', color: '#8892b0', margin: '0 0 2rem 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', color: '#ccd6f6', fontWeight: '500' },
  input: { padding: '0.875rem 1rem', background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccd6f6', fontSize: '1rem', outline: 'none' },
  textarea: { padding: '0.875rem 1rem', background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccd6f6', fontSize: '1rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
  select: { padding: '0.875rem 1rem', background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccd6f6', fontSize: '1rem', outline: 'none', cursor: 'pointer' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' },
  questionsSection: { background: '#0f0f1e', borderRadius: '12px', padding: '2rem' },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  questionsTitle: { fontSize: '1.5rem', color: '#ccd6f6', margin: 0 },
  addQuestionBtn: { padding: '0.75rem 1.5rem', background: '#10b981', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' },
  questionCard: { background: '#1a1a2e', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' },
  questionCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  questionNumber: { fontSize: '1.125rem', color: '#ccd6f6', margin: 0 },
  removeBtn: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', borderRadius: '6px', fontSize: '0.875rem' },
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' },
  submitBtn: { padding: '1rem 2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600' },
};

export default AddQuiz;