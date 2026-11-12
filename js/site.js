// Local time in Charlotte, next to the location in the footer.
(() => {
  const el = document.getElementById('clock');
  if (!el) return;
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
  const tick = () => { el.textContent = ' · ' + f.format(new Date()); };
  tick();
  setInterval(tick, 30000);
})();
