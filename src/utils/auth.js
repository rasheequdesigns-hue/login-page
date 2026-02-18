window.Auth={
  login(email,pwd){if(email&&pwd){Store.set('session',{email,role:'admin'});return true}return false},
  logout(){localStorage.removeItem('session')},
  session(){return Store.get('session',null)},
  require(){if(!this.session()) location.href='/admin/login.html'}
};