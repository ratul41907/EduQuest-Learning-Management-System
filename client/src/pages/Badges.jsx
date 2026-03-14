import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { badgeAPI } from '../api/api';
import toast from 'react-hot-toast';

const Badges = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        badgeAPI.getAll(),
        badgeAPI.getMyBadges(),
      ]);
      
      setAllBadges(Array.isArray(allRes.data) ? allRes.data : []);
      setMyBadges(myRes.data.badges || []);
    } catch (error) {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const hasBadge = (badgeId) => {
    return myBadges.some(mb => mb.id === badgeId);
  };

  const getBadgeEmoji = (code) => {
    const emojiMap = {
      'FIRST_LESSON': '📖',
      'COURSE_FINISHER': '🏆',
      'FIRST_QUIZ': '❓',
      'QUIZ_MASTER': '🎯',
      'PERFECT_SCORE': '💯',
      'EARLY_BIRD': '🌅',
      'NIGHT_OWL': '🦉',
      'STREAK_7': '🔥',
      'STREAK_30': '⚡',
      'POINT_COLLECTOR': '💎',
    };
    return emojiMap[code] || '🎖️';
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
            <button onClick={() => navigate('/courses')} style={styles.navLink}>Courses</button>
            <button onClick={() => navigate('/badges')} style={styles.navLinkActive}>Badges</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎖️ Badges & Achievements</h1>
          <p style={styles.subtitle}>You've earned {myBadges.length} out of {allBadges.length} badges</p>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${(myBadges.length / allBadges.length) * 100}%`}}></div>
          </div>
          <p style={styles.progressText}>
            {Math.round((myBadges.length / allBadges.length) * 100)}% Complete
          </p>
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div style={styles.loading}>
            <div className="spinner"></div>
            <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading badges...</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {allBadges.map((badge) => {
              const earned = hasBadge(badge.id);
              const myBadge = myBadges.find(mb => mb.id === badge.id);

              return (
                <div 
                  key={badge.id} 
                  style={earned ? styles.badgeCardEarned : styles.badgeCard}
                >
                  <div style={styles.badgeIcon}>
                    <span style={{ fontSize: '3rem', filter: earned ? 'none' : 'grayscale(100%) opacity(0.3)' }}>
                      {getBadgeEmoji(badge.code)}
                    </span>
                  </div>
                  
                  <h3 style={styles.badgeName}>{badge.name}</h3>
                  <p style={styles.badgeDescription}>{badge.description}</p>
                  
                  <div style={styles.badgeFooter}>
                    <span style={styles.badgePoints}>+{badge.pointsBonus} pts</span>
                    {earned && myBadge?.awardedAt && (
                      <span style={styles.badgeDate}>
                        Earned {new Date(myBadge.awardedAt).toLocaleDateString()}
                      </span>
                    )}
                    {!earned && (
                      <span style={styles.badgeLocked}>🔒 Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
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
  header: { marginBottom: '2rem', textAlign: 'center' },
  title: { fontSize: '2.5rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  subtitle: { fontSize: '1.1rem', color: '#8892b0', margin: 0 },
  progressSection: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' },
  progressBar: { width: '100%', height: '12px', background: '#0f0f1e', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.75rem' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', transition: 'width 0.5s ease' },
  progressText: { textAlign: 'center', fontSize: '1rem', color: '#8892b0', margin: 0 },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  badgeCard: { background: '#1a1a2e', borderRadius: '12px', padding: '2rem', textAlign: 'center', border: '2px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' },
  badgeCardEarned: { background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', borderRadius: '12px', padding: '2rem', textAlign: 'center', border: '2px solid #667eea', transition: 'all 0.2s' },
  badgeIcon: { marginBottom: '1rem' },
  badgeName: { fontSize: '1.25rem', color: '#ccd6f6', margin: '0 0 0.75rem 0', fontWeight: '600' },
  badgeDescription: { fontSize: '0.9rem', color: '#8892b0', margin: '0 0 1.5rem 0', lineHeight: '1.5', minHeight: '3rem' },
  badgeFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' },
  badgePoints: { fontSize: '0.875rem', color: '#64ffda', fontWeight: '600' },
  badgeDate: { fontSize: '0.75rem', color: '#8892b0' },
  badgeLocked: { fontSize: '0.75rem', color: '#8892b0' },
};

export default Badges;