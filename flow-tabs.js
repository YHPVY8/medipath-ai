/* Flow V6 question tabs and the visitor-initiated walkthrough player. */
(() => {
  const root = document.querySelector('[data-flow-tabs]');
  if (!root) return;

  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const launcher = root.querySelector('.flow-video-launch');
  const playerRegion = root.querySelector('.flow-video-player');
  const video = root.querySelector('video');

  function selectTab(tab, moveFocus = false) {
    const selectedIndex = tabs.indexOf(tab);
    if (selectedIndex < 0) return;

    const selectedPanelId = tab.getAttribute('aria-controls');
    const wasVideoOpen = !root.querySelector('#flow-panel-video').hidden;
    tabs.forEach((item, index) => {
      const selected = index === selectedIndex;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.id !== selectedPanelId;
    });

    if (wasVideoOpen && selectedPanelId !== 'flow-panel-video' && video && !video.paused) {
      video.pause();
    }
    if (moveFocus) tab.focus();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectTab(tab));
  });

  root.querySelector('[role="tablist"]').addEventListener('keydown', event => {
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    let nextIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    selectTab(tabs[nextIndex], true);
  });

  launcher.addEventListener('click', () => {
    playerRegion.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.hidden = true;
    if (video) {
      const playback = video.play();
      if (playback && typeof playback.catch === 'function') playback.catch(() => {});
    }
  });
})();
