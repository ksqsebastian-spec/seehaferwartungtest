(() => {
  const projects=window.SEEHAFER_PROJECTS;
  const sheet=document.querySelector('#project-sheet');
  const dialog=document.querySelector('#project-dialog');
  const tabs=[...document.querySelectorAll('[data-project]')];
  const reduce=()=>document.body.classList.contains('motion-off');
  let active=0,animationTimer;
  function selectProject(index,focus=false){
    active=(index+projects.length)%projects.length;
    const p=projects[active];
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===active));tab.tabIndex=i===active?0:-1;});
    sheet.setAttribute('aria-labelledby',`project-tab-${active}`);
    sheet.style.setProperty('--project-color',p.color);
    const img=document.querySelector('#project-photo');img.src=p.image;img.alt=p.alt;
    sheet.querySelector('.project-photo').setAttribute('aria-label',p.title+': Projekt ansehen');
    for(const key of ['title','category','number','unit','summary'])document.querySelector('#project-'+key).textContent=p[key];
    document.querySelector('#project-count').textContent=`0${active+1} / 03`;
    sheet.classList.remove('is-switching');
    clearTimeout(animationTimer);
    if(!reduce()){void sheet.offsetWidth;sheet.classList.add('is-switching');animationTimer=setTimeout(()=>sheet.classList.remove('is-switching'),700);}
    if(focus)tabs[active].focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>selectProject(i));
    tab.addEventListener('keydown',e=>{let target;if(e.key==='ArrowRight')target=active+1;if(e.key==='ArrowLeft')target=active-1;if(e.key==='Home')target=0;if(e.key==='End')target=projects.length-1;if(target!==undefined){e.preventDefault();selectProject(target,true);}});
  });
  document.querySelector('#project-prev').addEventListener('click',()=>selectProject(active-1));
  document.querySelector('#project-next').addEventListener('click',()=>selectProject(active+1));
  function openProject(){
    const p=projects[active];document.querySelector('#detail-image').src=p.image;document.querySelector('#detail-image').alt=p.alt;
    document.querySelector('#detail-title').textContent=p.title;document.querySelector('#detail-category').textContent=p.category;
    document.querySelector('#detail-description').textContent=p.detail;
    const facts=document.querySelector('#detail-facts');facts.replaceChildren();
    p.facts.forEach(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);facts.append(row);});
    dialog.showModal();dialog.scrollTop=0;
  }
  document.querySelectorAll('[data-project-open]').forEach(b=>b.addEventListener('click',openProject));
  document.querySelector('#project-inquiry').addEventListener('click',()=>{dialog.close();openInquiry();});
  const photo=sheet.querySelector('.project-photo');
  photo.addEventListener('pointermove',e=>{if(reduce()||e.pointerType!=='mouse')return;const r=photo.getBoundingClientRect();photo.style.setProperty('--photo-x',`${(e.clientX-r.left-r.width/2)/100}px`);photo.style.setProperty('--photo-y',`${(e.clientY-r.top-r.height/2)/100}px`);});
  photo.addEventListener('pointerleave',()=>{photo.style.setProperty('--photo-x','0px');photo.style.setProperty('--photo-y','0px');});
  let queued=false;const progress=()=>{queued=false;const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--reading',max>0?Math.min(1,Math.max(0,scrollY/max)):0);};
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(progress);}},{passive:true});addEventListener('resize',progress);progress();
  const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;if(!reduce())target.classList.add('is-entering');observer.unobserve(target);}),{threshold:.15});
  document.querySelectorAll('.proof-intro,.reference-showcase,.intro,.follow-through h2,.follow-through p,.personal-contact,.faq,.closing').forEach(el=>observer.observe(el));
  // Stop ornamental loops outside the viewport; pause control and reduced-motion remain authoritative.
  const motionObserver=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.querySelectorAll('.door-leaf,.folder-art i,.cycle-illustration .orbit,.cycle-illustration .tick').forEach(el=>el.style.animationPlayState=isIntersecting?'running':'paused')));
  document.querySelectorAll('.feature-stage,.follow-through').forEach(el=>motionObserver.observe(el));
  // Focus and scroll lock stay consistent for every modal, including native Escape closure.
  const syncDialogs=()=>{document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));};
  const modalObserver=new MutationObserver(syncDialogs);document.querySelectorAll('dialog').forEach(d=>modalObserver.observe(d,{attributes:true,attributeFilter:['open']}));
})();
