const { getUser, hasPerm } = require('../_rbac');
const db = require('../_store');

module.exports = async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasPerm(user, 'orders:export')) return res.status(403).json({ error: 'Forbidden' });

  const header = ['id','user','email','total','status','tracking'];
  const rows = db.orders.map(o => [o.id, o.user, o.email, o.total, o.status, o.tracking]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
  return res.status(200).send(csv);
};
