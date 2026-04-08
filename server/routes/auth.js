const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const twilio   = require('twilio');
const db       = require('../db');
const rateLimit = require('express-rate-limit');
const authMiddleware  = require('../middleware/authMiddleware');
const { sendVerificationEmail } = require('../utils/mailer');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── Rate limiters ────────────────────────────────────────────────

// Max 3 OTP sends per phone per 10 min
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.phone || req.ip,
  message: { error: 'Too many OTP requests. Try again in 10 minutes.' },
});

// Max 3 email verification sends per user per hour
const emailVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email || req.ip,
  message: { error: 'Too many verification emails requested. Try again in an hour.' },
});

// ── Role guard ───────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  next();
};

// ── Helper: issue a JWT ──────────────────────────────────────────
function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, tier: user.tier, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────

// ── SIGN UP ───────────────────────────────────────────────────────
// POST /api/auth/signup
// Creates a User account, then sends an email-verification link.
router.post('/signup', async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  if (!full_name || !email || !password || !phone)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const [emailRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailRows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const [phoneRows] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (phoneRows.length > 0)
      return res.status(409).json({ error: 'Phone number already in use' });

    const password_hash = await bcrypt.hash(password, 12);

    // Insert user — email_verified defaults to 0
    await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, 'User')`,
      [full_name, email, password_hash, phone]
    );

    // Fetch the new user's id
    const [newUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    const userId = newUser[0].id;

    // Create email-verification token (24 h TTL)
    const token = uuidv4();
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expires_at]
    );

    // Send verification email via Mailgun
    // await sendVerificationEmail(email, full_name, token);
    try {
  await sendVerificationEmail(email, full_name, token);
  console.log('Verification email sent to', email);
} catch (err) {
  console.error('Error sending verification email:', err);
}

    res.status(201).json({
      message: 'Account created. Please check your email to verify your address.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── RESEND EMAIL VERIFICATION ─────────────────────────────────────
// POST /api/auth/resend-email-verification
router.post('/resend-email-verification', emailVerifyLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const [rows] = await db.query(
      'SELECT id, full_name, email_verified FROM users WHERE email = ?', [email]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'No account found with this email' });

    const user = rows[0];
    if (user.email_verified)
      return res.status(400).json({ error: 'Email is already verified' });

    // Invalidate any existing unused tokens
    await db.query(
      'UPDATE email_verifications SET used = 1 WHERE user_id = ? AND used = 0',
      [user.id]
    );

    const token = uuidv4();
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.query(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expires_at]
    );

    await sendVerificationEmail(email, user.full_name, token);

    res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── VERIFY EMAIL ──────────────────────────────────────────────────
// GET /api/auth/verify-email?token=<uuid>
// Called when the user clicks the link in their email.
router.get('/verify-auth-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const [rows] = await db.query(
      `SELECT ev.*, u.email, u.full_name, u.email_verified, u.phone
       FROM email_verifications ev
       JOIN users u ON u.id = ev.user_id
       WHERE ev.token = ? AND ev.used = 0 AND ev.expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: 'This link is invalid or has expired.' });

    const record = rows[0];

    if (record.email_verified)
      return res.status(400).json({ error: 'Email is already verified.' });

    // Mark token as used and mark user's email as verified
    await db.query('UPDATE email_verifications SET used = 1 WHERE id = ?', [record.id]);
    await db.query('UPDATE users SET email_verified = 1 WHERE id = ?', [record.user_id]);

    res.json({
      message: 'Email verified successfully! You may now verify your phone number.',
      email: record.email,
      phone: record.phone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Email
router.put('/change-email', async (req, res) => {
  const { oldEmail, newEmail } = req.body;

  try {
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) return res.status(400).json({ error: 'Email already in use.' });

    const user = await User.findOne({ email: oldEmail });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.email = newEmail;
    user.emailVerified = false;
    await user.save();

    // send new verification email
    await sendVerificationEmail(newEmail, user._id);

    res.json({ message: 'Email updated, verification sent to new email.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Phone
router.put('/change-phone', async (req, res) => {
  const { userId, newPhone } = req.body;

  try {
    const existingUser = await User.findOne({ phone: newPhone });
    if (existingUser) return res.status(400).json({ error: 'Phone number already in use.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.phone = newPhone;
    user.phoneVerified = false;
    await user.save();

    // send OTP to new phone
    await sendOtp(newPhone);

    res.json({ message: 'Phone updated, OTP sent to new number.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── SEND OTP ──────────────────────────────────────────────────────
// POST /api/auth/send-otp
// Requires email to be verified first (for User accounts).
router.post('/send-otp', otpLimiter, async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone is required' });

  try {
    const [rows] = await db.query(
      'SELECT id, email_verified, role FROM users WHERE phone = ?', [phone]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'No account with this phone number' });

    const user = rows[0];

    // Block phone OTP if email is not yet verified (only for User role)
    if (user.role === 'User' && !user.email_verified)
      return res.status(403).json({
        error: 'Please verify your email address before verifying your phone.',
        needsEmailVerification: true,
      });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      'UPDATE phone_verifications SET used = 1 WHERE phone = ? AND used = 0', [phone]
    );
    await db.query(
      'INSERT INTO phone_verifications (phone, otp_code, expires_at) VALUES (?, ?, ?)',
      [phone, otp, expires_at]
    );
    await twilioClient.messages.create({
      body: `Your QuickSign verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ── VERIFY OTP ────────────────────────────────────────────────────
// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp)
    return res.status(400).json({ error: 'Phone and OTP are required' });

  try {
    const [rows] = await db.query(
      `SELECT * FROM phone_verifications
       WHERE phone = ? AND otp_code = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone, otp]
    );
    if (rows.length === 0)
      return res.status(400).json({ error: 'Invalid or expired OTP' });

    await db.query('UPDATE phone_verifications SET used = 1 WHERE id = ?', [rows[0].id]);
    await db.query('UPDATE users SET phone_verified = 1 WHERE phone = ?', [phone]);

    const [userRows] = await db.query(
      'SELECT id, full_name, email, phone, tier, role FROM users WHERE phone = ?', [phone]
    );
    const user = userRows[0];

    res.json({ token: issueToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

//Gets the User Verfication Status
router.get('/user-status', async (req, res) => {
  const { email, phone } = req.query;
  if (!email && !phone) return res.status(400).json({ error: 'Email or phone required' });

  try {
    const [rows] = await db.query(
      'SELECT email_verified, phone_verified FROM users WHERE email = ? OR phone = ?',
      [email || '', phone || '']
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── SIGN IN ───────────────────────────────────────────────────────
// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: 'Invalid credentials' });

    // Users must verify email first, then phone
    if (user.role === 'User') {
      if (!user.email_verified)
        return res.status(403).json({
          error: 'Please verify your email address before signing in.',
          email: user.email,
          needsEmailVerification: true,
        });

      if (!user.phone_verified)
        return res.status(403).json({
          error: 'Phone not verified',
          phone: user.phone,
          needsVerification: true,   // triggers phone OTP flow on the client
        });
    }

    res.json({
      token: issueToken(user),
      user: {
        id: user.id, full_name: user.full_name, email: user.email,
        phone: user.phone, tier: user.tier, role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────────────────────────────

// ── GET PROFILE ───────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, phone_verified, email_verified,
              tier, role, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── UPDATE PROFILE ────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  const { full_name } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name is required' });
  try {
    await db.query('UPDATE users SET full_name = ? WHERE id = ?', [full_name, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE OWN ACCOUNT ────────────────────────────────────────────
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────
// ADMIN-ONLY ROUTES
// ─────────────────────────────────────────────────────────────────

// ── CREATE EMPLOYEE / ADMIN ACCOUNT ──────────────────────────────
// POST /api/auth/admin/create-account
// Admins can create Employee or Admin accounts; these are pre-verified.
router.post('/admin/create-account', authMiddleware, requireRole('Admin'), async (req, res) => {
  const { full_name, email, password, phone, role } = req.body;

  if (!full_name || !email || !password || !phone || !role)
    return res.status(400).json({ error: 'All fields are required' });
  if (!['Employee', 'Admin'].includes(role))
    return res.status(400).json({ error: 'Role must be Employee or Admin' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    const [emailRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailRows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const [phoneRows] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (phoneRows.length > 0)
      return res.status(409).json({ error: 'Phone number already in use' });

    const password_hash = await bcrypt.hash(password, 12);

    // Pre-verify both email and phone for staff accounts
    await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone, email_verified, phone_verified, role)
       VALUES (?, ?, ?, ?, 1, 1, ?)`,
      [full_name, email, password_hash, phone, role]
    );

    res.status(201).json({ message: `${role} account created successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── LIST ALL USERS ────────────────────────────────────────────────
router.get('/admin/users', authMiddleware, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, phone_verified, email_verified,
              tier, role, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE ANY USER ───────────────────────────────────────────────
router.delete('/admin/users/:id', authMiddleware, requireRole('Admin'), async (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Cannot delete your own account via this endpoint' });
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
