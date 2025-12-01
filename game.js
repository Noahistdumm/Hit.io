// game.js - Three.js FPS core
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { inputState } from './input.js';
import { publishLocalState } from './multiplayer.js';

export let localPlayer = { x:0,z:0,rotY:0,hp:100,ammo:30,nick:'Spieler',skin:'soldier',score:0 };

const remotePlayers = new Map();
let renderer, scene, camera, clock, weaponMesh;

export function initThree(){
  const canvas = document.getElementById('glCanvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x041018);

  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 2000);
  camera.position.set(0,1.6,0);
  scene.add(camera);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  scene.add(light);

  // floor
  const g = new THREE.PlaneGeometry(2000,2000);
  const m = new THREE.MeshStandardMaterial({ color:0x0b1620 });
  const floor = new THREE.Mesh(g,m); floor.rotation.x = -Math.PI/2; scene.add(floor);

  // weapon box in front of camera
  const wGeo = new THREE.BoxGeometry(0.3,0.15,0.6);
  const wMat = new THREE.MeshStandardMaterial({ color:0x202020 });
  weaponMesh = new THREE.Mesh(wGeo, wMat);
  weaponMesh.position.set(0.4,-0.3,-0.6);
  camera.add(weaponMesh);

  clock = new THREE.Clock();
  window.addEventListener('resize', onResize);
  animate();
}

function onResize(){
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function animate(){
  const dt = clock.getDelta();
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

let shotCooldown = 0;
function update(dt){
  const speed = 4.0;
  const mvx = inputState.move.x;
  const mvz = inputState.move.y;
  // apply look (right stick / mouse)
  localPlayer.rotY += inputState.look.x * 2.4;
  // movement in local space
  const forward = -mvz, strafe = mvx;
  const dx = (Math.cos(localPlayer.rotY)*forward + Math.sin(localPlayer.rotY)*strafe) * speed * dt;
  const dz = (Math.sin(localPlayer.rotY)*forward - Math.cos(localPlayer.rotY)*strafe) * speed * dt;
  localPlayer.x += dx; localPlayer.z += dz;
  camera.position.set(localPlayer.x, 1.6, localPlayer.z);
  camera.rotation.y = localPlayer.rotY;

  // shooting
  shotCooldown -= dt*1000;
  if(inputState.shooting && localPlayer.ammo > 0 && shotCooldown <= 0){
    shotCooldown = 150; // ms
    localPlayer.ammo = Math.max(0, localPlayer.ammo-1);
    raycastShoot();
  }

  // publish state
  publishLocalState(localPlayer);

  // update HUD values
  const hpEl = document.getElementById('hp');
  const ammoEl = document.getElementById('ammoN');
  const scoreEl = document.getElementById('scoreN');
  if(hpEl) hpEl.textContent = Math.round(localPlayer.hp);
  if(ammoEl) ammoEl.textContent = Math.round(localPlayer.ammo);
  if(scoreEl) scoreEl.textContent = Math.round(localPlayer.score);
}

function raycastShoot(){
  // naive - check remotePlayers map for close players in front
  const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  const origin = camera.position.clone();
  for(const [id, rp] of remotePlayers){
    const pos = new THREE.Vector3(rp.data.x, 1.6, rp.data.z);
    const d = pos.clone().sub(origin);
    const dist = d.length();
    const angle = d.normalize().angleTo(dir);
    if(dist < 60 && angle < 0.18){
      rp.data.hp = Math.max(0, (rp.data.hp||100) - 20);
      // Ideally call server/cloud function to validate hit and update remote doc.
    }
  }
}

export function addOrUpdateRemotePlayer(id, data){
  if(!remotePlayers.has(id)){
    const geo = new THREE.SphereGeometry(0.35,8,8);
    const mat = new THREE.MeshStandardMaterial({ color:0xffcc66 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(data.x, 1.0, data.z);
    scene.add(mesh);
    remotePlayers.set(id, { mesh, data });
  } else {
    const entry = remotePlayers.get(id);
    entry.data = data;
    entry.mesh.position.set(data.x, 1.0, data.z);
  }
}
export function removeRemotePlayer(id){
  const p = remotePlayers.get(id);
  if(p){ scene.remove(p.mesh); remotePlayers.delete(id); }
}
