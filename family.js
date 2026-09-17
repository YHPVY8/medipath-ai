// Presentation translations only. Existing Flow form translations run unchanged.
(() => {
  const elements = [...document.querySelectorAll('[data-family-en]')];
  const portuguese = new Map(elements.map(element => [element, element.innerHTML]));
  function apply(language) {
    elements.forEach(element => {
      element.innerHTML = language === 'en' ? element.dataset.familyEn : portuguese.get(element);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(button => {
    button.addEventListener('click', () => apply(button.dataset.lang));
  });
  apply(localStorage.getItem('medipath-language') || 'pt');
})();
