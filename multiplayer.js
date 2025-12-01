// multiplayer.js
import { auth } from './firebase.js';
import { createPlayerDoc, playerRef, subscribeAllPlayers } from './db.js';
import { updateDoc } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { addOrUpdateRemotePlayer } from './game.js';

let lastPub = 0;

export async function ensurePlayer(uid, nick, skin){
  await createPlayerDoc(uid, { nick, skin });
}

export async function publishLocalState(state){
  const now = Date.now();
  if(now - lastPub < 80) return; // ~12Hz
  lastPub = now;
  try {
    const ref = playerRef(auth.currentUser.uid);
    await updateDoc(ref, {
      x: state.x, z: state.z, rotY: state.rotY, hp: state.hp, ammo: state.ammo, score: state.score, updatedAt: Date.now()
    });
  } catch(e){}
}

export function subscribePlayersRealtime(){
  subscribeAllPlayers(list => {
    const meId = auth.currentUser ? auth.currentUser.uid : null;
    list.forEach(p=>{
      if(p.id === meId) return;
      addOrUpdateRemotePlayer(p.id, { x:p.x||0, y:1.6, z:p.z||0, hp:p.hp, nick:p.nick });
    });
  });
}
