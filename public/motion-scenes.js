/* Portable scene controller. Content is HTML; motion is driven by scroll or a single replay. */
(() => {
 const chapters=[...document.querySelectorAll('.process-chapter')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n));
 const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 let frame=0, replay=null;
 const set=(el,p)=>{
  el.style.setProperty('--p',p.toFixed(4));
  el.style.setProperty('--a',ease(p/.38).toFixed(4));
  el.style.setProperty('--b',ease((p-.25)/.4).toFixed(4));
  el.style.setProperty('--c',ease((p-.58)/.35).toFixed(4));
  el.style.setProperty('--swing',Math.sin(clamp((p-.12)/.74)*Math.PI).toFixed(4));
 };
 function render(now){
  frame=0;const still=reduce.matches||document.body.classList.contains('motion-off');
  chapters.forEach(el=>{
   const r=el.getBoundingClientRect();
   let p=clamp((innerHeight*.65-r.top)/(r.height-innerHeight*.25));
   if(replay?.el===el)p=clamp((now-replay.start)/3200);
   set(el,still?1:p);
  });
  if(replay&&now-replay.start<3200&&!still)frame=requestAnimationFrame(render);
 }
 const update=()=>{if(!frame)frame=requestAnimationFrame(render);};
 addEventListener('scroll',()=>{replay=null;update();},{passive:true});
 addEventListener('resize',update);reduce.addEventListener('change',update);
 new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['class']});
 chapters.forEach(el=>el.querySelector('.scene-replay').addEventListener('click',()=>{replay={el,start:performance.now()};update();}));
 update();
})();
