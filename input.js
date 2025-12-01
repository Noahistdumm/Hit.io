// input.js
import { createJoystick } from './joystick.js';

export const inputState = {
  move:{x:0,y:0},
  look:{x:0,y:0},
  shooting:false,
  mobile:false
};

let leftStick, rightStick;

export function initInput(onPointerLockRequested){
  const canvas = document.getElementById('glCanvas');
  // keyboard / mouse
  window.addEventListener('keydown', e => {
    if(e.key === 'w') inputState.move.y = -1;
    if(e.key === 's') inputState.move.y = 1;
    if(e.key === 'a') inputState.move.x = -1;
    if(e.key === 'd') inputState.move.x = 1;
    if(e.key === ' ') inputState.shooting = true;
  });
  window.addEventListener('keyup', e => {
    if(['w','s'].includes(e.key)) inputState.move.y = 0;
    if(['a','d'].includes(e.key)) inputState.move.x = 0;
    if(e.key === ' ') inputState.shooting = false;
  });

  canvas.addEventListener('click', ()=> onPointerLockRequested && onPointerLockRequested() );

  // detect mobile
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if(isTouch){
    inputState.mobile = true;
    const left = document.getElementById('touch-left');
    const right = document.getElementById('touch-right');
    left.style.display = right.style.display = 'block';
    left.style.zIndex = right.style.zIndex = 46;
    leftStick = createJoystick(left);
    rightStick = createJoystick(right);

    setInterval(()=>{
      const mv = leftStick.getVector();
      inputState.move.x = mv.x; inputState.move.y = mv.y;
      const lk = rightStick.getVector();
      inputState.look.x = lk.x; inputState.look.y = lk.y;
      // Auto-shoot when right stick used (magnitude threshold)
      inputState.shooting = (lk.magnitude > 0.25);
    }, 40);
  } else {
    // pointer lock look
    function onMouseMove(e){
      inputState.look.x += e.movementX * 0.002;
      inputState.look.y += e.movementY * 0.002;
    }
    document.addEventListener('pointerlockchange', ()=>{
      const locked = document.pointerLockElement === canvas;
      if(locked) document.addEventListener('mousemove', onMouseMove);
      else document.removeEventListener('mousemove', onMouseMove);
    });
    canvas.addEventListener('mousedown', ()=> inputState.shooting = true);
    canvas.addEventListener('mouseup', ()=> inputState.shooting = false);
  }
}
