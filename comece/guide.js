(() => {
  const track = document.querySelector('.slides');
  const slides = [...track.children];
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const status = document.querySelector('#page-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let scrollTimer;
  let pointer = null;
  let moved = false;
  let multiTouch = false;

  function update(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    status.textContent = `Página ${current + 1} de ${slides.length}`;
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== current));
      // Promote adjacent images from lazy loading before they are needed.
      if (Math.abs(i - current) <= 1) {
        const img = slide.querySelector('img');
        img.loading = 'eager';
        if (img.decode) void img.decode().catch(() => {});
      }
    });
  }

  function goTo(index, instant = false) {
    update(index);
    track.scrollTo({
      left: current * track.clientWidth,
      behavior: instant || reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  function settled() {
    clearTimeout(scrollTimer);
    update(Math.round(track.scrollLeft / track.clientWidth));
  }
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(settled, 150);
  }, { passive: true });
  track.addEventListener('scrollend', settled);

  // Let the browser own swiping and pinch zoom. Ignore the click that can
  // follow a drag so a single swipe never also triggers tap navigation.
  track.addEventListener('pointerdown', event => {
    if (!event.isPrimary) { multiTouch = true; return; }
    pointer = { x: event.clientX, y: event.clientY, scroll: track.scrollLeft };
    moved = false;
    multiTouch = false;
  }, { passive: true });
  track.addEventListener('pointermove', event => {
    if (pointer && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 10) moved = true;
  }, { passive: true });
  track.addEventListener('pointercancel', () => { moved = true; });
  track.addEventListener('click', event => {
    if (moved || multiTouch || (window.visualViewport?.scale ?? 1) > 1.01) return;
    if (pointer && Math.abs(track.scrollLeft - pointer.scroll) > 10) return;
    const rect = track.getBoundingClientRect();
    goTo(current + (event.clientX - rect.left < rect.width / 2 ? -1 : 1));
  });

  previous.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  // Preserve the selected slide through rotation and Safari toolbar resizing.
  new ResizeObserver(() => goTo(current, true)).observe(track);
  // No history entries or persisted slide state: reload starts on page one.
  goTo(0, true);
  window.addEventListener('pageshow', event => {
    if (!event.persisted) goTo(0, true);
  });
})();
