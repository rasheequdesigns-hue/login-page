const { verify } = require('../_auth');

module.exports = async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  res.status(200).json({ admin: { email: payload.email, role: payload.role } });
};
