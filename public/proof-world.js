(() => {
  document.querySelectorAll('[data-proof-project]').forEach(link => link.addEventListener('click', () => document.querySelector(`[data-project="${link.dataset.proofProject}"]`)?.click()));
  const world = document.querySelector('.process-world'), stage = world.querySelector('.world-stage');
  const tabs = [...world.querySelectorAll('[data-process]')], play = document.querySelector('#process-play');
  const steps = [
    ['Sie nennen uns das Objekt.', 'Adresse und Kontakt vor Ort genügen. Die fehlenden Informationen holen wir ein.', 'Ihre Anfrage. Unser nächster Schritt.'],
    ['Wir sprechen mit Ihrem Hausmeister.', 'Termin, Zugang und Mieterinformation stimmen wir direkt vor Ort ab. Sie müssen nichts weiterleiten.', 'Abstimmung läuft direkt vor Ort.'],
    ['Wir kümmern uns um jede Tür.', 'Bestand aufnehmen, Anlagen warten, Mängel festhalten. Reparaturen stimmen wir separat mit Ihnen ab.', 'Prüfen. Warten. Dokumentieren.'],
    ['Sie bekommen einen fertigen Ordner.', 'Prüfergebnisse, Mängel und nächste Schritte. Alles zusammen für Ihre Ablage.', 'Erledigt. Und nachvollziehbar.']
  ];
  let active = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, visible = false;
  const reduced = () => document.body.classList.contains('motion-off');
  function select(index) {
    active = (index + steps.length) % steps.length; stage.dataset.step = active;
    tabs.forEach((tab,i) => {tab.setAttribute('aria-selected',i===active);tab.tabIndex=i===active?0:-1;tab.id=`process-tab-${i}`;});
    const panel=document.querySelector('#process-copy');panel.setAttribute('aria-labelledby',tabs[active].id);
    panel.querySelector('h3').textContent=steps[active][0];panel.querySelector('p').textContent=steps[active][1];
    stage.querySelector('.world-status span').textContent=steps[active][2];
  }
  function sync() {world.classList.toggle('process-paused',paused);play.setAttribute('aria-pressed',paused);play.textContent=paused?'Animation abspielen ▷':'Animation pausieren Ⅱ';}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>{paused=true;sync();select(i);});tab.addEventListener('keydown',event=>{const delta=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;if(delta){event.preventDefault();paused=true;sync();select(active+delta);tabs[active].focus();}});});
  play.addEventListener('click',()=>{paused=!paused;sync();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;world.classList.toggle('process-offscreen',!visible);},{threshold:.2}).observe(world);
  setInterval(()=>{if(visible&&!paused&&!reduced()&&!document.hidden&&!world.contains(document.activeElement))select(active+1);},5500);
  select(0);sync();
})();
