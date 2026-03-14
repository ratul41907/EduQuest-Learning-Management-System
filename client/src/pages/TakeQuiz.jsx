import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../api/api';
import toast from 'react-hot-toast';

const TakeQuiz = () => {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await quizAPI.getById(id);
      setQuiz(res.data);
      setQuestions(res.data.questions || []);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Please answer all ${questions.length} questions`);
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      await quizAPI.attempt(id, formattedAnswers);
      toast.success('✅ Quiz submitted successfully!');
      navigate(`/courses/${quiz.courseId}`);
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner"></div>
        <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div style={styles.loading}>
        <h2 style={{ color: '#ccd6f6' }}>No questions available</h2>
        <button onClick={() => navigate('/courses')} style={styles.backBtn}>← Back to Courses</button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Quiz Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{quiz.title}</h1>
          <div style={styles.quizMeta}>
            <span style={styles.metaItem}>❓ {questions.length} Questions</span>
            <span style={styles.metaItem}>✅ Passing: {quiz.passingScore}%</span>
            <span style={styles.metaItem}>Question {currentQuestion + 1} of {questions.length}</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${progress}%`}}></div>
          </div>
        </div>

        {/* Question Card */}
        <div style={styles.questionCard}>
          <h2 style={styles.questionTitle}>
            <span style={styles.questionNumber}>Q{currentQuestion + 1}</span>
            {question.questionText}
          </h2>

          <div style={styles.options}>
            {['A', 'B', 'C', 'D'].map((option) => {
              const optionText = question[`option${option}`];
              if (!optionText) return null;

              const isSelected = answers[question.id] === option;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(question.id, option)}
                  style={isSelected ? styles.optionSelected : styles.option}
                >
                  <span style={styles.optionLetter}>{option}</span>
                  <span style={styles.optionText}>{optionText}</span>
                  {isSelected && <span style={styles.checkmark}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            style={currentQuestion === 0 ? styles.navBtnDisabled : styles.navBtn}
          >
            ← Previous
          </button>

          <div style={styles.questionDots}>
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                style={
                  index === currentQuestion ? styles.dotActive :
                  answers[questions[index].id] ? styles.dotAnswered :
                  styles.dot
                }
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={styles.submitBtn}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              style={styles.navBtn}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f' },
  loading: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', gap: '1rem' },
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  header: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' },
  title: { fontSize: '2rem', color: '#ccd6f6', margin: '0 0 1rem 0' },
  quizMeta: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  metaItem: { fontSize: '0.9rem', color: '#8892b0' },
  progressBar: { width: '100%', height: '8px', background: '#0f0f1e', borderRadius: '4px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', transition: 'width 0.3s ease' },
  questionCard: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' },
  questionTitle: { fontSize: '1.5rem', color: '#ccd6f6', margin: '0 0 2rem 0', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '1rem' },
  questionNumber: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '48px', height: '48px', background: '#667eea', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 },
  options: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  option: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#0f0f1e', border: '2px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontSize: '1rem' },
  optionSelected: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(102, 126, 234, 0.1)', border: '2px solid #667eea', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontSize: '1rem' },
  optionLetter: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#667eea', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 'bold', color: 'white', flexShrink: 0 },
  optionText: { flex: 1, color: '#ccd6f6' },
  checkmark: { fontSize: '1.5rem', color: '#10b981' },
  navigation: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  navBtn: { padding: '0.875rem 1.5rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
  navBtnDisabled: { padding: '0.875rem 1.5rem', background: '#0f0f1e', border: 'none', color: '#495670', cursor: 'not-allowed', borderRadius: '8px', fontSize: '1rem' },
  submitBtn: { padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
  questionDots: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  dot: { width: '36px', height: '36px', background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#8892b0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dotAnswered: { width: '36px', height: '36px', background: 'rgba(100, 255, 218, 0.1)', border: '1px solid #64ffda', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#64ffda', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dotActive: { width: '36px', height: '36px', background: '#667eea', border: '1px solid #667eea', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  backBtn: { padding: '1rem 2rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', marginTop: '1rem' },
};

export default TakeQuiz;