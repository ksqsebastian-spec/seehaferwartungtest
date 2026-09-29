(() => {
  const projects=window.SEEHAFER_PROJECTS, track=document.querySelector('#library-track'), dialog=document.querySelector('#project-dialog');
  let active=0;
  projects.forEach((project,index)=>{
    const button=document.createElement('button');button.className='library-card';button.dataset.index=index;button.setAttribute('aria-label',`${project.title}: ansehen`);
    const image=document.createElement('img');image.src=project.image;image.alt=project.alt;image.loading='lazy';
    const caption=document.createElement('span');caption.className='library-caption';const category=document.createElement('small');category.textContent=project.category;const title=document.createElement('strong');title.textContent=project.title;
    const arrow=document.createElement('i');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');caption.append(category,title,arrow);button.append(image,caption);track.append(button);
    button.addEventListener('click',()=>{active=index;document.querySelector('#detail-image').src=project.image;document.querySelector('#detail-image').alt=project.alt;document.querySelector('#detail-title').textContent=project.title;document.querySelector('#detail-category').textContent=project.category;document.querySelector('#detail-description').textContent=project.detail;const facts=document.querySelector('#detail-facts');facts.replaceChildren();project.facts.forEach(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);facts.append(row);});dialog.showModal();dialog.scrollTop=0;});
  });
  document.querySelector('#project-inquiry').addEventListener('click',()=>{dialog.close();openInquiry();});
  const sync=()=>document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));const observer=new MutationObserver(sync);document.querySelectorAll('dialog').forEach(d=>observer.observe(d,{attributes:true,attributeFilter:['open']}));
})();
