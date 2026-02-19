document.addEventListener('DOMContentLoaded', async ()=>{
  const ok = await Auth.require();
  if(!ok) return;

  const links=[...document.querySelectorAll('[data-tab]')];
  const tabs=[...document.querySelectorAll('[data-panel]')];
  const title=document.querySelector('[data-title]');
  links.forEach(l=>l.onclick=(e)=>{e.preventDefault();links.forEach(x=>x.classList.remove('active'));l.classList.add('active');tabs.forEach(t=>t.hidden=t.dataset.panel!==l.dataset.tab); if(title) title.textContent=l.textContent.trim();});

  const products = Store.get('admin_products', APP_DATA.products);
  const orders = Store.get('admin_orders', [
    {id:'#101',user:'Amaan',total:2999,status:'Paid'},
    {id:'#102',user:'Nisha',total:1499,status:'Pending'},
    {id:'#103',user:'Rahul',total:899,status:'Cancelled'},
  ]);

  const sales=orders.reduce((s,o)=>s+Number(o.total),0);
  set('kpi-sales',`₹${sales.toLocaleString()}`);set('kpi-orders',orders.length);set('kpi-products',products.length);set('kpi-users',89);
  function set(id,v){const el=document.getElementById(id); if(el) el.textContent=v;}

  renderProducts(products);
  renderOrders(orders);

  const out=document.getElementById('logout'); if(out) out.onclick=()=>{Auth.logout();location.href='/admin/login.html'};

  function renderProducts(list){
    const pBody=document.getElementById('admin-products');
    if(!pBody) return;
    pBody.innerHTML=list.map((p,i)=>`<tr><td>${p.name}</td><td>${p.cat||'-'}</td><td>₹${p.price}</td><td><span class='badge badge-green'>Active</span></td></tr>`).join('');
  }
  function renderOrders(list){
    const oBody=document.getElementById('admin-orders');
    if(!oBody) return;
    oBody.innerHTML=list.map(i=>`<tr><td>${i.id}</td><td>${i.user}</td><td>₹${i.total}</td><td><span class='badge ${i.status==='Cancelled'?'badge-coral':i.status==='Pending'?'badge-gray':'badge-green'}'>${i.status}</span></td></tr>`).join('');
  }
});