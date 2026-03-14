import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaderboardAPI } from '../api/api';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allTimeBoard, setAllTimeBoard] = useState([]);
  const [weeklyBoard, setWeeklyBoard] = useState([]);
  const [activeTab, setActiveTab] = useState('all-time');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const [allTimeRes, weeklyRes] = await Promise.all([
        leaderboardAPI.getAllTime(20),
        leaderboardAPI.getWeekly(20),
      ]);
      
      setAllTimeBoard(allTimeRes.data.leaderboard || []);
      setWeeklyBoard(weeklyRes.data.leaderboard || []);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#667eea';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const currentBoard = activeTab === 'all-time' ? allTimeBoard : weeklyBoard;
  const myRank = currentBoard.findIndex(entry => entry.userId === user?.id) + 1;

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
            <button onClick={() => navigate('/courses')} style={styles.navLink}>Courses</button>
            <button onClick={() => navigate('/leaderboard')} style={styles.navLinkActive}>Leaderboard</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏆 Leaderboard</h1>
          <p style={styles.subtitle}>See how you rank among top learners</p>
        </div>

        {/* My Rank Card */}
        {myRank > 0 && (
          <div style={styles.myRankCard}>
            <div style={styles.myRankContent}>
              <div style={styles.myRankLabel}>Your Rank</div>
              <div style={styles.myRankNumber}>#{myRank}</div>
            </div>
            <div style={styles.myRankContent}>
              <div style={styles.myRankLabel}>Your Points</div>
              <div style={styles.myRankPoints}>{user?.totalPoints}</div>
            </div>
            <div style={styles.myRankContent}>
              <div style={styles.myRankLabel}>Your Level</div>
              <div style={styles.myRankLevel}>Level {user?.level}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button 
            onClick={() => setActiveTab('all-time')} 
            style={activeTab === 'all-time' ? styles.tabActive : styles.tab}
          >
            🏆 All-Time
          </button>
          <button 
            onClick={() => setActiveTab('weekly')} 
            style={activeTab === 'weekly' ? styles.tabActive : styles.tab}
          >
            📅 This Week
          </button>
        </div>

        {/* Leaderboard */}
        <div style={styles.boardContainer}>
          {loading ? (
            <div style={styles.loading}>
              <div className="spinner"></div>
              <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading leaderboard...</p>
            </div>
          ) : currentBoard.length === 0 ? (
            <p style={{ color: '#8892b0', textAlign: 'center', padding: '3rem' }}>No data yet</p>
          ) : (
            <div style={styles.board}>
              {currentBoard.map((entry, index) => (
                <div 
                  key={entry.userId} 
                  style={{
                    ...styles.boardItem,
                    ...(entry.userId === user?.id ? styles.boardItemHighlight : {})
                  }}
                >
                  <div style={styles.rankSection}>
                    <div style={{...styles.rankBadge, background: getRankColor(entry.rank)}}>
                      {getRankMedal(entry.rank) || `#${entry.rank}`}
                    </div>
                  </div>

                  <div style={styles.userSection}>
                    <div style={styles.avatar}>
                      {entry.fullName?.charAt(0)}
                    </div>
                    <div>
                      <div style={styles.userName}>{entry.fullName}</div>
                      <div style={styles.userLevel}>Level {entry.level}</div>
                    </div>
                  </div>

                  <div style={styles.pointsSection}>
                    <div style={styles.points}>{entry.totalPoints?.toLocaleString()}</div>
                    <div style={styles.pointsLabel}>points</div>
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
  navContent: { maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  navLinkActive: { padding: '0.5rem 1rem', background: 'rgba(100, 255, 218, 0.1)', border: 'none', color: '#64ffda', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' },
  content: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { marginBottom: '2rem', textAlign: 'center' },
  title: { fontSize: '2.5rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1.1rem', color: '#8892b0', margin: 0 },
  myRankCard: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' },
  myRankContent: { textAlign: 'center' },
  myRankLabel: { fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' },
  myRankNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: 'white' },
  myRankPoints: { fontSize: '2rem', fontWeight: 'bold', color: 'white' },
  myRankLevel: { fontSize: '1.5rem', fontWeight: 'bold', color: 'white' },
  tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tab: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid transparent' },
  tabActive: { padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: '#64ffda', cursor: 'pointer', fontSize: '1rem', borderBottom: '2px solid #64ffda' },
  boardContainer: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' },
  board: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  boardItem: { background: '#0f0f1e', borderRadius: '8px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' },
  boardItemHighlight: { background: 'rgba(102, 126, 234, 0.1)', border: '1px solid #667eea' },
  rankSection: { minWidth: '80px' },
  rankBadge: { width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white' },
  userSection: { flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: '600' },
  userName: { fontSize: '1.125rem', color: '#ccd6f6', fontWeight: '500' },
  userLevel: { fontSize: '0.875rem', color: '#8892b0' },
  pointsSection: { textAlign: 'right', minWidth: '120px' },
  points: { fontSize: '1.5rem', fontWeight: 'bold', color: '#64ffda' },
  pointsLabel: { fontSize: '0.75rem', color: '#8892b0', textTransform: 'uppercase' },
};

export default Leaderboard;