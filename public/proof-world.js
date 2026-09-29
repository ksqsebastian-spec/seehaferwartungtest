(() => {
 const library=document.querySelector('.reference-library'),track=document.querySelector('.library-track'),windowEl=document.querySelector('.library-window'),layout=document.querySelector('#library-layout'),chapters=[...document.querySelectorAll('.process-chapter')];
 const clamp=n=>Math.min(1,Math.max(0,n));let queued=false;
 function update(){queued=false;const reduced=document.body.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;const rect=library.getBoundingClientRect();const progress=clamp(-rect.top/(library.offsetHeight-innerHeight));const distance=Math.max(0,track.scrollWidth-windowEl.clientWidth);const all=library.classList.contains('library-expanded')||reduced;
 track.style.transform=all?'none':`translate3d(${-progress*distance}px,0,0)`;library.style.setProperty('--library-progress',progress);document.documentElement.style.setProperty('--reading',scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));
 chapters.forEach(chapter=>{const box=chapter.getBoundingClientRect();const p=clamp((innerHeight*.8-box.top)/(innerHeight*.75));chapter.classList.toggle('chapter-active',box.top<innerHeight*.65&&box.bottom>innerHeight*.3);});
 }
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);new ResizeObserver(schedule).observe(track);new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
 layout.addEventListener('click',()=>{const expanded=library.classList.toggle('library-expanded');layout.setAttribute('aria-pressed',expanded);layout.textContent=expanded?'Scrollansicht ↗':'Alle ansehen ↗';update();});
 track.addEventListener('focusin',event=>{if(event.target.matches(':focus-visible')&&!library.classList.contains('library-expanded')){library.classList.add('library-expanded');layout.setAttribute('aria-pressed','true');layout.textContent='Scrollansicht ↗';update();}});
 update();
})();
