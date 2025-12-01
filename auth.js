// auth.js
import { initAuth, auth } from './firebase.js';

export function startAuth(cb){
  initAuth().then(uid => {
    cb && cb(uid);
  }).catch(e => {
    console.error('auth failed', e);
  });
}
