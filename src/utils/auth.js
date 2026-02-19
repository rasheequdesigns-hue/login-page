window.Auth = {
  async login(email, pwd) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    Store.set('session', { token: data.token, admin: data.admin });
    return true;
  },

  logout() {
    localStorage.removeItem('session');
  },

  session() {
    return Store.get('session', null);
  },

  async require() {
    const s = this.session();
    if (!s?.token) {
      location.href = '/admin/login.html';
      return false;
    }
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${s.token}` }
      });
      if (!res.ok) throw new Error('unauthorized');
      return true;
    } catch {
      this.logout();
      location.href = '/admin/login.html';
      return false;
    }
  }
};
