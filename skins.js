// skins.js
import { getInventory, saveInventory } from './db.js';
import { auth } from './firebase.js';

export async function initSkinsUI(){
  const root = document.getElementById('skin-row');
  root.innerHTML = '';
  const skins = ['soldier','scout','tactic','red'];
  skins.forEach(s=>{
    const b = document.createElement('button');
    b.className='skin-btn';
    b.textContent = s;
    b.onclick = async ()=>{
      document.querySelectorAll('.skin-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      // Save chosen skin clientside and optionally to Firestore via player doc
      const uid = auth.currentUser.uid;
      // naive: save to inventory/equip - in this starter we keep it client-side
      alert('Skin ausgewählt: ' + s);
    };
    root.appendChild(b);
  });
}
