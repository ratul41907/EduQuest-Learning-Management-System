import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('student@test.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
            <span style={styles.logoText}>EduQuest</span>
          </div>
          <p style={styles.subtitle}>Enterprise Learning Management System</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.loginButton} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={styles.demoAccounts}>
          <p style={styles.demoTitle}>Demo Accounts</p>
          <div style={styles.demoList}>
            <button 
              onClick={() => { setEmail('student@test.com'); setPassword('password123'); }}
              style={styles.demoBadge}
            >
              👨‍🎓 Student
            </button>
            <button 
              onClick={() => { setEmail('instructor@test.com'); setPassword('password123'); }}
              style={styles.demoBadge}
            >
              👨‍🏫 Instructor
            </button>
            <button 
              onClick={() => { setEmail('admin@test.com'); setPassword('password123'); }}
              style={styles.demoBadge}
            >
              👨‍💼 Admin
            </button>
          </div>
          <p style={styles.demoPassword}>Password: password123</p>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>© 2026 EduQuest. Enterprise Edition.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
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
  header: {
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
  subtitle: {
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
  demoAccounts: {
    background: 'rgba(100, 255, 218, 0.05)',
    border: '1px solid rgba(100, 255, 218, 0.2)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  demoTitle: {
    color: '#64ffda',
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: '0 0 0.75rem 0',
  },
  demoList: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  demoBadge: {
    padding: '0.5rem 1rem',
    background: 'rgba(102, 126, 234, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '8px',
    color: '#a8b2d1',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  demoPassword: {
    color: '#8892b0',
    fontSize: '0.8rem',
    margin: 0,
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: '3rem',
    textAlign: 'center',
  },
  footerText: {
    color: '#495670',
    fontSize: '0.875rem',
  },
};

export default Login;