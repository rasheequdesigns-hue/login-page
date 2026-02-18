document.addEventListener('DOMContentLoaded',()=>{
  const year=document.querySelector('[data-year]'); if(year) year.textContent=new Date().getFullYear();
  const list=document.querySelector('[data-products]');
  if(list){
    list.innerHTML=APP_DATA.products.map(p=>`<article class='card product-card'><img loading='lazy' src='${p.img}' alt='${p.name}'/><h3>${p.name}</h3><p>${p.cat}</p><div class='price'><strong>₹${p.price}</strong><del>₹${p.mrp}</del></div><a class='btn btn-primary' href='/product.html?id=${p.id}'>View</a></article>`).join('');
  }
  const c=Store.get('cart',[]); const b=document.querySelector('[data-cart-count]'); if(b) b.textContent=c.length;
});