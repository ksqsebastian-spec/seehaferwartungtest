import {sections as schemaSections,allFields,validateIntake} from './intake-schema.js';
const sections=[
 {title:'Um welches Gebäude geht es?',intro:'Starten wir mit Ihrem Objekt. Weitere Details können Sie später ergänzen.',fields:schemaSections[0].fields.filter(f=>['address','building','parts'].includes(f[0]))},
 {title:'Wie erreichen wir Sie?',intro:'Damit wir Ihre Wartung mit der richtigen Person abstimmen.',fields:schemaSections[0].fields.filter(f=>!['address','building','parts'].includes(f[0]))},
 ...schemaSections.slice(1)
];
const reviewStep=sections.length;
const $=s=>document.querySelector(s),form=$('#intake'),preview=new URLSearchParams(location.search).get('preview')==='1';
let attachments=[],attachmentNames=[],uploadPending=false;
const token=new URLSearchParams(location.hash.slice(1)).get('token')||'';
let step=0,pending=null,submitted=false;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
function choiceIcon(key,value){
 const paths=key==='building'?(value==='Wohngebäude'?'<path d="m4 12 12-9 12 9v16H4Z M12 28V17h8v11"/>':value==='Hotel'?'<path d="M5 28V5h22v23M3 28h26M11 10h2m6 0h2m-10 6h2m6 0h2M13 28v-6h6v6"/>':value==='Kita / Schule'?'<path d="M3 28h26M6 28V12l10-8 10 8v16M12 28v-8h8v8M14 12h4"/>':value==='Pflege / Klinik'?'<path d="M5 28V8h22v20M12 28v-7h8v7M16 10v7m-4-3h8"/>':'<path d="M5 28V4h22v24M11 9h2m6 0h2m-10 6h2m6 0h2m-10 6h2m6 0h2M3 28h26"/>'):(value==='Weiß ich nicht'?'<circle cx="16" cy="16" r="12"/><path d="M12 12c0-5 9-5 9 0 0 3-5 3-5 7m0 4v1"/>':value==='Fenster'?'<rect x="5" y="4" width="22" height="24" rx="1"/><path d="M16 4v24M5 16h22"/>':'<path d="M6 28V4h20v24M4 28h24M11 27V8h11v19M18 17v3"/>');
 return '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';
}
sections.forEach((section,index)=>{
 const page=node('section');page.dataset.step=index;page.hidden=index!==0;page.append(node('h2',section.title),node('p',section.intro));
 section.fields.forEach(([key,label,type,required,choices])=>{
 const cards=type==='checks'||['building','role','siteContact','coordination','nextStep','callWindow','cycle'].includes(key);
 const field=node(cards?'fieldset':'label',null,'field');field.dataset.field=key;field.append(node(cards?'legend':'span',label+(required?' *':'')));
 if(cards){
  const opts=node('div',null,'options');opts.dataset.choice=key;choices.forEach(value=>{const l=node('label'),i=node('input');i.type=type==='checks'?'checkbox':'radio';i.name=key;i.value=value;l.append(i);if(key==='building'||key==='systems'){const icon=node('span',null,'choice-icon');icon.setAttribute('aria-hidden','true');icon.innerHTML=choiceIcon(key,value);l.append(icon);}l.append(node('span',value));opts.append(l);});field.append(opts);
 }else{
  const input=node(type==='select'?'select':type==='textarea'?'textarea':'input');input.name=key;input.id='field-'+key;
  if(type==='select'){const o=node('option','Bitte wählen');o.value='';input.append(o,...choices.map(v=>{const o=node('option',v);o.value=v;return o;}));}
  else if(type!=='textarea')input.type=type;
  input.required=required;input.maxLength=type==='textarea'?1800:250;
  if(['name','email','phone','company'].includes(key))input.autocomplete=({phone:'tel',company:'organization'})[key]||key;
  if(key==='count')input.placeholder='z. B. ca. 30 – oder unbekannt';
  if(key==='recipient')input.placeholder='z. B. Eigentümergemeinschaft / Firma';
  field.append(input);
 }
 const error=node('small',null,'field-error');error.id='error-'+key;field.append(error);field.querySelectorAll('input,select,textarea').forEach(el=>el.setAttribute('aria-describedby',error.id));page.append(field);
 });
 const optionalKeys=[['parts'],[],['manufacturers','lastMaintenance','deadline','deadlineReason','issues','existingContract','contractEnd'],['access','workHours','notice','constraints'],['billingAddress','billingEmail','reference','approval','cycle'],['notes']][index];
 const details=node('details',null,'optional-details');details.append(node('summary',['Gebäudeteile ergänzen','Weitere Angaben','Technische Details ergänzen','Zugang und Ablauf ergänzen','Abrechnung und Betreuung ergänzen','Noch eine Nachricht hinzufügen'][index]));optionalKeys.forEach(key=>details.append(page.querySelector(`[data-field=${key}]`)));if(optionalKeys.length)page.append(details);
 if(index===4){const label=node('label',null,'field');label.append(node('span','Unterlagen hinzufügen (optional)'),node('p','Bis zu 3 PDF-, JPG- oder PNG-Dateien, zusammen max. 5 MB. Bitte keine Bewohnerlisten oder Zugangsdaten.','small'));const upload=node('input');upload.type='file';upload.multiple=true;upload.accept='.pdf,.jpg,.jpeg,.png';upload.id='documents-upload';const status=node('p',null,'small');upload.onchange=async()=>{attachments=[];attachmentNames=[];uploadPending=true;$('#next').disabled=true;const files=[...upload.files];if(files.length>3||files.reduce((n,f)=>n+f.size,0)>5*1024*1024){upload.value='';status.textContent='Bitte höchstens 3 Dateien mit insgesamt 5 MB wählen.';uploadPending=false;$('#next').disabled=false;return;}try{attachments=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({content:reader.result.split(',')[1]});reader.onerror=reject;reader.readAsDataURL(file);})));attachmentNames=files.map(f=>f.name);status.textContent=attachmentNames.join(' · ');}catch{attachments=[];upload.value='';status.textContent='Dateien konnten nicht gelesen werden. Bitte erneut wählen.';}finally{uploadPending=false;$('#next').disabled=false;}};label.append(upload,status);page.append(label);}$('#steps').append(page);
});
function values(){const fd=new FormData(form),data={};allFields.forEach(([key])=>{data[key]=fd.get(key)||'';});for(const [key,,type]of allFields)if(type==='checks')data[key]=fd.getAll(key);return data;}
function conditional(){const data=values();for(const k of ['siteName','sitePhone','siteEmail'])$(`[data-field=${k}]`).hidden=data.siteContact!=='Hausmeister / andere Person';for(const k of ['callDate','callWindow'])$(`[data-field=${k}]`).hidden=data.nextStep!=='Bitte zu meiner Wunschzeit anrufen';}
form.addEventListener('change',event=>{const el=event.target;if(el.type==='checkbox'&&['systems','documents'].includes(el.name)&&el.checked){const unknown=el.name==='systems'?'Weiß ich nicht':'Keine / unbekannt';form.querySelectorAll(`input[name=${el.name}]`).forEach(other=>{if(other!==el&&(el.value===unknown||other.value===unknown))other.checked=false;});}conditional();});conditional();
function errorsFor(index){const {errors}=validateIntake(values());return Object.fromEntries(Object.entries(errors).filter(([key])=>sections[index]?.fields.some(f=>f[0]===key)));}
function showErrors(errors){document.querySelectorAll('.field-error').forEach(e=>e.textContent='');document.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));for(const[key,text]of Object.entries(errors)){const f=$(`[data-field=${key}]`);f.hidden=false;if(f.closest('details'))f.closest('details').open=true;f.querySelector('.field-error').textContent=text;f.querySelector('input,select,textarea')?.setAttribute('aria-invalid','true');}Object.keys(errors).length&&$(`[data-field=${Object.keys(errors)[0]}]`).querySelector('input,select,textarea')?.focus();}
function review(){const data=values();$('#review-content').replaceChildren(...sections.map((s,i)=>{const wrap=node('div',null,'review-group'),edit=node('button','Bearbeiten');edit.type='button';edit.onclick=()=>go(i);wrap.append(node('h3',s.title),edit);const dl=node('dl');s.fields.forEach(([key,label])=>{if($(`[data-field=${key}]`).hidden)return;const value=data[key];if(!value||(Array.isArray(value)&&!value.length))return;dl.append(node('dt',label),node('dd',Array.isArray(value)?value.join(', ')||'Noch offen':value||'Noch offen'));});if(i===4)dl.append(node('dt','Beigefügte Dateien'),node('dd',attachmentNames.join(' · ')||'Keine'));wrap.append(dl);return wrap;}));}
function go(index){step=index;furthest=Math.max(furthest,step);document.querySelectorAll('.step-link').forEach((b,i)=>{b.classList.toggle('current',i===step);b.classList.toggle('complete',i<step);b.setAttribute('aria-current',i===step?'step':'false');b.disabled=i>furthest;});furthest=Math.max(furthest,step);document.querySelectorAll('[data-step]').forEach(e=>e.hidden=+e.dataset.step!==step);$('#review').hidden=step!==reviewStep;$('#back').hidden=step===0;$('#next').hidden=step===reviewStep;$('#submit').hidden=step!==reviewStep;$('#progress').max=sections.length+1;$('#progress').value=step+1;$('#progress-label').textContent=`Schritt ${step+1} von ${sections.length+1}`;$('#error').textContent='';if(step===reviewStep)review();if(document.activeElement!==document.body){const h=step===reviewStep?$('#review h2'):$(`[data-step="${step}"] h2`);h.tabIndex=-1;h.focus({preventScroll:true});$('.panel').scrollIntoView({behavior:'auto',block:'start'});}}
$('#next').onclick=()=>{const errors=errorsFor(step);showErrors(errors);if(!Object.keys(errors).length)go(step+1);};$('#back').onclick=()=>go(step-1);
$('#print').onclick=()=>window.print();window.addEventListener('beforeunload',e=>{if(!submitted&&form.querySelector('[name=name]').value){e.preventDefault();e.returnValue='';}});
form.noValidate=true;
form.addEventListener('submit',async e=>{
 e.preventDefault();if($('#submit').disabled||uploadPending)return;const data=values(),{errors}=validateIntake(data);
 if(Object.keys(errors).length){go(sections.findIndex(s=>s.fields.some(f=>f[0]===Object.keys(errors)[0])));showErrors(errors);return;}
 if(!$('#accuracy').checked){$('#error').textContent='Bitte bestätigen Sie die Weitergabe der Kontaktdaten und die Datenschutzhinweise.';$('#accuracy').focus();return;}
 if(preview){$('#error').textContent='Vorschau: Ihre Angaben sind vollständig. Es wird nichts gesendet.';return;}
 const fingerprint=JSON.stringify({data,attachments});if(!pending||pending.fingerprint!==fingerprint)pending={fingerprint,requestId:crypto.randomUUID()};$('#submit').disabled=true;$('#submit').textContent='Wird gesendet …';$('#error').textContent='';
 try{const response=await fetch('/api/intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,data,attachments,consent:true,website:new FormData(form).get('website'),requestId:pending.requestId}),signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Bitte versuchen Sie es erneut.');submitted=true;form.hidden=true;$('#success').hidden=false;$('#receipt').textContent='Vorgang: '+result.reference;$('#success').focus();}
 catch(error){$('#error').textContent=error.name==='TimeoutError'||error.name==='TypeError'?'Der Versand konnte nicht bestätigt werden. Ihre Angaben bleiben erhalten. Bitte versuchen Sie es erneut.':error.message;}
 finally{$('#submit').disabled=false;$('#submit').textContent='Angaben senden ↗';}
});
let furthest=0;const stepNames=['Objekt','Kontakt','Anlagen','Zugang','Angebot','Rückmeldung','Prüfen'];const stepNav=node('nav',null,'step-nav');stepNav.setAttribute('aria-label','Abschnitte der Objektaufnahme');stepNames.forEach((label,i)=>{const b=node('button',null,'step-link');b.type='button';b.append(node('span',String(i+1).padStart(2,'0'),'step-dot'),node('span',label));b.onclick=()=>go(i);stepNav.append(b);});document.querySelector('main').before(stepNav);
go(0);
if(preview){$('#preview').hidden=false;form.hidden=false;}else if(token){try{const r=await fetch('/api/intake/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});if(!r.ok)throw Error();form.hidden=false;}catch{$('#blocked').hidden=false;}}else{$('#blocked').hidden=false;}
// Keep the invitation fragment intact when opening the privacy explanation.
document.querySelector('a[href="#privacy"]').addEventListener('click',event=>{event.preventDefault();document.querySelector('#privacy details').open=true;document.querySelector('#privacy').scrollIntoView({behavior:'smooth'});});
