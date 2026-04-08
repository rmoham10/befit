import { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = state?.email;
  const phone = state?.phone;

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendError, setResendError] = useState('');
  const [stepStatus, setStepStatus] = useState({ email: 'pending', phone: 'pending' });

  const [changeEmailMode, setChangeEmailMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changeMsg, setChangeMsg] = useState('');
  const [changeError, setChangeError] = useState('');

  const hasRun = useRef(false);

  // ── Cooldown state ─────────────────────────────
  const COOLDOWN_TIME = 180; // 3 minutes in seconds
  const [cooldown, setCooldown] = useState(0);

  // Load cooldown from localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem('emailCooldown');
    if (savedTime) {
      const remaining = Math.floor((savedTime - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          localStorage.removeItem('emailCooldown');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Start cooldown function
  const startCooldown = () => {
    const expiryTime = Date.now() + COOLDOWN_TIME * 1000;
    localStorage.setItem('emailCooldown', expiryTime);
    setCooldown(COOLDOWN_TIME);
  };

  // ── Handle token callback ────────────────────────────────
  useEffect(() => {
    if (!token || hasRun.current) return;
    hasRun.current = true;
    setStatus('loading');

    api.get(`/auth/verify-auth-email?token=${token}`)
      .then(async (res) => {
        setStatus('success');
        setMessage(res.data.message);
        setStepStatus(prev => ({ ...prev, email: 'done' }));

        const userPhone = phone || res.data.phone;
        if (userPhone) {
          try {
            await api.post('/auth/send-otp', { phone: userPhone });
            setStepStatus(prev => ({ ...prev, phone: 'pending' }));
            setTimeout(() => navigate('/verify-phone', { state: { phone: userPhone } }), 1500);
          } catch {
            setStepStatus(prev => ({ ...prev, phone: 'pending' }));
          }
        } else {
          setTimeout(() => navigate('/signin'), 2500);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  // ── Poll email verification (for refresh) ──
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!email || stepStatus.email === 'done') return;
      try {
        const { data } = await api.post('/auth/check-email-verified', { email });
        if (data.verified) setStepStatus(prev => ({ ...prev, email: 'done' }));
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [email, stepStatus.email]);

  // ── Resend email handler ───────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || !email) return; // prevent action during cooldown
    setResendError('');
    setResendMsg('');
    setResendLoading(true);

    try {
      await api.post('/auth/resend-email-verification', { email });
      setResendMsg('A new verification link has been sent — check your inbox!');
      startCooldown(); // start cooldown after click
    } catch (err) {
      setResendError(err.response?.data?.error || 'Could not resend. Try again shortly.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Change email handler ───────────────────────────────
  const handleChangeEmail = async () => {
    if (cooldown > 0) return; // prevent change during cooldown
    setChangeMsg('');
    setChangeError('');
    if (!newEmail) return setChangeError('Enter a new email');

    try {
      await api.put('/auth/change-email', { oldEmail: email, newEmail });
      setChangeMsg('Email updated! Check your new inbox to verify.');
      setResendMsg('');
      setStepStatus(prev => ({ ...prev, email: 'pending' }));
      setChangeEmailMode(false);
      startCooldown(); // start cooldown after change
    } catch (err) {
      setChangeError(err.response?.data?.error || 'Could not update email.');
    }
  };

  const steps = [
    { key: 'email', label: 'Verify email — click the link in your inbox' },
    { key: 'phone', label: 'Verify phone — enter the SMS code' },
    { key: 'dashboard', label: "You're in — access your dashboard" },
  ];

  return (
    <>
      <Header />
      <div className="page">
        <div className="card">
          {token ? (
            <>
              {status === 'loading' && (
                <>
                  <div className="spinnerWrap"><div className="spinner" /></div>
                  <h2 className="title">Verifying your email…</h2>
                  <p className="sub">Just a moment, please.</p>
                </>
              )}
              {status === 'success' && (
                <>
                  <div className="iconCircle success">✓</div>
                  <h2 className="title">Email verified!</h2>
                  <p className="sub">{message}</p>
                  <p className="sub small">{phone ? 'Redirecting to phone verification…' : 'Redirecting to sign in…'}</p>
                </>
              )}
              {status === 'error' && (
                <>
                  <div className="iconCircle error">✕</div>
                  <h2 className="title">Verification failed</h2>
                  <p className="sub">{message}</p>
                  <button className="btn" onClick={() => setChangeEmailMode(true)} disabled={cooldown > 0}>
                    Change Email
                  </button>
                  {cooldown > 0 && <p className="sub small">Wait {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2,'0')} before retrying</p>}
                </>
              )}
            </>
          ) : (
            <>
              <div className="envelope">✉️</div>
              <h2 className="title">Check your email</h2>
              <p className="sub">
                We sent a verification link to <strong>{email || 'your email address'}</strong>.<br />
                Click the link to verify and continue.
              </p>

              {/* Steps */}
              <div className="steps">
                {steps.map(step => (
                  <div key={step.key} className="step">
                    <div className={`stepNum ${stepStatus[step.key] === 'done' ? 'done' : ''}`}>
                      {stepStatus[step.key] === 'done' ? '✓' : step.key === 'dashboard' ? '…' : step.key === 'email' ? '1' : '2'}
                    </div>
                    <span className="stepLabel">
                      {stepStatus[step.key] === 'done'
                        ? step.key === 'email' ? 'Email verified ✅' : step.key === 'phone' ? 'Phone verified ✅' : step.label
                        : step.label
                      }
                    </span>
                  </div>
                ))}
              </div>

              {/* Resend / Change Email only if email pending */}
              {stepStatus.email !== 'done' && !changeEmailMode && (
                <>
                  <hr className="divider" />
                  <p className="resendText">Didn't receive the email?</p>
                  {resendMsg && <p className="successMsg">{resendMsg}</p>}
                  {resendError && <p className="errorMsg">{resendError}</p>}
                  <button className="btn" onClick={handleResend} disabled={resendLoading || !email || cooldown > 0}>
                    {resendLoading ? 'Sending…' : cooldown > 0 ? `Wait ${Math.floor(cooldown/60)}:${String(cooldown%60).padStart(2,'0')}` : 'Resend verification email'}
                  </button>
                  <p className="footer-text">
                    Wrong email?{' '}
                    <span className="link clickable" onClick={() => setChangeEmailMode(true)} style={{ pointerEvents: cooldown>0 ? 'none' : 'auto', opacity: cooldown>0 ? 0.6 : 1 }}>
                      Change Email
                    </span>
                  </p>
                </>
              )}

              {/* Change Email Form */}
              {changeEmailMode && (
                <div className="changeForm">
                  <input
                    type="email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="changeInput"
                  />
                  {changeMsg && <p className="successMsg">{changeMsg}</p>}
                  {changeError && <p className="errorMsg">{changeError}</p>}

                  <div className="changeBtns">
                    <button className="btn primaryBtn" onClick={handleChangeEmail} disabled={cooldown>0}>
                      Update Email {cooldown>0 && `(${Math.floor(cooldown/60)}:${String(cooldown%60).padStart(2,'0')})`}
                    </button>
                    <button className="btn cancelBtn" onClick={() => setChangeEmailMode(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
      <Styles />
    </>
  );
}

// ── HEADER & FOOTER ─────────────────────────────────────
function Header() {
  return (
    <header className="header">
      <div className="logo"><Link to="/">QuickSign</Link></div>
      <nav>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
        </ul>
      </nav>
    </header>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <h3>QuickSign</h3>
      <p>Fast • Secure • Modern User Management</p>
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <p className="copyright">
          © {new Date().getFullYear()} QuickSign. All rights reserved.
      </p>
    </footer>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
      *{margin:0; padding:0; box-sizing:border-box; font-family:Poppins,sans-serif;}

      .page{
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        padding-top:80px;
        background:linear-gradient(135deg,#7c3aed,#ff006e);
      }

      .card{
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        backdrop-filter: blur(10px);
        padding: 40px;
        border-radius: 20px;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(0, 0, 0, 0.1);
        text-align:center;
      }

      .title{ color:white; font-size:1.8rem; margin-bottom:16px; font-weight:700; }
      .sub{ color:white; font-size:14px; margin-bottom:16px; line-height:1.5; }
      .sub.small{ font-size:12px; color:#aaa; }
      .envelope{ font-size:52px; margin-bottom:16px; }

      .steps{ text-align:left; background:rgba(255,255,255,0.1); border-radius:12px; padding:16px 20px; margin-bottom:24px; display:flex; flex-direction:column; gap:12px; }
      .step{ display:flex; align-items:center; gap:12px; }
      .stepNum{ width:26px; height:26px; border-radius:50%; background:#534AB7; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; }
      .stepNum.done{ background:#16a34a; }
      .stepLabel{ font-size:13px; color:white; }

      .divider{ border:none; border-top:1px solid rgba(255,255,255,0.2); margin:0 0 20px; }

      .resendText{ font-size:13px; color:#ccc; margin-bottom:10px; }
      .successMsg{ color:#16a34a; font-size:13px; margin-bottom:10px; }
      .errorMsg{ color:#dc2626; font-size:13px; margin-bottom:10px; }

      .btn{ width:100%; padding:12px; border:none; border-radius:12px; font-size:14px; font-weight:700; background:linear-gradient(135deg,#7c3aed,#ff006e); color:white; cursor:pointer; transition: all 0.3s ease; }
      .btn:hover{ transform: scale(1.05); }

      .iconCircle{ width:56px; height:56px; border-radius:50%; font-size:24px; font-weight:700; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
      .iconCircle.success{ background:#d1fae5; color:#10b981; }
      .iconCircle.error{ background:#fee2e2; color:#ef4444; }

      .footer-text{ text-align:center; margin-top:20px; font-size:14px; color:white; }
      .footer-text a{ color:#7c3aed; font-weight:700; text-decoration:none; }
      .footer-text a:hover{ color:#ff006e; }

      /* Spinner */
      .spinnerWrap{ display:flex; justify-content:center; margin-bottom:20px; }
      .spinner{ width:40px; height:40px; border:3px solid rgba(255,255,255,0.2); border-top:3px solid #fff; border-radius:50%; animation:spin 0.8s linear infinite; }
      @keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}

      /* Header & footer */
      .header{
        position:fixed;
        top:0;
        width:100%;
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:13px 40px;
        background:rgba(0,0,0,0.5);
        backdrop-filter:blur(10px);
        z-index:1000;
      }
      .logo a{ color:white; font-size:26px; font-weight:bold; text-decoration:none; }
      .nav-links{ display:flex; gap:30px; list-style:none; align-items:center; }
      .nav-links a{ color:white; text-decoration:none; font-weight:500; }
      .signup-btn { padding:8px 18px; border-radius:30px; background: linear-gradient(90deg,#7c3aed,#ff006e); color:white; display:inline-block; }
      .signup-btn:hover{ transform:scale(1.1); }

      .link.clickable {
        color: #7c3aed;       /* initial color */
        font-weight: 700;
        cursor: pointer;       /* shows pointer on hover */
        text-decoration: none; /* makes it obvious it’s clickable */
        transition: color 0.3s ease, transform 0.2s ease;
      }

      .link.clickable:hover {
        color: #ff006e;       /* change color on hover */
        transform: scale(1.05); /* slight scale for feedback */
      }

      .changeForm {
        display: flex;
        flex-direction: column;
        gap: 16px; /* space between input and buttons */
        margin-top: 16px;
      }

      .changeInput {
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid #ccc;
        font-size: 16px; /* slightly bigger text */
      }

      .changeBtns {
        display: flex;
        gap: 12px; /* space between buttons */
      }

      .primaryBtn {
        background: linear-gradient(135deg,#7c3aed,#ff006e);
        color: white;
        font-size: 15px;
        font-weight: 700;
        flex: 1;
        transition: all 0.3s ease;
      }
      .primaryBtn:hover {
        background: linear-gradient(135deg,#ff006e,#7c3aed);
        transform: scale(1.05);
      }

      .cancelBtn {
        background: #ccc;
        color: #333;
        font-size: 15px;
        font-weight: 700;
        flex: 1;
        transition: all 0.3s ease;
      }
      .cancelBtn:hover {
        background: #999;
        transform: scale(1.05);
      }

      .footer{ padding:40px; background:black; color:white; text-align:center; }
      .footer-links{ display:flex; justify-content:center; gap:20px; margin-top:10px; }
      .footer-links a{ color:white; text-decoration:none; }
      .footer-links a:hover{ color:rgba(200,200,200,0.7); }

      .copyright{
        margin-top:10px;
        margin-bottom: 5px;
        font-size:13px;
        color:rgba(255,255,255,0.6);
      }
    `}</style>
  );
}