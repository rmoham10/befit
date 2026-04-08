import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyPhone() {
  const { state } = useLocation();
  const phone = state?.phone;
  const navigate = useNavigate();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30); // 30 sec cooldown
  const [canResend, setCanResend] = useState(false);
  const [stepStatus, setStepStatus] = useState({
    email: 'done',
    phone: 'pending',
  });

  const refs = useRef([]);

  const [timeLeft, setTimeLeft] = useState(5 * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ── Handle resend cooldown ─────────────────────────────
   useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const cooldownTimer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(cooldownTimer);
  }, [resendCooldown]);

  // ── Input handlers ─────────────────────────────────────
  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  // ── Verify OTP ─────────────────────────────────────────
  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) return setError('Enter all 6 digits');
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp });
      setStepStatus(prev => ({ ...prev, phone: 'done' }));
      localStorage.setItem('quicksign_token', data.token);
      localStorage.setItem('quicksign_user', JSON.stringify(data.user));

      // Redirect based on role
      setTimeout(() => {
        const role = data.user?.role;
        if (role === 'Admin') navigate('/admin-dashboard');
        else if (role === 'Employee') navigate('/employee-dashboard');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    try {
      await api.post('/auth/send-otp', { phone });
      setResendMsg('New code sent!');
      setResendCooldown(45); // reset cooldown
      setTimeLeft(5 * 60); // reset OTP timer
      setTimeout(() => setResendMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend');
    }
  };

  // ── Convert seconds to mm:ss ─────────────────
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };


  // ── Change phone ───────────────────────────────────────
  const handleChangePhone = async () => {
    const newPhone = prompt('Enter the correct phone number:');
    if (!newPhone) return;
    try {
      await api.put('/auth/change-phone', { oldPhone: phone, newPhone });
      navigate('/verify-phone', { state: { phone: newPhone } });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update phone');
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="logo"><Link to="/">QuickSign</Link></div>
      </header>

      {/* ================= VERIFY PHONE FORM ================= */}
      <div className="page">
        <div className="card">
          <h2 className="title">Verify your phone</h2>
          <p className="sub">
            We sent a 6-digit code to <strong>{phone}</strong>
          </p>

          {/* Steps */}
          <div className="steps">
            <div className="step">
              <div className={`stepNum ${stepStatus.email === 'done' ? 'done' : ''}`}>
                {stepStatus.email === 'done' ? '✓' : '1'}
              </div>
              <span className="stepLabel">Email verified ✅</span>
            </div>
            <div className="step">
              <div className={`stepNum ${stepStatus.phone === 'done' ? 'done' : ''}`}>
                {stepStatus.phone === 'done' ? '✓' : '2'}
              </div>
              <span className="stepLabel">
                {stepStatus.phone === 'done' ? 'Phone verified ✅' : 'Verify phone'}
              </span>
            </div>
          </div>

          {/* OTP Inputs */}
          <div className="otpRow">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                className="otpBox"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                inputMode="numeric"
              />
            ))}
          </div>
          
          <p className="timer">
            OTP expires in: <strong>{formatTime(timeLeft)}</strong>
          </p>

          {error && <p className="error">{error}</p>}
          {resendMsg && <p className="success">{resendMsg}</p>}

          <button className="btn" onClick={handleVerify} disabled={loading || stepStatus.phone === 'done'}>
            {loading ? 'Verifying…' : stepStatus.phone === 'done' ? 'Verified' : 'Verify'}
          </button>

          <p className="resend">
            Didn't receive it?{' '}

            {canResend ? (
              <span className="link" onClick={handleResend}>
                Resend otp
              </span>
            ) : (
              <span className="cooldown">
                Resend available in {resendCooldown}s
              </span>
            )}
          </p>

          <p className="change">
            Wrong number?{' '}
            <span className="link" onClick={handleChangePhone}>
              Change phone
            </span>
          </p>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <h3>QuickSign</h3>
        <p>Fast • Secure • Modern User Management</p>
      </footer>
      <p className="copyright">
          © {new Date().getFullYear()} QuickSign. All rights reserved.
      </p>

      {/* ================= CSS ================= */}
      <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:Poppins,sans-serif;}
        .header{
          position: fixed;
          top: 0;
          width: 100%;

          display: flex;
          justify-content: flex-start; /* push content to left */
          align-items: center;         /* vertical center */

          padding: 18px 40px; /* remove big left padding */

          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          z-index: 1000;
        }
        .logo a{color:white;font-size:26px;font-weight:bold;text-decoration:none;}
        .page{min-height:100vh;display:flex;justify-content:center;align-items:center;padding-top:50px;background:linear-gradient(135deg,#7c3aed,#ff006e);}
        .card{background: linear-gradient(135deg,#0f2027,#203a43,#2c5364);backdrop-filter: blur(10px);padding:40px;border-radius:20px;width:100%;max-width:420px;text-align:center;box-shadow:0 15px 40px rgba(0,0,0,0.2);}
        .title{color:white;font-size:1.8rem;margin-bottom:16px;font-weight:700;}
        .sub{color:white;font-size:14px;margin-bottom:16px;line-height:1.5;}
        .steps{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;text-align:left;}
        .step{display:flex;align-items:center;gap:12px;}
        .stepNum{width:26px;height:26px;border-radius:50%;background:#534AB7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;}
        .stepNum.done{background:#16a34a;}
        .stepLabel{color:white;font-size:13px;}
        .otpRow{display:flex;gap:10px;justify-content:center;margin-bottom:16px;}
        .otpBox{width:44px;height:52px;text-align:center;font-size:22px;font-weight:600;border-radius:12px;border:none;outline:none;background: rgba(255,255,255,0.25); color:#fff;box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);}
        .btn{width:100%;padding:12px;border:none;border-radius:12px;font-size:16px;font-weight:700;background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);color:white;cursor:pointer;margin-bottom:16px;transition: all 0.3s ease;}
        .btn:hover{transform: scale(1.05);background:linear-gradient(135deg,#7c3aed,#ff006e);}
        .error{color:#ff6b6b;font-size:13px;margin-bottom:12px;}
        .success{color:#16a34a;font-size:13px;margin-bottom:12px;}
        .resend{font-size:13px;color:white;text-align:center;margin-bottom:10px;}
        .timer {
          color: #ffd;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .cooldown {
          color: #aaa;
          font-size: 13px;
        }

        .link:hover {
          color: #ff006e;
        }
        
        .copyright{
          margin-top:10px;
          margin-bottom: 5px;
          font-size:13px;
          color:rgba(255,255,255,0.6);
        }

        .link{color:#7c3aed;cursor:pointer;font-weight:700;}
        .link.disabled{color:rgba(255,255,255,0.5);cursor:not-allowed;}
        .change{font-size:13px;color:white;text-align:center;margin-bottom:10px;}
        .footer{padding:40px;background:black;color:white;text-align:center;}
      `}</style>
    </>
  );
}