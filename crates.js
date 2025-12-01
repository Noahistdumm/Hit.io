// crates.js
import { auth } from './firebase.js';
import { spawnCrate, getInventory, saveInventory } from './db.js';

export function initCratesUI(){
  const root = document.getElementById('crate-list');
  root.innerHTML = '';

  const openBtn = document.createElement('button');
  openBtn.className='btn';
  openBtn.textContent = 'Open Crate (cost 100 HP)';
  openBtn.onclick = async ()=>{
    const uid = auth.currentUser.uid;
    // naive random reward:
    const roll = Math.random();
    let reward;
    if(roll < 0.6){ reward = { type:'hp', amount: 30 }; }
    else if(roll < 0.9){ reward = { type:'ammo', amount: 25 }; }
    else { reward = { type:'skin', id:'rare_skin' }; }
    alert('Du hast bekommen: ' + JSON.stringify(reward));
    // store skin if needed
    if(reward.type === 'skin'){
      const inv = await getInventory(uid) || [];
      inv.push({ id: reward.id, boughtAt: Date.now() });
      await saveInventory(uid, inv);
    }
  };

  root.appendChild(openBtn);
}
