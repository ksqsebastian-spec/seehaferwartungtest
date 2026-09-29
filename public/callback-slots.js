// Shared by the browser and Worker; all scheduling uses Hamburg local time.
export function callbackSlots(now = new Date()) {
  const local = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const part = key => local.find(p => p.type === key).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const hour = Number(part('hour'));
  const start = new Date(today + 'T12:00:00Z');
  const days = [];
  for (let offset = 0; days.length < 5 && offset < 12; offset++) {
    const date = new Date(start); date.setUTCDate(start.getUTCDate() + offset);
    if ([0, 6].includes(date.getUTCDay())) continue;
    const key = date.toISOString().slice(0, 10);
    const windows = [9, 11, 13, 15].filter(h => offset > 0 || h > hour).map(h => ({ value: `${String(h).padStart(2, '0')}:00`, label: `${h}–${h + 2} Uhr` }));
    if (windows.length) days.push({ value: key, label: offset === 0 ? 'Heute' : new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(date), windows });
  }
  return days;
}
