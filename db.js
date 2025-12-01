// db.js
import { db } from './firebase.js';
import { doc, setDoc, updateDoc, collection, onSnapshot, addDoc, deleteDoc, getDoc } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

export function playerRef(uid){ return doc(db, 'players', uid); }

export async function createPlayerDoc(uid, data = {}){
  const ref = playerRef(uid);
  const base = Object.assign({
    nick: 'Spieler', skin:'soldier', x:0,z:0,rotY:0, hp:100, maxHp:100, ammo:30, hpCurrency:100, score:0, updatedAt: Date.now()
  }, data);
  await setDoc(ref, base);
  return ref;
}

export function subscribeAllPlayers(onChange){
  const col = collection(db, 'players');
  return onSnapshot(col, snap => {
    const out = [];
    snap.forEach(d=> out.push({ id: d.id, ...d.data() }));
    onChange(out);
  });
}

export async function spawnCrate(type,x,y){
  await addDoc(collection(db,'crates'), { type, x, y, ts: Date.now() });
}

export function subscribeCrates(cb){
  const col = collection(db,'crates');
  return onSnapshot(col, snap => {
    const arr = [];
    snap.forEach(d=> arr.push({ id:d.id, ...d.data() }));
    cb(arr);
  });
}

export async function removeCrate(id){ await deleteDoc(doc(db,'crates',id)); }

export async function saveInventory(uid, items){
  await setDoc(doc(db,'inventories', uid), { items }, { merge:true });
}
export async function getInventory(uid){
  const s = await getDoc(doc(db,'inventories', uid));
  return s.exists() ? s.data().items : [];
}
