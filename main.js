// main.js - orchestrator
import { startAuth } from './auth.js';
import { ensurePlayer } from './multiplayer.js';
import { initThree, localPlayer } from './game.js';
import { initInput } from './input.js';
import { initShopUI } from './shop.js';
import { initSkinsUI } from './skins.js';
import { initCratesUI } from './crates.js';
import { subscribePlayersRealtime } from './multiplayer.js';
import { createRoom, joinRoom, startVoice, stopVoice } from './webrtc.js';

const uiStart = document.getElementById('ui-start');
const btnPlay = document.getElementById('btn-play');
const btnShop = document.getElementById('btn-shop');
const btnCrates = document.getElementById('btn-crates');
const backBtns = document.querySelectorAll('.back');

startAuth(async userUid => {
  console.log('auth ready', userUid);
  // skins UI
  document.getElementById('skin-row').innerHTML = '';
  ['soldier','scout','tactic'].forEach(s=>{
    const b = document.createElement('button'); b.className='skin-btn'; b.textContent=s;
    b.onclick = ()=> { document.querySelectorAll('.skin-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); localPlayer.skin = s; };
    document.getElementById('skin-row').appendChild(b);
  });

  const nick = document.getElementById('nick').value || 'Spieler';
  await ensurePlayer(userUid, nick, 'soldier');

  btnPlay.onclick = async ()=>{
    uiStart.classList.add('hidden');
    document.getElementById('glCanvas').classList.remove('hidden');
    document.getElementById('hud').classList.remove('hidden');
    initThree();
    initInput(()=> document.getElementById('glCanvas').requestPointerLock());
    subscribePlayersRealtime();
  };

  btnShop.onclick = ()=>{
    document.getElementById('ui-shop').classList.remove('hidden');
    uiStart.classList.add('hidden');
    initShopUI();
  };

  btnCrates.onclick = ()=>{
    document.getElementById('ui-crates').classList.remove('hidden');
    uiStart.classList.add('hidden');
    initCratesUI();
  };

  backBtns.forEach(b=> b.onclick = ()=> {
    document.getElementById('ui-shop').classList.add('hidden');
    document.getElementById('ui-crates').classList.add('hidden');
    uiStart.classList.remove('hidden');
  });

  document.getElementById('hostBtn').onclick = async ()=>{
    const id = 'r-'+Math.random().toString(36).slice(2,9);
    await createRoom(id, data => { /* handle incoming data */ });
    alert('Room erstellt: ' + id + ' — teile die ID');
  };
  document.getElementById('joinBtn').onclick = async ()=>{
    const id = prompt('Room ID:');
    if(!id) return;
    await joinRoom(id, data => { /* handle data */ });
    alert('Joined ' + id);
  };

  const vt = document.getElementById('voice-toggle');
  let voiceOn=false;
  vt.onclick = async ()=>{
    if(voiceOn){ stopVoice(); vt.textContent='Voice'; voiceOn=false; }
    else { await startVoice(); vt.textContent='Voice ON'; voiceOn=true; }
  };
});
