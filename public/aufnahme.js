import {sections,allFields,validateIntake} from './intake-schema.js';
const $=s=>document.querySelector(s),form=$('#intake'),preview=new URLSearchParams(location.search).get('preview')==='1';
let attachments=[],attachmentNames=[],uploadPending=false;
const token=new URLSearchParams(location.hash.slice(1)).get('token')||'';
let step=0,pending=null,submitted=false;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
sections.forEach((section,index)=>{
 const page=node('section');page.dataset.step=index;page.hidden=index!==0;page.append(node('h2',section.title),node('p',section.intro));
 section.fields.forEach(([key,label,type,required,choices])=>{
 const field=node(type==='checks'?'fieldset':'label',null,'field');field.dataset.field=key;field.append(node(type==='checks'?'legend':'span',label+(required?' *':'')));
 if(type==='checks'){
  const opts=node('div',null,'options');choices.forEach(value=>{const l=node('label'),i=node('input');i.type='checkbox';i.name=key;i.value=value;l.append(i,document.createTextNode(value));opts.append(l);});field.append(opts);
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
 });if(index===3){const label=node('label',null,'field');label.append(node('span','Unterlagen hinzufügen (optional)'),node('p','Bis zu 3 PDF-, JPG- oder PNG-Dateien, zusammen max. 5 MB. Bitte keine Bewohnerlisten oder Zugangsdaten.','small'));const upload=node('input');upload.type='file';upload.multiple=true;upload.accept='.pdf,.jpg,.jpeg,.png';upload.id='documents-upload';const status=node('p',null,'small');upload.onchange=async()=>{attachments=[];attachmentNames=[];uploadPending=true;$('#next').disabled=true;const files=[...upload.files];if(files.length>3||files.reduce((n,f)=>n+f.size,0)>5*1024*1024){upload.value='';status.textContent='Bitte höchstens 3 Dateien mit insgesamt 5 MB wählen.';uploadPending=false;$('#next').disabled=false;return;}try{attachments=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({content:reader.result.split(',')[1]});reader.onerror=reject;reader.readAsDataURL(file);})));attachmentNames=files.map(f=>f.name);status.textContent=attachmentNames.join(' · ');}catch{attachments=[];upload.value='';status.textContent='Dateien konnten nicht gelesen werden. Bitte erneut wählen.';}finally{uploadPending=false;$('#next').disabled=false;}};label.append(upload,status);page.append(label);}$('#steps').append(page);
});
function values(){const fd=new FormData(form),data={};allFields.forEach(([key])=>{data[key]=fd.get(key)||'';});for(const [key,,type]of allFields)if(type==='checks')data[key]=fd.getAll(key);return data;}
function conditional(){const data=values();for(const k of ['siteName','sitePhone','siteEmail'])$(`[data-field=${k}]`).hidden=data.siteContact!=='Hausmeister / andere Person';for(const k of ['callDate','callWindow'])$(`[data-field=${k}]`).hidden=data.nextStep!=='Bitte zu meiner Wunschzeit anrufen';}
form.addEventListener('change',conditional);conditional();
function errorsFor(index){const {errors}=validateIntake(values());return Object.fromEntries(Object.entries(errors).filter(([key])=>sections[index]?.fields.some(f=>f[0]===key)));}
function showErrors(errors){document.querySelectorAll('.field-error').forEach(e=>e.textContent='');document.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));for(const[key,text]of Object.entries(errors)){const f=$(`[data-field=${key}]`);f.hidden=false;f.querySelector('.field-error').textContent=text;f.querySelector('input,select,textarea')?.setAttribute('aria-invalid','true');}Object.keys(errors).length&&$(`[data-field=${Object.keys(errors)[0]}]`).querySelector('input,select,textarea')?.focus();}
function review(){const data=values();$('#review-content').replaceChildren(...sections.map((s,i)=>{const wrap=node('div',null,'review-group'),edit=node('button','Bearbeiten');edit.type='button';edit.onclick=()=>go(i);wrap.append(node('h3',s.title),edit);const dl=node('dl');s.fields.forEach(([key,label])=>{if($(`[data-field=${key}]`).hidden)return;const value=data[key];dl.append(node('dt',label),node('dd',Array.isArray(value)?value.join(', ')||'Noch offen':value||'Noch offen'));});if(i===3)dl.append(node('dt','Beigefügte Dateien'),node('dd',attachmentNames.join(' · ')||'Keine'));wrap.append(dl);return wrap;}));}
function go(index){step=index;document.querySelectorAll('[data-step]').forEach(e=>e.hidden=+e.dataset.step!==step);$('#review').hidden=step!==5;$('#back').hidden=step===0;$('#next').hidden=step===5;$('#submit').hidden=step!==5;$('#progress').value=step+1;$('#progress-label').textContent=`Schritt ${step+1} von 6`;$('#error').textContent='';if(step===5)review();if(index!==0){const h=step===5?$('#review h2'):$(`[data-step="${step}"] h2`);h.tabIndex=-1;h.focus({preventScroll:true});$('.panel').scrollIntoView({behavior:'auto',block:'start'});}}
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
go(0);
if(preview){$('#preview').hidden=false;form.hidden=false;}else if(token){try{const r=await fetch('/api/intake/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});if(!r.ok)throw Error();form.hidden=false;}catch{$('#blocked').hidden=false;}}else{$('#blocked').hidden=false;}
// Keep the invitation fragment intact when opening the privacy explanation.
document.querySelector('a[href="#privacy"]').addEventListener('click',event=>{event.preventDefault();document.querySelector('#privacy details').open=true;document.querySelector('#privacy').scrollIntoView({behavior:'smooth'});});
