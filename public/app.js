const $=s=>document.querySelector(s);const reduced=matchMedia('(prefers-reduced-motion: reduce)');let motion=!reduced.matches;const video=$('#hero-video'),toggle=$('#motion-toggle');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function progress(el){const r=el.getBoundingClientRect();return clamp(-r.top/(r.height-innerHeight))}
function animate(){document.body.classList.toggle('scrolled',scrollY>100);document.body.classList.toggle('past-hero',scrollY>innerHeight*.85);if(!motion)return;



}
function applyMotion(){document.body.classList.toggle('motion-off',!motion);toggle.textContent=motion?'Ⅱ':'▷';toggle.setAttribute('aria-label',motion?'Animationen pausieren':'Animationen abspielen');document.querySelectorAll('video').forEach(v=>{v.playbackRate=1.45;if(motion)v.play().catch(()=>{});else v.pause()});animate()}
applyMotion();toggle.addEventListener('click',()=>{motion=!motion;applyMotion()});reduced.addEventListener('change',e=>{motion=!e.matches;applyMotion()});let frame=false;addEventListener('scroll',()=>{if(frame)return;frame=true;requestAnimationFrame(()=>{animate();frame=false})},{passive:true});addEventListener('resize',animate);
const inquiry=$('#inquiry');function openInquiry(email=''){$('#inquiry-form').hidden=false;$('#inquiry-title').hidden=false;$('#email-ready').hidden=true;$('#inquiry-error').textContent='';if(email)$('#inquiry-form [name=email]').value=email;inquiry.showModal();requestAnimationFrame(()=>$('#inquiry-form [name=address]').focus())}
document.querySelectorAll('[data-inquiry]').forEach(b=>b.addEventListener('click',()=>openInquiry()));document.querySelectorAll('.email-start').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();openInquiry(form.querySelector('input').value)}));document.querySelectorAll('dialog .close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
let pendingInquiry=null;
$('#inquiry-form').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.target,button=form.querySelector('button[type=submit]');
  if(button.disabled)return;
  const d=new FormData(form),payload={address:String(d.get('address')||'').trim(),email:String(d.get('email')||'').trim(),caretaker:String(d.get('caretaker')||'').trim(),website:String(d.get('website')||'')};
  const fingerprint=JSON.stringify(payload);
  if(!pendingInquiry||pendingInquiry.fingerprint!==fingerprint)pendingInquiry={fingerprint,requestId:crypto.randomUUID()};
  button.disabled=true;button.setAttribute('aria-busy','true');button.querySelector('.submit-label').textContent='Wird gesendet …';$('#inquiry-error').textContent='';
  try{
    const res=await fetch('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId:pendingInquiry.requestId}),signal:AbortSignal.timeout(18000)});
    const result=await res.json();
    if(!res.ok||!result.ok)throw new Error(result.error||'Der Versand hat nicht geklappt. Bitte versuchen Sie es erneut.');
    form.hidden=true;$('#email-ready').hidden=false;$('#inquiry-title').hidden=true;$('#sent-reference').textContent='Anfrage '+result.reference.slice(0,8).toUpperCase();$('#sent-close').focus();form.reset();pendingInquiry=null;
  }catch(error){$('#inquiry-error').textContent=error.name==='TimeoutError'||error.name==='TypeError'?'Die Verbindung wurde unterbrochen. Ihre Angaben bleiben erhalten. Bitte versuchen Sie es erneut.':error.message;}
  finally{button.disabled=false;button.removeAttribute('aria-busy');button.querySelector('.submit-label').textContent='Anfrage senden';}
});
$('#sent-close').addEventListener('click',()=>inquiry.close());
$('#privacy-open').addEventListener('click',()=>$('#privacy').showModal());
