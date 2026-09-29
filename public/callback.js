import { callbackSlots } from './callback-slots.js';
const dialog = document.querySelector('#callback'), form = document.querySelector('#callback-form');
const days = document.querySelector('#callback-days'), times = document.querySelector('#callback-times');
let schedule = [], pending;
function options(container, name, values) {
  container.replaceChildren(...values.map((item, i) => {
    const label = document.createElement('label'), input = document.createElement('input'), text = document.createElement('span');
    input.type = 'radio'; input.name = name; input.value = item.value; input.required = true; input.checked = i === 0;
    text.textContent = item.label; label.append(input, text); return label;
  }));
}
function updateTimes() { options(times, 'time', schedule.find(day => day.value === form.elements.day.value).windows); }
function refresh() { schedule = callbackSlots(); options(days, 'day', schedule); updateTimes(); }
days.addEventListener('change', updateTimes);
document.querySelectorAll('[data-callback]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#callback-content').hidden = false; document.querySelector('#callback-success').hidden = true;
  document.querySelector('#callback-error').textContent = ''; refresh(); dialog.showModal();
}));
document.querySelector('#callback-done').addEventListener('click', () => dialog.close());
form.addEventListener('submit', async event => {
  event.preventDefault(); const button = form.querySelector('button[type=submit]'); if (button.disabled) return;
  const fields = Object.fromEntries(new FormData(form));
  if (!callbackSlots().find(day => day.value === fields.day)?.windows.some(window => window.value === fields.time)) {
    refresh(); document.querySelector('#callback-error').textContent = 'Das Zeitfenster ist inzwischen vergangen. Bitte wählen Sie erneut.'; return;
  }
  const fingerprint = JSON.stringify(fields);
  if (!pending || pending.fingerprint !== fingerprint) pending = { fingerprint, requestId: crypto.randomUUID() };
  button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Wird gesendet …'; document.querySelector('#callback-error').textContent = '';
  try {
    const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fields, kind: 'callback', requestId: pending.requestId }), signal: AbortSignal.timeout(18000) });
    const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.error || 'Bitte versuchen Sie es erneut.');
    const selected = schedule.find(day => day.value === fields.day);
    document.querySelector('#callback-summary').textContent = `${selected.label}, ${selected.windows.find(window => window.value === fields.time).label} · ${fields.phone}`;
    document.querySelector('#callback-content').hidden = true; document.querySelector('#callback-success').hidden = false;
    document.querySelector('#callback-done').focus(); form.reset(); pending = null;
  } catch (error) {
    document.querySelector('#callback-error').textContent = ['TimeoutError', 'TypeError'].includes(error.name) ? 'Die Verbindung wurde unterbrochen. Ihre Angaben bleiben erhalten. Bitte versuchen Sie es erneut.' : error.message;
  } finally { button.disabled = false; button.removeAttribute('aria-busy'); button.innerHTML = 'Rückruf anfragen <span aria-hidden="true">↗</span>'; }
});
