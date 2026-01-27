const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// nodemailer setup (optional - requires SMTP env vars in production)
const nodemailer = require('nodemailer');
let mailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

// helper auth middleware reused by some endpoints
async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error', err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ message: 'Username or email already exists' });

    const user = new User({ username, email });
    await user.setPassword(password);
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be username or email
    if (!identifier || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await user.validatePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// POST /api/auth/forgot - send 6-digit code to email
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No user with that email' });

    // generate 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = code;
    user.resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    let previewUrl;

    // send email if transporter is configured; otherwise create a test account so devs can preview
    if (mailTransporter) {
      try {
        await mailTransporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@example.com',
          to: user.email,
          subject: 'Password reset code',
          text: `Your password reset code is: ${code}`
        });
      } catch (mailErr) {
        console.error('Failed to send reset email', mailErr.message);
        // fallthrough - still return success to avoid leaking existence
      }
    } else {
      // create a test account (Ethereal) so developer can preview the email
      try {
        const testAccount = await nodemailer.createTestAccount();
        const testTransport = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass }
        });
        const info = await testTransport.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@example.com',
          to: user.email,
          subject: 'Password reset code (test)',
          text: `Your password reset code is: ${code}`
        });
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('Preview URL for reset email:', previewUrl);
      } catch (ethErr) {
        console.error('Failed to send test reset email', ethErr.message);
      }
    }

    // In demo mode return the code in the response so the UI can show it.
    // Also return previewUrl when available so developer can open the Ethereal message.
    res.json({ message: 'Reset code generated', code: process.env.NODE_ENV === 'production' ? undefined : code, previewUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/lang - set preferred language for authenticated user
router.patch('/lang', requireAuth, async (req, res) => {
  try {
    const { language } = req.body;
    if (!language || !['en', 'ar'].includes(language)) return res.status(400).json({ message: 'Invalid language' });
    req.user.language = language;
    await req.user.save();
    res.json({ user: req.user.toJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset - accept email + code + new password
router.post('/reset', async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email, resetToken: code, resetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });
    await user.setPassword(password);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
