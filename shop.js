// shop.js
import { auth } from './firebase.js';
import { saveInventory, getInventory } from './db.js';

export async function initShopUI(){
  const shopItems = [
    { id:'hp50', name:'+50 HP (max)', cost:60 },
    { id:'ammo20', name:'+20 Ammo', cost:30 },
    { id:'skin_red', name:'Skin Red', cost:120 }
  ];
  const root = document.getElementById('shop-items');
  root.innerHTML = '';
  const user = auth.currentUser;
  shopItems.forEach(it=>{
    const b = document.createElement('button');
    b.className='skin-btn';
    b.textContent = `${it.name} — ${it.cost}HP`;
    b.onclick = async ()=>{
      let inv = await getInventory(user.uid);
      if(!inv) inv = [];
      inv.push({ id: it.id, boughtAt: Date.now() });
      await saveInventory(user.uid, inv);
      alert('Gekauft: ' + it.name);
    };
    root.appendChild(b);
  });
}
