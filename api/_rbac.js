const { verify } = require('./_auth');

const PERMS = {
  super_admin: ['*'],
  sub_admin: ['products:write', 'orders:write', 'marketing:write'],
  order_manager: ['orders:write', 'orders:export'],
  product_manager: ['products:write']
};

function getUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  return verify(token);
}

function hasPerm(user, perm) {
  if (!user) return false;
  const perms = PERMS[user.role] || [];
  return perms.includes('*') || perms.includes(perm);
}

module.exports = { PERMS, getUser, hasPerm };
