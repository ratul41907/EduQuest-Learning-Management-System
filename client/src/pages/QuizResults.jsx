import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../api/api';
import toast from 'react-hot-toast';

const QuizResults = () => {
  const { attemptId } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const res = await quizAPI.getAttemptById(attemptId);
      setAttempt(res.data);
    } catch (error) {
      toast.error('Failed to load results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div className="spinner"></div>
        <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading results...</p>
      </div>
    );
  }

  if (!attempt) {
    return <div style={styles.loading}>Results not found</div>;
  }

  const passed = attempt.score >= attempt.quiz?.passingScore;
  const percentage = Math.round(attempt.score);

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Results Header */}
        <div style={passed ? styles.headerPassed : styles.headerFailed}>
          <div style={styles.resultIcon}>
            {passed ? '🎉' : '😢'}
          </div>
          <h1 style={styles.resultTitle}>
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </h1>
          <p style={styles.resultSubtitle}>
            {passed ? 'You passed the quiz!' : 'You didn\'t pass this time'}
          </p>
          
          <div style={styles.scoreCard}>
            <div style={styles.scoreCircle}>
              <div style={styles.scoreValue}>{percentage}%</div>
              <div style={styles.scoreLabel}>Your Score</div>
            </div>
          </div>

          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{attempt.quiz?.passingScore}%</div>
              <div style={styles.statLabel}>Passing Score</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{attempt.correctAnswers || 0}</div>
              <div style={styles.statLabel}>Correct Answers</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{attempt.quiz?.questions?.length || 0}</div>
              <div style={styles.statLabel}>Total Questions</div>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        {attempt.quiz?.questions && (
          <div style={styles.reviewSection}>
            <h2 style={styles.reviewTitle}>📝 Answer Review</h2>
            <div style={styles.questionsList}>
              {attempt.quiz.questions.map((question, index) => {
                const userAnswer = attempt.answers?.find(a => a.questionId === question.id)?.answer;
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} style={styles.questionCard}>
                    <div style={styles.questionHeader}>
                      <h3 style={styles.questionText}>
                        <span style={styles.questionNumber}>Q{index + 1}</span>
                        {question.questionText}
                      </h3>
                      <span style={isCorrect ? styles.correctBadge : styles.wrongBadge}>
                        {isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </span>
                    </div>

                    <div style={styles.answersGrid}>
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = question[`option${option}`];
                        if (!optionText) return null;

                        const isUserAnswer = userAnswer === option;
                        const isCorrectAnswer = question.correctAnswer === option;

                        let optionStyle = styles.option;
                        if (isCorrectAnswer) {
                          optionStyle = styles.optionCorrect;
                        } else if (isUserAnswer && !isCorrect) {
                          optionStyle = styles.optionWrong;
                        }

                        return (
                          <div key={option} style={optionStyle}>
                            <span style={styles.optionLetter}>{option}</span>
                            <span style={styles.optionText}>{optionText}</span>
                            {isCorrectAnswer && <span style={styles.correctMark}>✓ Correct</span>}
                            {isUserAnswer && !isCorrect && <span style={styles.yourMark}>Your answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={() => navigate(`/courses/${attempt.quiz?.courseId}`)} style={styles.backBtn}>
            ← Back to Course
          </button>
          {!passed && (
            <button onClick={() => navigate(`/quizzes/${attempt.quizId}`)} style={styles.retryBtn}>
              🔄 Retry Quiz
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} style={styles.dashboardBtn}>
            🏠 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f' },
  loading: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  navbar: { background: '#1a1a2e', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  headerPassed: { background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', border: '2px solid #10b981', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' },
  headerFailed: { background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)', border: '2px solid #ef4444', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' },
  resultIcon: { fontSize: '5rem', marginBottom: '1rem' },
  resultTitle: { fontSize: '2.5rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  resultSubtitle: { fontSize: '1.25rem', color: '#8892b0', margin: '0 0 2rem 0' },
  scoreCard: { marginBottom: '2rem' },
  scoreCircle: { display: 'inline-block', width: '180px', height: '180px', borderRadius: '50%', background: '#1a1a2e', border: '8px solid #667eea', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontSize: '3.5rem', fontWeight: 'bold', color: '#ccd6f6' },
  scoreLabel: { fontSize: '0.875rem', color: '#8892b0', textTransform: 'uppercase' },
  stats: { display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' },
  statItem: { textAlign: 'center' },
  statValue: { fontSize: '2rem', fontWeight: 'bold', color: '#ccd6f6' },
  statLabel: { fontSize: '0.875rem', color: '#8892b0', textTransform: 'uppercase' },
  reviewSection: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' },
  reviewTitle: { fontSize: '1.75rem', color: '#ccd6f6', margin: '0 0 1.5rem 0' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  questionCard: { background: '#0f0f1e', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' },
  questionText: { fontSize: '1.25rem', color: '#ccd6f6', margin: 0, display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 },
  questionNumber: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px', background: '#667eea', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 },
  correctBadge: { padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: '20px', color: '#10b981', fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap' },
  wrongBadge: { padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '20px', color: '#ef4444', fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap' },
  answersGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  option: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' },
  optionCorrect: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', borderRadius: '6px' },
  optionWrong: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444', borderRadius: '6px' },
  optionLetter: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#667eea', borderRadius: '50%', fontSize: '0.9rem', fontWeight: 'bold', color: 'white', flexShrink: 0 },
  optionText: { flex: 1, color: '#ccd6f6' },
  correctMark: { fontSize: '0.875rem', color: '#10b981', fontWeight: '600' },
  yourMark: { fontSize: '0.875rem', color: '#ef4444', fontWeight: '600' },
  actions: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  backBtn: { padding: '1rem 2rem', background: 'transparent', border: '1px solid #667eea', color: '#667eea', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
  retryBtn: { padding: '1rem 2rem', background: '#f59e0b', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
  dashboardBtn: { padding: '1rem 2rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
};

export default QuizResults;