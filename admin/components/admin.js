document.addEventListener('DOMContentLoaded', async ()=>{
  const ok = await Auth.require(); if(!ok) return;
  const session = Auth.session()||{}; const role = session?.admin?.role || 'super_admin';
  const PERMS={super_admin:['*'],sub_admin:['products:write','orders:write'],order_manager:['orders:write','orders:export'],product_manager:['products:write']};
  const can=(p)=> (PERMS[role]||[]).includes('*') || (PERMS[role]||[]).includes(p);

  const links=[...document.querySelectorAll('[data-tab]')], tabs=[...document.querySelectorAll('[data-panel]')], title=document.querySelector('[data-title]');
  links.forEach(l=>l.onclick=(e)=>{e.preventDefault();links.forEach(x=>x.classList.remove('active'));l.classList.add('active');tabs.forEach(t=>t.hidden=t.dataset.panel!==l.dataset.tab); if(title) title.textContent=l.textContent.trim();});

  let products=Store.get('admin_products',APP_DATA.products.map(p=>({...p,stock:20,status:'Active'})));
  let orders=Store.get('admin_orders',[{id:'#101',user:'Amaan',email:'amaan@mail.com',total:2999,status:'Pending',tracking:'-'},{id:'#102',user:'Nisha',email:'nisha@mail.com',total:1499,status:'Shipped',tracking:'TRK123'}]);
  let users=Store.get('admin_users',[{name:'Amaan',email:'amaan@mail.com',blocked:false},{name:'Nisha',email:'nisha@mail.com',blocked:false}]);
  let settings=Store.get('admin_settings',{siteName:'ShopKaro',shipping:49,tax:18,razorpayKey:'',accent:'#B7FF00',cod:true});

  const save=()=>{Store.set('admin_products',products);Store.set('admin_orders',orders);Store.set('admin_users',users);Store.set('admin_settings',settings);render();};
  function badge(status){if(status==='Pending')return'b-pending';if(status==='Shipped')return'b-shipped';if(status==='Delivered'||status==='Paid')return'b-delivered';if(status==='Cancelled')return'b-cancel';return'b-pending';}

  function render(){
    const revenue=orders.reduce((a,b)=>a+Number(b.total||0),0);
    txt('kpi-sales','₹'+revenue.toLocaleString()); txt('kpi-orders',orders.length); txt('kpi-products',products.length); txt('kpi-users',users.length);
    const pBody=document.getElementById('admin-products'); if(pBody) pBody.innerHTML=products.map((p,i)=>`<tr><td><img src='${p.img||''}' style='width:42px;height:42px;border-radius:8px;object-fit:cover'></td><td>${p.name}</td><td>₹${p.price}</td><td>${p.stock??0}</td><td>${p.stock>0?'Active':'Out of stock'}</td><td><button class='btn btn-dark' onclick='editP(${i})'>Edit</button></td><td><button class='btn btn-dark' onclick='delP(${i})'>Delete</button></td></tr>`).join('');
    const oBody=document.getElementById('admin-orders'); if(oBody) oBody.innerHTML=orders.map((o,i)=>`<tr><td>${o.id}</td><td>${o.user}</td><td>₹${o.total}</td><td><span class='badge ${badge(o.status)}'>${o.status}</span></td><td><button class='btn btn-dark' onclick='nextO(${i})'>Update</button></td><td><button class='btn btn-dark' onclick='detailO(${i})'>View</button></td></tr>`).join('');
    const rBody=document.getElementById('recentOrders'); if(rBody) rBody.innerHTML=orders.slice(0,5).map(o=>`<tr><td>${o.id}</td><td>${o.user}</td><td>₹${o.total}</td><td><span class='badge ${badge(o.status)}'>${o.status}</span></td></tr>`).join('');
    const uBody=document.getElementById('admin-users'); if(uBody) uBody.innerHTML=users.map((u,i)=>`<tr><td>${u.name}</td><td>${u.email}</td><td>${u.blocked?'Blocked':'Active'}</td><td><button class='btn btn-dark' onclick='togU(${i})'>${u.blocked?'Unblock':'Block'}</button></td></tr>`).join('');
    setv('setSiteName',settings.siteName); setv('setShip',settings.shipping); setv('setTax',settings.tax); setv('setRzp',settings.razorpayKey); setv('setAccent',settings.accent); const cod=document.getElementById('setCod'); if(cod) cod.checked=!!settings.cod;
  }

  window.editP=(i)=>{if(!can('products:write')) return alert('No permission'); const p=products[i]; const price=Number(prompt('Price',p.price)||p.price); const stock=Number(prompt('Stock',p.stock)||p.stock); products[i]={...p,price,stock}; save();};
  window.delP=(i)=>{if(!can('products:write')) return alert('No permission'); if(confirm('Delete product?')){products.splice(i,1); save();}};
  window.nextO=(i)=>{if(!can('orders:write')) return alert('No permission'); const seq=['Pending','Shipped','Delivered','Cancelled']; const cur=seq.indexOf(orders[i].status); orders[i].status=seq[(cur+1)%seq.length]; save();};
  window.detailO=(i)=> alert(`Order ${orders[i].id}\nCustomer: ${orders[i].user}\nTracking: ${orders[i].tracking||'-'}`);
  window.togU=(i)=>{users[i].blocked=!users[i].blocked; save();};

  document.getElementById('addProductBtn')?.addEventListener('click',()=>{if(!can('products:write')) return alert('No permission'); const name=prompt('Product name'); if(!name)return; const price=Number(prompt('Price','999')||999); products.unshift({id:Date.now(),name,price,stock:20,img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}); save();});
  document.getElementById('exportOrdersBtn')?.addEventListener('click',async()=>{if(!can('orders:export')&&!can('orders:write')) return alert('No permission'); const token=session.token; try{const r=await fetch('/api/admin/orders-export',{headers:{Authorization:`Bearer ${token}`}}); if(r.ok){const blob=await r.blob();const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='orders.csv';a.click();return;}}catch{} const h=['id','user','email','total','status','tracking']; const csv=[h,...orders.map(o=>[o.id,o.user,o.email,o.total,o.status,o.tracking])].map(r=>r.join(',')).join('\n'); const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='orders.csv';a.click();});
  document.getElementById('settingsForm')?.addEventListener('submit',(e)=>{e.preventDefault(); settings={...settings,siteName:gv('setSiteName','ShopKaro'),shipping:Number(gv('setShip',49)),tax:Number(gv('setTax',18)),razorpayKey:gv('setRzp',''),accent:gv('setAccent','#B7FF00'),cod:document.getElementById('setCod')?.checked}; save(); alert('Settings saved');});
  document.getElementById('adminSearch')?.addEventListener('input',(e)=>{const q=e.target.value.toLowerCase(); document.querySelectorAll('tbody tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none');});
  document.getElementById('logout')?.addEventListener('click',(e)=>{e.preventDefault();Auth.logout();location.href='/admin/login.html';});

  async function loadServerAnalytics(){try{const r=await fetch('/api/admin/analytics',{headers:{Authorization:`Bearer ${session.token}`}}); if(!r.ok)return; const a=await r.json(); txt('kpi-sales','₹'+Number(a.revenue||0).toLocaleString()); txt('kpi-orders',a.totalOrders||0); txt('kpi-products',a.totalProducts||0); txt('kpi-users',a.totalUsers||0);}catch{}}
  const txt=(id,v)=>{const e=document.getElementById(id); if(e)e.textContent=v}; const setv=(id,v)=>{const e=document.getElementById(id); if(e!=null)e.value=v}; const gv=(id,d)=>document.getElementById(id)?.value||d;
  render(); loadServerAnalytics();
});