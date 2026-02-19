const { sign } = require('../_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
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
