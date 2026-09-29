import { callbackSlots } from './callback-slots.js?v=calendar2';
const dialog = document.querySelector('#callback'), form = document.querySelector('#callback-form');
const days = document.querySelector('#callback-date'), times = document.querySelector('#callback-times');
let schedule = [], pending;
function updateTiming() {
 const asap=form.querySelector('[name=timing]:checked').value==='asap';
 form.querySelectorAll('[data-scheduled]').forEach(el=>{el.hidden=asap;if(el.tagName==='FIELDSET')el.disabled=asap;});
 document.querySelector('#callback-asap-note').hidden=!asap;
 document.querySelector('#callback-error').textContent='';
}
form.querySelectorAll('[name=timing]').forEach(input=>input.addEventListener('change',updateTiming));
updateTiming();

function options(container, name, values) {
  container.replaceChildren(...values.map((item, i) => {
    const label = document.createElement('label'), input = document.createElement('input'), text = document.createElement('span');
    input.type = 'radio'; input.name = name; input.value = item.value; input.required = true; input.checked = i === 0;
    text.textContent = item.label; label.append(input, text); return label;
  }));
}
let period = '';
const groups = [{id:'morning',label:'Vormittags',from:9,to:12},{id:'noon',label:'Mittags',from:12,to:14},{id:'afternoon',label:'Nachmittags',from:14,to:17}];
function updateTimes() {
 const chosen=schedule.find(day=>day.value===days.value), windows=chosen?.windows||[], previous=form.querySelector('[name=time]:checked')?.value;
 const available=groups.filter(g=>windows.some(w=>+w.value.slice(0,2)>=g.from&&+w.value.slice(0,2)<g.to));
 if(!available.some(g=>g.id===period))period=available[0]?.id||'';
 const periods=document.querySelector('#callback-periods');periods.replaceChildren(...available.map(g=>{const button=document.createElement('button');button.type='button';button.textContent=g.label;button.setAttribute('aria-pressed',g.id===period);button.onclick=()=>{period=g.id;updateTimes();};return button;}));
 const group=available.find(g=>g.id===period), filtered=windows.filter(w=>group&&+w.value.slice(0,2)>=group.from&&+w.value.slice(0,2)<group.to);options(times,'time',filtered);
 if(filtered.some(w=>w.value===previous))times.querySelectorAll('input').forEach(i=>i.checked=i.value===previous);
 const selected=times.querySelector('input:checked');document.querySelector('#callback-suggestion').textContent=selected?'Vorschlag: '+filtered.find(w=>w.value===selected.value).label:'';
 days.setCustomValidity(chosen?'':'Bitte wählen Sie einen kommenden Werktag innerhalb von 60 Tagen.');document.querySelector('#callback-error').textContent=chosen?'':'Für diesen Tag gibt es keine Rückrufzeiten. Bitte wählen Sie einen Werktag.';
}
times.addEventListener('change',()=>{document.querySelector('#callback-suggestion').textContent='Gewählt: '+times.querySelector('input:checked').nextElementSibling.textContent;});
function refresh() { schedule = callbackSlots(); days.min = schedule[0].value; days.max = schedule.at(-1).value; if(!schedule.some(day => day.value === days.value)) days.value = schedule[0].value; updateTimes(); }
days.addEventListener('change', updateTimes);
document.querySelectorAll('[data-callback]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#callback-content').hidden = false; document.querySelector('#callback-success').hidden = true;
  document.querySelector('#callback-error').textContent = ''; refresh(); updateTiming(); dialog.showModal();
}));
document.querySelector('#callback-done').addEventListener('click', () => dialog.close());
form.addEventListener('submit', async event => {
  event.preventDefault(); const button = form.querySelector('button[type=submit]'); if (button.disabled) return;
  const fields = Object.fromEntries(new FormData(form));
  if (fields.timing !== 'asap' && !callbackSlots().find(day => day.value === fields.day)?.windows.some(window => window.value === fields.time)) {
    refresh(); document.querySelector('#callback-error').textContent = 'Das Zeitfenster ist inzwischen vergangen. Bitte wählen Sie erneut.'; return;
  }
  const fingerprint = JSON.stringify(fields);
  if (!pending || pending.fingerprint !== fingerprint) pending = { fingerprint, requestId: crypto.randomUUID() };
  button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Wird gesendet …'; document.querySelector('#callback-error').textContent = '';
  try {
    const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, kind: 'callback', requestId: pending.requestId }), signal: AbortSignal.timeout(18000) });
    const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.error || 'Bitte versuchen Sie es erneut.');
    const selected = schedule.find(day => day.value === fields.day);
    document.querySelector('#callback-summary').textContent = fields.timing === 'asap' ? `So schnell wie möglich · ${fields.phone}` : `${selected.label}, ${selected.windows.find(window => window.value === fields.time).label} · ${fields.phone}`;
    document.querySelector('#callback-summary').nextElementSibling.textContent = fields.timing === 'asap' ? 'Wir haben Ihren Rückrufwunsch erhalten und melden uns so schnell wie möglich während unserer Rückrufzeiten.' : 'Wir haben Ihren Wunsch erhalten. Der Termin ist noch nicht bestätigt.';
    document.querySelector('#callback-content').hidden = true; document.querySelector('#callback-success').hidden = false;
    document.querySelector('#callback-done').focus(); form.reset(); pending = null;
  } catch (error) {
    document.querySelector('#callback-error').textContent = ['TimeoutError', 'TypeError'].includes(error.name) ? 'Die Verbindung wurde unterbrochen. Ihre Angaben bleiben erhalten. Bitte versuchen Sie es erneut.' : error.message;
  } finally { button.disabled = false; button.removeAttribute('aria-busy'); button.innerHTML = 'Rückruf anfragen <span aria-hidden="true">↗</span>'; }
});

// Direct entry from the acknowledgement email; retain the normal website modal.
if(new URLSearchParams(location.search).get('rueckruf')==='1'){
 const url=new URL(location.href);url.searchParams.delete('rueckruf');history.replaceState(null,'',url.pathname+url.search);
 document.querySelector('[data-callback]')?.click();
}
