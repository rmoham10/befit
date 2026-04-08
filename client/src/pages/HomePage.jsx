import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="home">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="logo">
          <Link to="/">QuickSign</Link>
        </div>

        <nav>
          <ul className="nav-links">

            <li>
            <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                Home
            </Link>
            </li>

            <li>
              <Link to="/about">About</Link>
            </li>

            <li>
              <Link to="/contact">Contact</Link>
            </li>

            <li>
              <Link to="/signin">Sign In</Link>
            </li>

            <li>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </li>

          </ul>
        </nav>

      </header>

      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-left">

          <h1>
            Create Accounts in Seconds ⚡
          </h1>

          <p>
            Secure user creation with instant email and phone verification. Built for admins, employees, 
            and modern teams. Fast, safe, and ready to power your workflow—get started in seconds!
          </p>

          <div className="hero-buttons">

            <Link to="/signup" className="primary-btn">
              Get Started 🚀
            </Link>

            <Link to="/signin" className="secondary-btn">
              Sign In
            </Link>

          </div>

        </div>

        <div className="hero-right">

          <div className="floating-card">
            📩 Email Verified ✔
          </div>

          <div className="floating-card">
            📱 Phone Verified ✔
          </div>

          <div className="floating-card">
            👤 Account Created ✔
          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="steps">

        <h2>How It Works</h2>

        <div className="step-grid">

          <div className="step-card">
            <h3>👤 Create Account</h3>
            <p>Enter email and phone number.</p>
          </div>

          <div className="step-card">
            <h3>📩 Verify</h3>
            <p>Confirm email and phone securely.</p>
          </div>

          <div className="step-card">
            <h3>🚀 Access Dashboard</h3>
            <p>Start using your role instantly.</p>
          </div>

        </div>

      </section>

      {/* ================= ROLES ================= */}

      <section className="roles">

        <h2>User Roles</h2>

        <div className="role-grid">

          <div className="role-card">
            🛡
            <h3>Admin</h3>
            <p>Creates employees and manages users.</p>
          </div>

          <div className="role-card">
            👔
            <h3>Employee</h3>
            <p>Manages operations and services.</p>
          </div>

          <div className="role-card">
            🧑
            <h3>User</h3>
            <p>Creates and manages personal accounts.</p>
          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="cta">

        <h2>
          Ready to Create Your Account?
        </h2>

        <Link to="/signup" className="primary-btn">
          Sign Up Now
        </Link>

      </section>

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

/* HERO */

.hero{
height:100vh;
display:flex;
align-items:center;
justify-content:space-around;
background:linear-gradient(135deg,#7c3aed,#ff006e);
color:white;
padding-top:80px;
}

.hero-left{
max-width:800px;
}

.hero-left h1{
font-size:48px;
margin-bottom:20px;
}

.hero-left p{
font-size:18px;
margin-bottom:25px;
}

.hero-buttons{
display:flex;
gap:20px;
}

.primary-btn{
padding:12px 24px;
border-radius:30px;
background:white;
color:#7c3aed;
font-weight:bold;
text-decoration:none;
}

.primary-btn:hover{
color:#9f6eff
}

.secondary-btn{
padding:12px 24px;
border-radius:30px;
border:2px solid white;
color:white;
text-decoration:none;
}

.secondary-btn:hover{
color:rgba(200, 200, 200, 0.7);
}

/* FLOAT */

.hero-right{
display:flex;
flex-direction:column;
gap:15px;
}

.floating-card{
background:white;
color:black;
padding:12px 20px;
border-radius:15px;
animation:float 3s infinite;
}

@keyframes float{
0%{transform:translateY(0);}
50%{transform:translateY(-10px);}
100%{transform:translateY(0);}
}

/* STEPS */

.steps{
padding:80px 40px;
text-align:center;
background:#f8f8f8;
}

.step-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:30px;
margin-top:40px;
}

.step-card{
background:white;
padding:30px;
border-radius:20px;
box-shadow:0 5px 20px rgba(0,0,0,0.1);
}

/* ROLES */

.roles{
padding:80px 40px;
text-align:center;
}

.role-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:30px;
margin-top:40px;
}

.role-card{
padding:30px;
border-radius:20px;
background:#fff;
box-shadow:0 5px 20px rgba(0,0,0,0.1);
}

/* CTA */

.cta {
  padding: 80px;
  text-align: center;
  background: linear-gradient(135deg, #7c3aed, #ff006e);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px; /* <--- Add this to control space between heading and button */
}

/* FOOTER */

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

    </div>
  );
}