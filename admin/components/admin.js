document.addEventListener('DOMContentLoaded', async ()=>{
  const ok = await Auth.require();
  if(!ok) return;

  const session = Auth.session();
  const role = session?.admin?.role || 'super_admin';
  const PERMS = {
    super_admin:['products:write','orders:write','users:write','marketing:write','settings:write','orders:export'],
    sub_admin:['products:write','orders:write','marketing:write'],
    order_manager:['orders:write','orders:export'],
    product_manager:['products:write']
  };
  const can = (perm)=> (PERMS[role]||[]).includes(perm);

  const links=[...document.querySelectorAll('[data-tab]')];
  const tabs=[...document.querySelectorAll('[data-panel]')];
  const title=document.querySelector('[data-title]');
  links.forEach(l=>l.onclick=(e)=>{e.preventDefault();links.forEach(x=>x.classList.remove('active'));l.classList.add('active');tabs.forEach(t=>t.hidden=t.dataset.panel!==l.dataset.tab); if(title) title.textContent=l.textContent.trim();});

  let products = Store.get('admin_products', APP_DATA.products.map(p=>({...p,stock:20,cod:true})));
  let orders = Store.get('admin_orders', [
    {id:'#101',user:'Amaan',email:'amaan@mail.com',total:2999,status:'Paid',tracking:'-'},
    {id:'#102',user:'Nisha',email:'nisha@mail.com',total:1499,status:'Pending',tracking:'-'},
    {id:'#103',user:'Rahul',email:'rahul@mail.com',total:899,status:'Cancelled',tracking:'-'},
  ]);
  let users = Store.get('admin_users', [
    {name:'Amaan',email:'amaan@mail.com',blocked:false},
    {name:'Nisha',email:'nisha@mail.com',blocked:false},
    {name:'Rahul',email:'rahul@mail.com',blocked:true}
  ]);
  let coupons = Store.get('admin_coupons', []);
  let settings = Store.get('admin_settings', {siteName:'ShopKaro',accent:'#B7FF00',shipping:49,tax:18,cod:true,razorpayKey:''});

  renderAll();

  document.getElementById('addProductBtn')?.addEventListener('click', ()=>{
    if(!can('products:write')) return alert('No permission');
    const name = prompt('Product name'); if(!name) return;
    const price = Number(prompt('Price', '999'))||0;
    const cat = prompt('Category','General')||'General';
    products.unshift({id:Date.now(),name,price,mrp:price+500,cat,img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',stock:20,cod:true});
    persist();
  });

  document.getElementById('couponForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!can('marketing:write')) return alert('No permission');
    const code = document.getElementById('couponCode').value.trim().toUpperCase();
    const value = Number(document.getElementById('couponValue').value||0);
    const type = document.getElementById('couponType').value;
    if(!code || !value) return;
    coupons.unshift({code,value,type,createdAt:new Date().toISOString()});
    e.target.reset();
    persist();
  });

  document.getElementById('settingsForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!can('settings:write')) return alert('No permission');
    settings = {
      siteName: document.getElementById('setSiteName').value || 'ShopKaro',
      accent: document.getElementById('setAccent').value || '#B7FF00',
      shipping: Number(document.getElementById('setShip').value||0),
      tax: Number(document.getElementById('setTax').value||0),
      cod: document.getElementById('setCod').checked,
      razorpayKey: settings.razorpayKey || ''
    };
    Store.set('admin_settings', settings);
    alert('Settings saved');
  });

  document.getElementById('adminSearch')?.addEventListener('input', (e)=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none');
  });

  document.getElementById('exportOrdersBtn')?.addEventListener('click', ()=>{
    if(!can('orders:export')) return alert('No permission');
    const header = ['id','user','email','total','status','tracking'];
    const rows = orders.map(o=>[o.id,o.user,o.email,o.total,o.status,o.tracking]);
    const csv = [header,...rows].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orders-${Date.now()}.csv`;
    a.click();
  });

  function persist(){
    Store.set('admin_products', products);
    Store.set('admin_orders', orders);
    Store.set('admin_users', users);
    Store.set('admin_coupons', coupons);
    renderAll();
  }

  function renderAll(){
    const sales=orders.reduce((s,o)=>s+Number(o.total),0);
    set('kpi-sales',`₹${sales.toLocaleString()}`);set('kpi-orders',orders.length);set('kpi-products',products.length);set('kpi-users',users.length);
    renderProducts(); renderOrders(); renderUsers(); renderCoupons(); bindSettings();
  }

  function set(id,v){const el=document.getElementById(id); if(el) el.textContent=v;}

  function renderProducts(){
    const pBody=document.getElementById('admin-products'); if(!pBody) return;
    pBody.innerHTML=products.map((p,i)=>`<tr><td>${p.name}</td><td>${p.cat||'-'}</td><td>₹${p.price}</td><td>${p.stock??0}</td><td>${p.cod?'Yes':'No'}</td><td><button class='btn btn-secondary' onclick='window.editProduct(${i})'>Edit</button> <button class='btn btn-secondary' onclick='window.delProduct(${i})'>Delete</button></td></tr>`).join('');
  }

  window.editProduct=(i)=>{
    if(!can('products:write')) return alert('No permission');
    const p=products[i];
    const price=Number(prompt('New price', String(p.price))||p.price);
    const stock=Number(prompt('New stock', String(p.stock??20))||p.stock);
    const cod=confirm('COD available? OK=Yes, Cancel=No');
    products[i]={...p,price,stock,cod}; persist();
  };
  window.delProduct=(i)=>{if(!can('products:write')) return alert('No permission'); if(confirm('Delete product?')){products.splice(i,1);persist();}};

  function renderOrders(){
    const oBody=document.getElementById('admin-orders'); if(!oBody) return;
    oBody.innerHTML=orders.map((o,i)=>`<tr><td>${o.id}</td><td>${o.user}</td><td>₹${o.total}</td><td><span class='badge ${o.status==='Cancelled'?'badge-coral':o.status==='Pending'?'badge-gray':'badge-green'}'>${o.status}</span></td><td>${o.tracking||'-'}</td><td><button class='btn btn-secondary' onclick='window.nextStatus(${i})'>Next Status</button> <button class='btn btn-secondary' onclick='window.setTracking(${i})'>Tracking</button></td></tr>`).join('');
  }

  window.nextStatus=(i)=>{
    if(!can('orders:write')) return alert('No permission');
    const seq=['Pending','Confirmed','Shipped','Delivered','Cancelled'];
    const cur=seq.indexOf(orders[i].status); orders[i].status=seq[(cur+1)%seq.length]; persist();
  };
  window.setTracking=(i)=>{if(!can('orders:write')) return alert('No permission'); orders[i].tracking=prompt('Tracking ID', orders[i].tracking||'')||orders[i].tracking; persist();};

  function renderUsers(){
    const uBody=document.getElementById('admin-users'); if(!uBody) return;
    uBody.innerHTML=users.map((u,i)=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.blocked?'Blocked':'Active'}</td><td><button class='btn btn-secondary' onclick='window.toggleUser(${i})'>${u.blocked?'Unblock':'Block'}</button></td></tr>`).join('');
  }
  window.toggleUser=(i)=>{if(!can('users:write')) return alert('No permission'); users[i].blocked=!users[i].blocked; persist();};

  function renderCoupons(){
    const el=document.getElementById('couponList'); if(!el) return;
    if(!coupons.length){el.innerHTML='<p style="color:var(--text-secondary)">No coupons yet.</p>'; return;}
    el.innerHTML=coupons.map(c=>`<div class='card' style='margin-bottom:8px'><strong>${c.code}</strong> — ${c.type==='percent'?c.value+'%':'₹'+c.value}</div>`).join('');
  }

  function bindSettings(){
    const s=settings;
    const set=(id,v)=>{const el=document.getElementById(id); if(el!=null) el.value=v;};
    set('setSiteName',s.siteName); set('setAccent',s.accent); set('setShip',s.shipping); set('setTax',s.tax);
    const cod=document.getElementById('setCod'); if(cod) cod.checked=!!s.cod;
  }

  const out=document.getElementById('logout'); if(out) out.onclick=()=>{Auth.logout();location.href='/admin/login.html'};
});