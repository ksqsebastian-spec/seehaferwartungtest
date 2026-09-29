import { callbackSlots } from '../public/callback-slots.js';
const response = (status, data, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
});
const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const textField = (value, max) => typeof value === 'string' && value.trim().length <= max && !/[\u0000-\u001f\u007f]/.test(value);
async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty');
  let size = 0; const chunks = [];
  for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 4096) { await reader.cancel(); throw new Error('large'); } chunks.push(value); }
  const buffer = new Uint8Array(size); let offset = 0;
  for (const value of chunks) { buffer.set(value, offset); offset += value.length; }
  return JSON.parse(new TextDecoder().decode(buffer));
}
export async function handleInquiry(request, env, send = fetch) {
  if (request.method !== 'POST') return response(405, { error: 'Bitte nutzen Sie das Anfrageformular.' }, { Allow: 'POST' });
  if (request.headers.get('Origin') !== new URL(request.url).origin) return response(403, { error: 'Diese Anfrage ist nicht erlaubt.' });
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return response(415, { error: 'Ungültiges Anfrageformat.' });
  let data;
  try { data = await readBody(request); } catch { return response(400, { error: 'Die Anfrage konnte nicht gelesen werden.' }); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return response(400, { error: 'Ungültige Anfrage.' });
  if (data.website) return response(400, { error: 'Bitte prüfen Sie Ihre Eingaben.' });
  const callback = data.kind === 'callback';
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId ?? '');
  if (!validId || (data.kind && !['callback', 'inquiry'].includes(data.kind))) return response(400, { error: 'Ungültige Anfrage.' });
  if (callback) {
    const slot = callbackSlots().find(day => day.value === data.day)?.windows.find(window => window.value === data.time);
    if (!textField(data.name, 100) || !data.name.trim() || !textField(data.phone, 40) || !/^[+0-9 ()/.-]{6,40}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 6 || !slot) return response(400, { error: 'Bitte prüfen Sie Name, Telefonnummer und Wunschzeit. Vergangene Zeitfenster können nicht angefragt werden.' });
  } else if (!textField(data.address, 250) || data.address.trim().length < 5 || !validEmail(data.email) || !textField(data.caretaker ?? '', 250)) {
    return response(400, { error: 'Bitte prüfen Sie die Objektadresse und Ihre E-Mail-Adresse.' });
  }
  if (!env.RESEND_API_KEY || !validEmail(env.INQUIRY_TO) || !env.INQUIRY_LIMITER) return response(503, { error: 'Der Versand ist gerade nicht verfügbar. Bitte versuchen Sie es später erneut.' });
  const { success } = await env.INQUIRY_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' });
  if (!success) return response(429, { error: 'Bitte warten Sie eine Minute, bevor Sie erneut anfragen.' }, { 'Retry-After': '60' });
  const address = callback ? '' : data.address.trim(), email = callback ? '' : data.email.trim(), caretaker = callback ? '' : (data.caretaker || '').trim();
  const message = {
    from: 'Seehafer Wartung <onboarding@resend.dev>',
    to: [env.INQUIRY_TO],
    reply_to: email,
    subject: 'Neue Wartungsanfrage · ' + address,
    text: `Neue Anfrage über die Seehafer-Wartung-Website\n\nObjektadresse: ${address}\nE-Mail für Rückfragen: ${email}\nKontakt vor Ort: ${caretaker || 'Noch nicht angegeben'}\n\nAnfragenummer: ${data.requestId}\n\nMit „Antworten“ erreichen Sie die anfragende Person.`,
  };
  if (callback) {
    delete message.reply_to;
    message.subject = 'Rückrufwunsch · ' + data.name.trim();
    const slot = callbackSlots().find(day => day.value === data.day)?.windows.find(window => window.value === data.time);
    message.text = `Rückrufwunsch über die Seehafer-Website\n\nName: ${data.name.trim()}\nTelefon: ${data.phone.trim()}\nWunschtag: ${data.day}\nZeitfenster: ${slot?.label || data.time} (Europe/Berlin)\n\nWunschzeit, noch kein bestätigter Termin. Bitte die Person im gewünschten Zeitfenster zurückrufen oder eine Alternative abstimmen.\n\nAnfragenummer: ${data.requestId}`;
  }
  try {
    const upstream = await send('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `seehafer-inquiry/${data.requestId}` },
      body: JSON.stringify(message), signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) return response(upstream.status === 429 ? 429 : 502, { error: upstream.status === 429 ? 'Der Versand ist gerade ausgelastet. Bitte versuchen Sie es gleich erneut.' : 'Die Anfrage konnte gerade nicht versendet werden. Ihre Angaben bleiben erhalten. Bitte versuchen Sie es erneut.' });
    const result = await upstream.json();
    if (!result.id) throw new Error('missing-provider-id');
    return response(200, { ok: true, reference: data.requestId, emailId: result.id });
  } catch {
    return response(502, { error: 'Der Versand konnte nicht bestätigt werden. Bitte versuchen Sie es erneut; dieselbe Anfrage wird nicht doppelt verschickt.' });
  }
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/inquiry') return handleInquiry(request, env);
    if (path.startsWith('/api/')) return response(404, { error: 'Nicht gefunden.' });
    return env.ASSETS.fetch(request);
  },
};
