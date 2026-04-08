import { Link } from 'react-router-dom';

export default function About() {
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
            <li>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* ================= ABOUT SECTION ================= */}
      <div className="page">
        <div className="card about-card">

          <h2 className="title">About QuickSign</h2>

          <p>
            QuickSign is a modern user management platform designed to make
            authentication and user administration simple, secure, and fast.
            Our goal is to provide developers and organizations with reliable
            tools to manage users efficiently.
          </p>

          <p>
            We focus on delivering secure authentication workflows including
            email verification, role-based access control, and multi-step
            validation processes. These features help ensure that every user
            interaction remains safe and trustworthy.
          </p>

          <p>
            With QuickSign, administrators can create and manage users,
            assign roles, and monitor access in an organized way. Whether
            you're building an internal dashboard or a full-scale
            application, QuickSign provides a flexible foundation.
          </p>

          <p>
            Our mission is to build tools that are fast, secure, and easy
            to use while maintaining modern design standards and smooth
            user experiences.
          </p>

        </div>
      </div>

      {/* ================= FOOTER ================= */}
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

        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:Poppins,sans-serif;
        }

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
          color:rgba(200,200,200,0.7);
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
          color:rgba(200,200,200,0.7);
        }

        .signup-btn {
          padding: 8px 18px;
          border-radius: 30px;
          background: linear-gradient(90deg, #7c3aed, #ff006e);
          color: white;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: inline-block;
        }

        .signup-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 15px rgba(0,0,0,0.2);
        }

        /* PAGE BACKGROUND */
        .page{
          height:80vh;
          display:flex;
          justify-content:center;
          align-items:center;
          padding:100px 20px 40px;

          background:linear-gradient(
            135deg,
            #7c3aed,
            #ff006e
          );
        }

        /* CARD */
        .card{
          background: linear-gradient(
            135deg,
            #0f2027,
            #203a43,
            #2c5364
          );

          padding:40px;
          border-radius:20px;
          margin-top: 20px;

          width:100%;
          max-width:850px;

          box-shadow:0 15px 40px rgba(0,0,0,0.2);

          color:white;

          line-height:1.7;
          font-size:15px;
        }

        .title{
          text-align:center;
          font-size:2rem;
          font-weight:700;
          margin-bottom:25px;
        }

        .about-card p{
          margin-bottom:18px;
          opacity:0.95;
        }

        /* FOOTER */
        .footer{
          padding:30px;
          background:black;
          color:white;
          text-align:center;
        }

        .footer h3{
          margin-top: -10px;
        }

        .footer-links{
          display:flex;
          justify-content:center;
          gap:20px;
          margin-top:5px;
        }

        .footer-links a{
          color:white;
          text-decoration:none;
        }

        .footer-links a:hover{
          color:rgba(200,200,200,0.7);
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