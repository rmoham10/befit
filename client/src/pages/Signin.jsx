import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Signin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signin', data);
      localStorage.setItem('quicksign_token', res.data.token);
      localStorage.setItem('quicksign_user', JSON.stringify(res.data.user));
      const role = res.data.user?.role;
      if (role === 'Admin') navigate('/admin-dashboard');
      else if (role === 'Employee') navigate('/employee-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      const e = err.response?.data;
      if (e?.needsEmailVerification) navigate('/verify-email', { state: { email: e.email } });
      else if (e?.needsVerification) {
        try { await api.post('/auth/send-otp', { phone: e.phone }); } catch {}
        navigate('/verify-phone', { state: { phone: e.phone } });
      } else setServerError(e?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="logo">
          <Link to="/">QuickSign</Link>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
          </ul>
        </nav>
      </header>

      {/* ================= SIGNIN FORM ================= */}
      <div className="page">
        <div className="card">
          <h2 className="title">Sign in to your account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'Email required' })}
              />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input
                type="password"
                placeholder="Your password"
                {...register('password', { required: 'Password required' })}
              />
            </Field>
            {serverError && <p className="error">{serverError}</p>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="footer-text">
            No account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>

       <footer className="footer">

        <h3>QuickSign</h3>

        <p>
          Fast • Secure • Modern User Management
        </p>

        <div className="footer-links">

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>

        </div>
        <p className="copyright">
          © {new Date().getFullYear()} QuickSign. All rights reserved.
        </p>

      </footer>

      {/* ================= CSS ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        *{margin:0; padding:0; box-sizing:border-box; font-family:Poppins,sans-serif;}

        /* HEADER SAME AS HOMEPAGE */
        .header{
        position:fixed;
        top:0;
        width:100%;
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:18px 40px;
        background:rgba(0,0,0,0.5);
        backdrop-filter:blur(10px);
        z-index:1000;
        }

        .logo a{
        color:white;
        font-size:26px;
        font-weight:bold;
        text-decoration:none;
        }

        .logo a:hover{
        color:rgba(200, 200, 200, 0.7);
        }

        .nav-links{
        display:flex;
        gap:30px;
        list-style:none;
        align-items:center;
        }

        .nav-links a{
        color:white;
        text-decoration:none;
        font-weight:500;
        }

        .nav-links a:hover{
        color:rgba(200, 200, 200, 0.7);
        }

        .signup-btn {
          padding: 8px 18px;
          border-radius: 30px;
          background: linear-gradient(90deg, #7c3aed, #ff006e);
          color: white;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: inline-block;         /* ensures padding works nicely */
        }

        .signup-btn:hover {
          transform: scale(1.1);        /* grows on hover */
          box-shadow: 0 6px 15px rgba(0,0,0,0.2); /* optional pop effect */
        }

        /* PAGE BACKGROUND - Vibrant Gen Z */
        .page{
          height:80.1vh;
          display:flex;
          justify-content:center;
          align-items:center;
          padding-top:50px;
          background:linear-gradient(135deg,#7c3aed,#ff006e);
        }

        /* CARD */
        .card{
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 0, 0, 0.1);

        }

        .title{
          text-align:center;
          margin-bottom:25px;
          color:white;
          font-size:1.9rem;
          font-weight:700;
        }

        .form{ display:flex; flex-direction:column; gap:16px; }

        .field{ display:flex; flex-direction:column; }
        .field label{
          font-size:14px;
          font-weight:600;
          margin-bottom:5px;
          color:white;
          text-shadow:1px 1px 2px rgba(0,0,0,0.3);
        }
        .field input{
          padding:12px;
          border-radius:12px;
          border:none;
          font-size:14px;
          outline:none;
          background: rgba(255,255,255,0.25);
          color:#fff;
          font-weight:500;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
        }
        .field input::placeholder{ color: rgba(255,255,255,0.7); }

        .btn{
          margin-top:12px;
          padding:12px;
          border:none;
          border-radius:12px;
          font-size:16px;
          font-weight:700;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          color:white;
          cursor:pointer;
          transition: all 0.3s ease;
        }
        .btn:hover{
          transform: scale(1.05);
          background:linear-gradient(135deg,#7c3aed,#ff006e);
        }

        .error{
          color:#ff6b6b;
          font-size:13px;
          margin-top:5px;
        }

        .footer-text{
          text-align:center;
          margin-top:20px;
          font-size:14px;
          color:white;
          text-shadow:1px 1px 2px rgba(0,0,0,0.3);
        }
        .footer-text a{
          color:#7c3aed;
          font-weight:bold;
          font-weight:700;
          text-decoration:none;
        }
        .footer-text a:hover{
        color:#ff006e;
        text-decoration:none;
        }

        .footer{
        padding:40px;
        background:black;
        color:white;
        text-align:center;
        }

        .footer-links{
        display:flex;
        justify-content:center;
        gap:20px;
        margin-top:10px;
        }

        .footer-links a{
        color:white;
        text-decoration:none;
        }

        .footer-links a:hover{
        color:rgba(200, 200, 200, 0.7);
        }

        .copyright{
          margin-top:10px;
          margin-bottom: 5px;
          font-size:13px;
          color:rgba(255,255,255,0.6);
        }
      `}</style>
    </>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  );
}