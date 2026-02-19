const { getUser } = require('../_rbac');
const db = require('../_store');

module.exports = async (req, res) => {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const revenue = db.orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const paid = db.orders.filter(o => o.status === 'Paid').length;
  const conversionRate = db.users.length ? ((paid / db.users.length) * 100).toFixed(2) : '0.00';

  res.status(200).json({
    revenue,
    totalOrders: db.orders.length,
    totalProducts: db.products.length,
    totalUsers: db.users.length,
    conversionRate
  });
};
