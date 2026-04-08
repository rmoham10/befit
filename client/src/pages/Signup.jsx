import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', data);
      navigate('/verify-email', {
        state: { email: data.email, phone: data.phone }
      });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
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
            <li><Link to="/signin" className="signup-btn">Sign In</Link></li>
          </ul>
        </nav>
      </header>

      {/* ================= SIGNUP FORM ================= */}
      <div className="page">
        <div className="card">
          <h2 className="title">Create your account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="form">

            <Field label="Full Name" error={errors.full_name?.message}>
              <input
                placeholder="Jane Doe"
                {...register('full_name', { required: 'Full name required' })}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                {...register('password', {
                  required: 'Password required',
                  minLength: { value: 8, message: 'At least 8 characters' }
                })}
              />
            </Field>

            <Field label="Phone Number" error={errors.phone?.message}>
              <input
                placeholder="+1234567890"
                {...register('phone', {
                  required: 'Phone required',
                  pattern: { value: /^\+[1-9]\d{7,14}$/, message: 'Use format +1234567890' }
                })}
              />
            </Field>

            {serverError && <p className="error">{serverError}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="footer-text">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
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

      {/* ================= CSS ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:Poppins,sans-serif;}

        /* HEADER */
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

        .signup-btn{
          padding:8px 18px;
          border-radius:30px;
          background: linear-gradient(90deg,#7c3aed,#ff006e);
          color:white;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display:inline-block;
        }

        .signup-btn:hover{
          transform: scale(1.1);
          box-shadow:0 6px 15px rgba(0,0,0,0.2);
        }

        /* PAGE BACKGROUND */
        .page{
          height:90vh;
          display:flex;
          justify-content:center;
          align-items:center;
          background:linear-gradient(135deg,#7c3aed,#ff006e);
        }

        /* CARD */
        .card{
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          backdrop-filter: blur(10px);
          padding:40px;
          margin-top: 65px;
          border-radius:20px;
          width:100%;
          max-width:420px;
          box-shadow:0 15px 40px rgba(0,0,0,0.2);
          border:1px solid rgba(0,0,0,0.1);
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

/* Field Component */
function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <p className="error">{error}</p>}
    </div>
  );
}