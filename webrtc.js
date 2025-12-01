// webrtc.js
import { db } from './firebase.js';
import { collection, doc, setDoc, addDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const servers = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };
let pc = null;
let dataChannel = null;
let localStream = null;
let currentRoomRef = null;

export async function createRoom(roomId, onData){
  const roomRef = doc(collection(db,'rooms'), roomId);
  pc = new RTCPeerConnection(servers);
  dataChannel = pc.createDataChannel('state');
  dataChannel.onmessage = e => onData && onData(JSON.parse(e.data));
  pc.ontrack = e => {
    const audio = document.getElementById('remoteAudio'); audio.srcObject = e.streams[0];
  };
  pc.onicecandidate = e => { if(e.candidate) addDoc(collection(roomRef,'callerCandidates'), e.candidate.toJSON()) };
  if(localStream) localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
  const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
  await setDoc(roomRef, { offer: pc.localDescription.toJSON(), createdAt: Date.now() });
  // listen for answer
  onSnapshot(roomRef, async snap => {
    if(!snap.exists()) return;
    const d = snap.data();
    if(d.answer && !pc.currentRemoteDescription){
      await pc.setRemoteDescription(new RTCSessionDescription(d.answer));
    }
  });
  // listen for answerCandidates
  onSnapshot(collection(roomRef,'answerCandidates'), snap => {
    snap.docChanges().forEach(async ch => { if(ch.type==='added') await pc.addIceCandidate(ch.doc.data()); });
  });
  currentRoomRef = roomRef;
  return roomRef.id;
}

export async function joinRoom(roomId, onData){
  const roomRef = doc(db,'rooms',roomId);
  pc = new RTCPeerConnection(servers);
  pc.ondatachannel = e => { dataChannel = e.channel; dataChannel.onmessage = ev => onData && onData(JSON.parse(ev.data)); };
  pc.ontrack = e => { const audio = document.getElementById('remoteAudio'); audio.srcObject = e.streams[0]; };
  pc.onicecandidate = e => { if(e.candidate) addDoc(collection(roomRef,'answerCandidates'), e.candidate.toJSON()); };
  if(localStream) localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
  // listen for offer
  onSnapshot(roomRef, async rs => {
    if(!rs.exists()) return;
    const d = rs.data();
    if(d.offer && !pc.currentRemoteDescription){
      await pc.setRemoteDescription(new RTCSessionDescription(d.offer));
      const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
      await setDoc(roomRef, { answer: pc.localDescription.toJSON() }, { merge:true });
    }
  });
  // load callerCandidates
  onSnapshot(collection(roomRef,'callerCandidates'), snap => {
    snap.docChanges().forEach(async ch => { if(ch.type==='added') await pc.addIceCandidate(ch.doc.data()); });
  });
  currentRoomRef = roomRef;
  return roomId;
}

export function sendData(obj){
  if(dataChannel && dataChannel.readyState === 'open') dataChannel.send(JSON.stringify(obj));
}

export async function startVoice(){
  if(localStream) return;
  localStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:false });
  const la = document.getElementById('localAudio') || (()=>{
    const a=document.createElement('audio'); a.id='localAudio'; a.autoplay=true; a.muted=true; a.srcObject=localStream; document.body.appendChild(a); return a;
  })();
  if(pc) localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
}

export function stopVoice(){
  if(!localStream) return;
  localStream.getTracks().forEach(t => t.stop());
  localStream = null;
  const a = document.getElementById('localAudio'); if(a) a.remove();
}

export async function leaveRoom(){
  if(currentRoomRef){
    try { await setDoc(currentRoomRef, {}, { merge:true }); } catch(e){}
    currentRoomRef = null;
  }
  if(pc){ pc.close(); pc = null; dataChannel = null; }
}
