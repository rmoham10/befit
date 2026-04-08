import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PageWrapper from './PageWrapper';

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me')
      .then(r => { setUser(r.data); setName(r.data.full_name); })
      .catch(() => { localStorage.clear(); navigate('/signin'); });
  }, []);

  const handleUpdate = async () => {
    try {
      await api.put('/auth/profile', { full_name: name });
      setUser(u => ({ ...u, full_name: name }));
      setEditing(false);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Update failed'); }
  };

  const handleSignout = () => { localStorage.clear(); navigate('/signin'); };

  if (!user) return <div style={styles.loading}>Loading…</div>;

  return (
    <>
      <header className="header">
        <div className="box">
          <div className="logo">
            <h1>QuickSign</h1>
          </div>
        </div>
      </header>

      {/* Inline CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap');

        * {
          margin: 0;
          padding: 0;
        }

        body {
          font-family: "Noto Serif", serif;
          color: rgb(173, 50, 50);
        }

        .header {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 22vh;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: white;
          background-image: url('/gymequip.jpeg');
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          border-bottom: 1px solid rgb(87, 5, 5);
          z-index: 1000;
        }

        .box {
          position: absolute;      
          top: 6.4vh;               
          left: 0;                 
          width: 110px;
          height: 110px;   
          background-color: rgb(231, 10, 10);
          padding: 10px;
          display: flex;
          align-items: flex-end;
        }

        .logo {
          display: flex;
          flex-direction: column;
          gap: 0rem;
        }

        .logo h1,
        .text_x1 {
          color: white;
          margin: 0;
        }
      `}</style>
      <div style={styles.page}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Employee Portal</h2>
              <p style={styles.subtitle}>QuickSign Staff Dashboard</p>
            </div>
            <button style={styles.signout} onClick={handleSignout}>Sign out</button>
          </div>

          {/* Role badge */}
          <div style={styles.roleBadge}>
            <span style={styles.badgeIcon}>👔</span>
            <span>EMPLOYEE</span>
          </div>

          {/* Profile section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>My Profile</h3>
            <div style={styles.field}>
              <span style={styles.label}>Full name</span>
              {editing
                ? <input style={styles.input} value={name} onChange={e => setName(e.target.value)} />
                : <span style={styles.value}>{user.full_name}</span>}
            </div>
            <div style={styles.field}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user.email}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.label}>Phone</span>
              <span style={styles.value}>{user.phone}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.label}>Role</span>
              <span style={{ ...styles.value, color: '#0ea573', fontWeight: 600 }}>{user.role}</span>
            </div>
            <div style={styles.field}>
              <span style={styles.label}>Member since</span>
              <span style={styles.value}>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>

            {msg && <p style={{ color: '#1D9E75', fontSize: 13, marginTop: 8 }}>{msg}</p>}

            <div style={styles.actions}>
              {editing
                ? <>
                    <button style={styles.btnPrimary} onClick={handleUpdate}>Save changes</button>
                    <button style={styles.btnGhost} onClick={() => setEditing(false)}>Cancel</button>
                  </>
                : <button style={styles.btnPrimary} onClick={() => setEditing(true)}>Edit profile</button>
              }
            </div>
          </div>

          {/* Quick links */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Quick Access</h3>
            <div style={styles.quickGrid}>
              {['📅 Schedule', '👥 Members', '📊 Reports', '💪 Classes'].map(item => (
                <div key={item} style={styles.quickCard}>
                  <span style={styles.quickText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const C = { purple: '#534AB7', green: '#0ea573', red: '#e24b4a', bg: '#f5f5f3', card: '#fff' };

const styles = {
  loading:     { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' },
  page:        { minHeight: '100vh', background: C.bg, fontFamily: 'system-ui, sans-serif', padding: '32px 16px', display: 'flex', justifyContent: 'center' },
  card:        { background: C.card, borderRadius: 20, padding: '32px', width: '100%', maxWidth: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', alignSelf: 'flex-start' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:       { margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a1a' },
  subtitle:    { margin: '4px 0 0', fontSize: 13, color: '#888' },
  signout:     { background: 'none', border: '1px solid #ddd', color: '#888', fontSize: 12, cursor: 'pointer', borderRadius: 8, padding: '6px 12px' },
  roleBadge:   { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e8f5f0', color: C.green, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', padding: '6px 14px', borderRadius: 20, marginBottom: 24 },
  badgeIcon:   { fontSize: 16 },
  section:     { borderTop: '1px solid #f0f0f0', paddingTop: 20, marginTop: 20 },
  sectionTitle:{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 },
  field:       { display: 'flex', flexDirection: 'column', marginBottom: 14 },
  label:       { fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 },
  value:       { fontSize: 14, color: '#1a1a1a' },
  input:       { fontSize: 14, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', outline: 'none' },
  actions:     { display: 'flex', gap: 10, marginTop: 16 },
  btnPrimary:  { padding: '10px 20px', background: C.green, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  btnGhost:    { padding: '10px 20px', background: 'none', color: C.green, border: `1px solid ${C.green}`, borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  quickGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  quickCard:   { background: '#f9f9fb', borderRadius: 12, padding: '16px', cursor: 'pointer', border: '1px solid #eee', transition: 'background 0.2s' },
  quickText:   { fontSize: 14, fontWeight: 500, color: '#333' },
};
