const { sign } = require('../_auth');

const attempts = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};

  const key = `${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'}`;
  const now = Date.now();
  const rec = attempts.get(key) || { count: 0, ts: now };
  if (now - rec.ts > 15 * 60 * 1000) { rec.count = 0; rec.ts = now; }
  rec.count += 1;
  attempts.set(key, rec);
  if (rec.count > 20) {
    return res.status(429).json({ error: 'Too many login attempts. Try later.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'rasheequ.designs@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Rasheequ.designs1';

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = sign({
    email,
    role: 'super_admin',
    exp: Date.now() + 1000 * 60 * 60 * 12
  });

  return res.status(200).json({ token, admin: { email, role: 'super_admin' } });
};
