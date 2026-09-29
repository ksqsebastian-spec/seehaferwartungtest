// Shared by the browser and Worker; all scheduling uses Hamburg local time.
export function callbackSlots(now = new Date()) {
  const local = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const part = key => local.find(p => p.type === key).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const minutes = Number(part('hour')) * 60 + Number(part('minute'));
  const start = new Date(today + 'T12:00:00Z');
  const days = [];
  for (let offset = 0; offset <= 60; offset++) {
    const date = new Date(start); date.setUTCDate(start.getUTCDate() + offset);
    if ([0, 6].includes(date.getUTCDay())) continue;
    const key = date.toISOString().slice(0, 10);
    const format = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const windows = Array.from({length:16}, (_, i) => 540 + i * 30).filter(m => offset > 0 || m >= minutes + 60).map(m => ({value:format(m),label:`${format(m)}–${format(m+30)} Uhr`}));
    if (windows.length) days.push({ value: key, label: offset === 0 ? 'Heute' : new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(date), windows });
  }
  return days;
}
