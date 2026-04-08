import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PageWrapper from './PageWrapper';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('overview'); // 'overview' | 'users' | 'create'
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Create account form
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'Employee' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => { localStorage.clear(); navigate('/signin'); });
      loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/auth/admin/users');
      setUsers(res.data);
    } catch { showMsg('Failed to load users', 'error'); }
    finally { setUsersLoading(false); }
  };

  const handleNavClick = (v) => {
    setView(v);
    if (v === 'users') loadUsers();
  };

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.full_name || !form.email || !form.password || !form.phone)
      return setFormError('All fields are required');
    if (form.password.length < 8)
      return setFormError('Password must be at least 8 characters');

    setFormLoading(true);
    try {
      await api.post('/auth/admin/create-account', form);
      showMsg(`${form.role} account created successfully!`);
      setForm({ full_name: '', email: '', password: '', phone: '', role: 'Employee' });
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete account for "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/admin/users/${id}`);
      setUsers(u => u.filter(x => x.id !== id));
      showMsg('User deleted');
    } catch (err) {
      showMsg(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleSignout = () => { localStorage.clear(); navigate('/signin'); };

  if (!user) return <div style={S.loading}>Loading…</div>;

  const roleCounts = users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {});

  return (
    <PageWrapper>
      <div style={S.layout}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <div style={S.sidebarHeader}>
            <div style={S.logo}>QuickSign</div>
            <div style={S.adminBadge}>ADMIN</div>
          </div>
          <nav style={S.nav}>
            {[
              { id: 'overview', icon: '📊', label: 'Overview' },
              { id: 'users',    icon: '👥', label: 'All Users' },
              { id: 'create',   icon: '➕', label: 'Create Account' },
            ].map(item => (
              <button
                key={item.id}
                style={{ ...S.navItem, ...(view === item.id ? S.navItemActive : {}) }}
                onClick={() => handleNavClick(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={S.sidebarFooter}>
            <div style={S.adminInfo}>
              <div style={S.adminAvatar}>{user.full_name?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.full_name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{user.email}</div>
              </div>
            </div>
            <button style={S.signoutBtn} onClick={handleSignout}>Sign out</button>
          </div>
        </aside>

        {/* Main content */}
        <main style={S.main}>
          {/* Global message */}
          {msg.text && (
            <div style={{ ...S.toast, background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4', borderColor: msg.type === 'error' ? '#fca5a5' : '#86efac', color: msg.type === 'error' ? '#dc2626' : '#16a34a' }}>
              {msg.text}
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {view === 'overview' && (
            <div>
              <h1 style={S.pageTitle}>Admin Overview</h1>
              <p style={S.pageSubtitle}>Welcome back, {user.full_name}</p>

              <div style={S.statsGrid}>
                {[
                  { label: 'Total Users', value: users.length || '—', icon: '👥', color: '#534AB7' },
                  { label: 'Employees',   value: roleCounts['Employee'] ?? '—', icon: '👔', color: '#0ea573' },
                  { label: 'Admins',      value: roleCounts['Admin'] ?? '—',    icon: '🛡️', color: '#f59e0b' },
                  { label: 'Members',     value: roleCounts['User'] ?? '—',     icon: '🏋️', color: '#3b82f6' },
                ].map(stat => (
                  <div key={stat.label} style={S.statCard}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                    <div style={{ ...S.statValue, color: stat.color }}>{stat.value}</div>
                    <div style={S.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={S.actionCards}>
                <div style={S.actionCard} onClick={() => handleNavClick('create')}>
                  <div style={S.actionIcon}>➕</div>
                  <div>
                    <div style={S.actionTitle}>Create Account</div>
                    <div style={S.actionDesc}>Add a new Employee or Admin</div>
                  </div>
                </div>
                <div style={S.actionCard} onClick={() => handleNavClick('users')}>
                  <div style={S.actionIcon}>👥</div>
                  <div>
                    <div style={S.actionTitle}>Manage Users</div>
                    <div style={S.actionDesc}>View and manage all accounts</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CREATE ACCOUNT ── */}
          {view === 'create' && (
            <div>
              <h1 style={S.pageTitle}>Create Account</h1>
              <p style={S.pageSubtitle}>Create an Employee or Admin account — no OTP verification needed</p>

              <div style={S.formCard}>
                <form onSubmit={handleCreateAccount}>
                  <div style={S.formGrid}>
                    <FormField label="Full Name">
                      <input style={S.input} placeholder="Jane Smith"
                        value={form.full_name}
                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                    </FormField>
                    <FormField label="Email">
                      <input style={S.input} type="email" placeholder="jane@bquicksign.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </FormField>
                    <FormField label="Phone">
                      <input style={S.input} placeholder="+1 555 000 0000"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </FormField>
                    <FormField label="Password">
                      <input style={S.input} type="password" placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                    </FormField>
                  </div>

                  <FormField label="Role">
                    <div style={S.roleSelect}>
                      {['Employee', 'Admin'].map(r => (
                        <label key={r} style={{ ...S.roleOption, ...(form.role === r ? S.roleOptionActive : {}) }}>
                          <input type="radio" name="role" value={r}
                            checked={form.role === r}
                            onChange={() => setForm(f => ({ ...f, role: r }))}
                            style={{ display: 'none' }} />
                          <span style={{ fontSize: 18 }}>{r === 'Employee' ? '👔' : '🛡️'}</span>
                          <span style={{ fontWeight: 600 }}>{r}</span>
                          <span style={{ fontSize: 11, color: '#888' }}>
                            {r === 'Employee' ? 'Staff access' : 'Full admin access'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FormField>

                  {formError && <p style={S.formError}>{formError}</p>}

                  <button style={S.submitBtn} type="submit" disabled={formLoading}>
                    {formLoading ? 'Creating account…' : `Create ${form.role} Account`}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── ALL USERS ── */}
          {view === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h1 style={S.pageTitle}>All Users</h1>
                  <p style={S.pageSubtitle}>{users.length} accounts total</p>
                </div>
                <button style={S.refreshBtn} onClick={loadUsers}>↻ Refresh</button>
              </div>

              {usersLoading ? (
                <div style={S.tableEmpty}>Loading users…</div>
              ) : users.length === 0 ? (
                <div style={S.tableEmpty}>No users found</div>
              ) : (
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr style={S.tableHead}>
                        {['Name', 'Email', 'Phone', 'Role', 'Email ✓', 'Phone ✓', 'Joined', 'Actions'].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} style={{ ...S.tr, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ ...S.miniAvatar, background: u.role === 'Admin' ? '#f59e0b' : u.role === 'Employee' ? '#0ea573' : '#534AB7' }}>
                                {u.full_name?.[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 500 }}>{u.full_name}</span>
                            </div>
                          </td>
                          <td style={S.td}>{u.email}</td>
                          <td style={S.td}>{u.phone}</td>
                          <td style={S.td}>
                            <span style={{ ...S.rolePill, background: u.role === 'Admin' ? '#fef3c7' : u.role === 'Employee' ? '#d1fae5' : '#ede9fe', color: u.role === 'Admin' ? '#b45309' : u.role === 'Employee' ? '#065f46' : '#4c1d95' }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span style={{ color: u.email_verified ? '#16a34a' : '#dc2626', fontSize: 12 }}>
                              {u.email_verified ? '✓ Yes' : '✗ No'}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span style={{ color: u.phone_verified ? '#16a34a' : '#dc2626', fontSize: 12 }}>
                              {u.phone_verified ? '✓ Yes' : '✗ No'}
                            </span>
                          </td>
                          <td style={S.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td style={S.td}>
                            {u.id !== user.id && (
                              <button style={S.deleteBtn} onClick={() => handleDeleteUser(u.id, u.full_name)}>
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </PageWrapper>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

const S = {
  loading:      { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui' },
  layout:       { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  sidebar:      { width: 240, background: '#1e1b4b', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader:{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo:         { fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
  adminBadge:   { marginTop: 4, display: 'inline-block', background: '#f59e0b', color: '#1a1a1a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.06em' },
  nav:          { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem:      { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 14, cursor: 'pointer', textAlign: 'left', width: '100%' },
  navItemActive:{ background: 'rgba(255,255,255,0.12)', color: '#fff' },
  sidebarFooter:{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  adminInfo:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  adminAvatar:  { width: 34, height: 34, borderRadius: '50%', background: '#534AB7', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  signoutBtn:   { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, fontSize: 12, cursor: 'pointer' },
  main:         { flex: 1, background: '#f5f5f3', padding: '36px 32px', overflowY: 'auto' },
  pageTitle:    { fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' },
  pageSubtitle: { fontSize: 14, color: '#888', margin: '0 0 28px' },
  toast:        { padding: '12px 16px', borderRadius: 10, border: '1px solid', fontSize: 13, marginBottom: 20 },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard:     { background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  statValue:    { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  statLabel:    { fontSize: 12, color: '#888', marginTop: 4 },
  actionCards:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  actionCard:   { background: '#fff', borderRadius: 14, padding: '20px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid transparent', transition: 'border-color 0.2s' },
  actionIcon:   { fontSize: 28 },
  actionTitle:  { fontSize: 15, fontWeight: 600, color: '#1a1a1a' },
  actionDesc:   { fontSize: 12, color: '#888', marginTop: 2 },
  formCard:     { background: '#fff', borderRadius: 16, padding: '28px', maxWidth: 620, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  formGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' },
  input:        { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  roleSelect:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  roleOption:   { display: 'flex', flexDirection: 'column', gap: 4, padding: '14px', borderRadius: 10, border: '2px solid #eee', cursor: 'pointer', alignItems: 'center', textAlign: 'center', transition: 'all 0.15s' },
  roleOptionActive:{ border: '2px solid #534AB7', background: '#f5f3ff' },
  formError:    { color: '#dc2626', fontSize: 13, marginBottom: 16 },
  submitBtn:    { width: '100%', padding: '12px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  tableWrap:    { background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  tableHead:    { background: '#f8f8f8' },
  th:           { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr:           { borderBottom: '1px solid #f0f0f0' },
  td:           { padding: '12px 14px', fontSize: 13 },
  tableEmpty:   { textAlign: 'center', padding: '40px', color: '#888', background: '#fff', borderRadius: 14 },
  miniAvatar:   { width: 28, height: 28, borderRadius: '50%', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rolePill:     { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  deleteBtn:    { padding: '4px 12px', background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  refreshBtn:   { padding: '8px 16px', background: '#fff', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#555' },
};
