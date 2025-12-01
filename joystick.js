// joystick.js - minimal touch joystick
export function createJoystick(container){
  const el = container;
  el.style.display = 'block';
  el.style.touchAction = 'none';
  el.style.position = 'relative';
  let active=false, startX=0,startY=0,dx=0,dy=0;
  const radius = 56;
  const knob = document.createElement('div');
  knob.style.position='absolute'; knob.style.left='50%'; knob.style.top='50%';
  knob.style.width='48px'; knob.style.height='48px'; knob.style.margin='-24px 0 0 -24px';
  knob.style.borderRadius='50%'; knob.style.background='rgba(255,255,255,0.06)';
  knob.style.transform='translate(0,0)';
  el.appendChild(knob);

  el.addEventListener('pointerdown', e=>{
    active=true; startX=e.clientX; startY=e.clientY;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e=>{
    if(!active) return;
    dx = e.clientX - startX; dy = e.clientY - startY;
    const len = Math.hypot(dx,dy) || 1;
    const nx = (dx/len) * Math.min(len, radius);
    const ny = (dy/len) * Math.min(len, radius);
    knob.style.transform = `translate(${nx}px, ${ny}px)`;
  });
  el.addEventListener('pointerup', e=>{
    active=false; dx=0; dy=0; knob.style.transform='translate(0,0)';
  });

  function getVector(){
    return { x: dx / radius, y: dy / radius, magnitude: Math.min(1, Math.hypot(dx,dy)/radius) };
  }
  return { getVector };
}
