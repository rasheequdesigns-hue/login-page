document.addEventListener('DOMContentLoaded',()=>{
  Auth.require();
  const links=[...document.querySelectorAll('[data-tab]')];
  const tabs=[...document.querySelectorAll('[data-panel]')];
  const title=document.querySelector('[data-title]');
  links.forEach(l=>l.onclick=(e)=>{e.preventDefault();links.forEach(x=>x.classList.remove('active'));l.classList.add('active');tabs.forEach(t=>t.hidden=t.dataset.panel!==l.dataset.tab); if(title) title.textContent=l.textContent.trim();});

  const sales=124500, orders=328, products=APP_DATA.products.length, users=89;
  set('kpi-sales',`₹${sales.toLocaleString()}`);set('kpi-orders',orders);set('kpi-products',products);set('kpi-users',users);
  function set(id,v){const el=document.getElementById(id); if(el) el.textContent=v;}

  const pBody=document.getElementById('admin-products');
  if(pBody){pBody.innerHTML=APP_DATA.products.map(p=>`<tr><td>${p.name}</td><td>${p.cat}</td><td>₹${p.price}</td><td><span class='badge badge-blue'>Paid</span></td></tr>`).join('')}

  const oBody=document.getElementById('admin-orders');
  if(oBody){oBody.innerHTML=[1,2,3,4].map(i=>`<tr><td>#10${i}</td><td>User ${i}</td><td>₹${i*1499}</td><td><span class='badge ${i%3===0?'badge-coral':i%2===0?'badge-gray':'badge-blue'}'>${i%3===0?'Cancelled':i%2===0?'Pending':'Paid'}</span></td></tr>`).join('')}

  const out=document.getElementById('logout'); if(out) out.onclick=()=>{Auth.logout();location.href='/admin/login.html'};
});