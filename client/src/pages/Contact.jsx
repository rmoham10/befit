import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Contact() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
            <li><Link to="/signin">Sign In</Link></li>
            <li><Link to="/signup" className="signup-btn">Sign Up</Link></li>
          </ul>
        </nav>
      </header>

      {/* ================= CONTACT SECTION ================= */}
      <div className="page">
        <div className={`card contact-card ${loaded ? 'show' : ''}`}>
          
          <h2 className={`title ${loaded ? 'show-item' : ''}`} style={{ transitionDelay: '0.1s' }}>
            Contact Us
          </h2>

          <p className={`contact-text ${loaded ? 'show-item' : ''}`} style={{ transitionDelay: '0.3s' }}>
            Have questions or need help?  
            We're here to support you anytime.
          </p>

          <div className="contact-info">
            <p className={`info-item ${loaded ? 'show-item' : ''}`} style={{ transitionDelay: '0.5s' }}>
              <strong>Email:</strong> support@quicksign.com
            </p>
            <p className={`info-item ${loaded ? 'show-item' : ''}`} style={{ transitionDelay: '0.7s' }}>
              <strong>Phone:</strong> +1 123 456 7890
            </p>
            <p className={`info-item ${loaded ? 'show-item' : ''}`} style={{ transitionDelay: '0.9s' }}>
              <strong>Support Hours:</strong> Mon – Fri | 9:00 AM – 6:00 PM
            </p>
          </div>

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

        *{margin:0; padding:0; box-sizing:border-box; font-family:Poppins,sans-serif;}

        .header{position:fixed; top:0; width:100%; display:flex; justify-content:space-between; align-items:center; padding:18px 40px; background:rgba(0,0,0,0.5); backdrop-filter:blur(10px); z-index:1000;}
        .logo a{color:white; font-size:26px; font-weight:bold; text-decoration:none;}
        .logo a:hover{color:rgba(200,200,200,0.7);}
        .nav-links{display:flex; gap:30px; list-style:none; align-items:center;}
        .nav-links a{color:white; text-decoration:none; font-weight:500;}
        .nav-links a:hover{color:rgba(200,200,200,0.7);}
        .signup-btn {padding: 8px 18px; border-radius: 30px; background: linear-gradient(90deg, #7c3aed, #ff006e); color: white; transition: transform 0.3s ease, box-shadow 0.3s ease; display: inline-block;}
        .signup-btn:hover {transform: scale(1.1); box-shadow: 0 6px 15px rgba(0,0,0,0.2);}

        .page{min-height:80vh; display:flex; justify-content:center; align-items:center; padding-top:80px; background:linear-gradient(135deg, #7c3aed, #ff006e);}

        .card{
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          padding:40px;
          border-radius:20px;
          width:100%;
          max-width:520px;
          box-shadow:0 15px 40px rgba(0,0,0,0.2);
          text-align:center;

          /* INITIAL ANIMATION STATE */
          opacity:0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        /* MAIN CARD SHOW */
        .card.show{opacity:1; transform:translateY(0);}

        /* STAGGERED ITEMS */
        .title, .contact-text, .info-item{
          opacity:0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .show-item{opacity:1; transform:translateY(0);}

        .title{color:white; font-size:2rem; font-weight:700; margin-bottom:20px;}
        .contact-text{color:white; font-size:15px; margin-bottom:25px; opacity:0.9;}
        .contact-info{display:flex; flex-direction:column; gap:12px; font-size:15px; color:white;}
        .contact-info strong{color:#7c3aed;}

        .footer{padding:40px; background:black; color:white; text-align:center;}
        .footer-links{display:flex; justify-content:center; gap:20px; margin-top:10px;}
        .footer-links a{color:white; text-decoration:none;}
        .footer-links a:hover{color:rgba(200,200,200,0.7);}
        .copyright{margin-top:10px; margin-bottom: 5px; font-size:13px; color:rgba(255,255,255,0.6);}
      `}</style>
    </>
  );
}