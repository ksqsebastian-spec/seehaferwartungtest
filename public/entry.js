// Keep a fresh homepage arrival at the hero while the browser restores layout.
// Yield immediately to real input: never fight a visitor who starts scrolling.
(() => {
 const url=new URL(location.href);
 url.searchParams.delete('v');url.hash='';history.replaceState(null,'',url.pathname+url.search);
 history.scrollRestoration='manual';

 let active=true,frame=0,deadline=performance.now()+8000;
 const root=document.documentElement;
 root.classList.add('entry-settling');
 const stop=()=>{active=false;cancelAnimationFrame(frame);root.classList.remove('entry-settling');};
 const top=()=>{if(active&&scrollY!==0)window.scrollTo({top:0,left:0,behavior:'instant'});};
 const tick=()=>{if(!active)return;if(performance.now()>deadline){stop();return;}top();frame=requestAnimationFrame(tick);};
 ['wheel','touchstart','pointerdown','keydown'].forEach(name=>addEventListener(name,stop,{capture:true,passive:true,once:true}));

 addEventListener('scroll',top,{passive:true});
 addEventListener('pageshow',()=>{if(active){deadline=performance.now()+4000;top();}},{once:true});
 addEventListener('DOMContentLoaded',top,{once:true});
 top();frame=requestAnimationFrame(tick);
})();
