import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { certificateAPI } from '../api/api';
import toast from 'react-hot-toast';

const Certificates = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await certificateAPI.getMyCertificates();
      setCertificates(res.data.certificates || res.data || []);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certId) => {
    try {
      const res = await certificateAPI.download(certId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate downloaded!');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>🎓 EduQuest</h1>
          <div style={styles.navLinks}>
            <button onClick={() => navigate('/dashboard')} style={styles.navLink}>Dashboard</button>
            <button onClick={() => navigate('/certificates')} style={styles.navLinkActive}>Certificates</button>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>📜 My Certificates</h1>
          <p style={styles.subtitle}>You've earned {certificates.length} certificate(s)</p>
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div className="spinner"></div>
            <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={styles.emptyTitle}>No certificates yet</h3>
            <p style={styles.emptyText}>Complete courses to earn certificates!</p>
            <button onClick={() => navigate('/courses')} style={styles.browseBtn}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {certificates.map((cert) => (
              <div key={cert.id} style={styles.certCard}>
                <div style={styles.certIcon}>🏆</div>
                <h3 style={styles.certTitle}>{cert.course?.title || 'Course Certificate'}</h3>
                <p style={styles.certDate}>
                  Earned on {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
                <div style={styles.certFooter}>
                  <button onClick={() => handleDownload(cert.id)} style={styles.downloadBtn}>
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            ))}
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
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' },
  empty: { background: '#1a1a2e', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' },
  emptyTitle: { fontSize: '1.5rem', color: '#ccd6f6', margin: '0 0 0.5rem 0' },
  emptyText: { fontSize: '1rem', color: '#8892b0', margin: '0 0 2rem 0' },
  browseBtn: { padding: '1rem 2rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  certCard: { background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)', borderRadius: '12px', padding: '2rem', textAlign: 'center', border: '2px solid #667eea', position: 'relative', overflow: 'hidden' },
  certIcon: { fontSize: '4rem', marginBottom: '1rem' },
  certTitle: { fontSize: '1.25rem', color: '#ccd6f6', margin: '0 0 0.75rem 0', fontWeight: '600' },
  certDate: { fontSize: '0.875rem', color: '#8892b0', margin: '0 0 1.5rem 0' },
  certFooter: { paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' },
  downloadBtn: { padding: '0.75rem 1.5rem', background: '#667eea', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', width: '100%' },
};

export default Certificates;