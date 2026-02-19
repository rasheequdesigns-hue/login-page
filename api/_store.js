// Lightweight server memory store (resets on cold starts)
const state = {
  products: [
    { id: 1, name: 'NeoPods X', cat: 'Audio', price: 2499, stock: 20, cod: true },
    { id: 2, name: 'Pulse Smartwatch', cat: 'Wearables', price: 4999, stock: 12, cod: true }
  ],
  orders: [
    { id: '#101', user: 'Amaan', email: 'amaan@mail.com', total: 2999, status: 'Paid', tracking: '-' },
    { id: '#102', user: 'Nisha', email: 'nisha@mail.com', total: 1499, status: 'Pending', tracking: '-' }
  ],
  users: [
    { name: 'Amaan', email: 'amaan@mail.com', blocked: false },
    { name: 'Nisha', email: 'nisha@mail.com', blocked: false }
  ]
};

module.exports = state;
