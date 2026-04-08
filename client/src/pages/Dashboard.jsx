import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PageWrapper from './PageWrapper';

export default function Dashboard() {
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

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    await api.delete('/auth/account');
    localStorage.clear();
    navigate('/signup');
  };

  const handleSignout = () => { localStorage.clear(); navigate('/signin'); };

  if (!user) return <div style={styles.loading}>Loading…</div>;

  return (
    <>
      <header className="header">
        <div className="box">
          <div className="logo">
            <h1><QuickSign></QuickSign></h1>
          </div>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
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

        nav,
        .nav-links {
          display: flex;
        }

        .nav-links {
          margin-left: 1000px;
          margin-top: 150px;
          gap: 2rem;
          list-style: none;
          font-size: 1.5rem;
        }

        a {
          color: white;
          text-decoration: none;
        }

        a:hover {
          color: rgb(173, 166, 166);
        }
      `}</style>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.avatar}>{user.full_name[0].toUpperCase()}</div>
          <p style={styles.tier}>{user.tier.toUpperCase()} MEMBER</p>

          <div style={styles.field}>
            <span style={styles.label}>Full name</span>
            {editing
              ? <input style={styles.input} value={name} onChange={e => setName(e.target.value)} />
              : <span style={styles.value}>{user.full_name}</span>}
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{user.email}
              {user.email_verified
                ? <span style={styles.verified}> ✓ verified</span>
                : <span style={styles.unverified}> unverified</span>}
            </span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Phone</span>
            <span style={styles.value}>{user.phone}
              {user.phone_verified
                ? <span style={styles.verified}> ✓ verified</span>
                : <span style={styles.unverified}> unverified</span>}
            </span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Role</span>
            <span style={styles.value}>{user.role || 'User'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Member since</span>
            <span style={styles.value}>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>

          {msg && <p style={{ color: '#1D9E75', fontSize: 13, marginBottom: 12 }}>{msg}</p>}

          <div style={styles.actions}>
            {editing
              ? <>
                  <button style={styles.btnPrimary} onClick={handleUpdate}>Save changes</button>
                  <button style={styles.btnGhost} onClick={() => setEditing(false)}>Cancel</button>
                </>
              : <button style={styles.btnPrimary} onClick={() => setEditing(true)}>Edit profile</button>
            }
            <button style={styles.btnDanger} onClick={handleDelete}>Delete account</button>
            <button style={styles.signout} onClick={handleSignout}>Sign out</button>
          </div>
        </div>
      </div>
      </>
  );
}

const styles = {
  loading:   { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' },
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3', fontFamily: 'system-ui, sans-serif', padding: '32px 16px' },
  card:      { background: '#fff', borderRadius: 16, padding: '36px', width: '100%', maxWidth: 440, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  avatar:    { width: 64, height: 64, borderRadius: '50%', background: '#534AB7', color: '#fff', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  tier:      { textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#534AB7', letterSpacing: '0.08em', marginBottom: 24 },
  field:     { display: 'flex', flexDirection: 'column', marginBottom: 16 },
  label:     { fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  value:     { fontSize: 14, color: '#1a1a1a' },
  input:     { fontSize: 14, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', outline: 'none' },
  verified:  { color: '#1D9E75', fontSize: 12 },
  unverified:{ color: '#e24b4a', fontSize: 12 },
  actions:   { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 },
  btnPrimary:{ padding: '11px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnGhost:  { padding: '11px', background: 'none', color: '#534AB7', border: '1px solid #534AB7', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  btnDanger: { padding: '11px', background: 'none', color: '#e24b4a', border: '1px solid #e24b4a', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  signout:   { background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer' },
};
