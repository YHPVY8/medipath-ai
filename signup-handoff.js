// Optional, short-lived same-tab handoff. Never includes passwords or authorization.
try {
  const raw = sessionStorage.getItem('medipath-signup-handoff');
  sessionStorage.removeItem('medipath-signup-handoff');
  const draft = raw && JSON.parse(raw);
  if (draft && Date.now() - draft.created >= 0 && Date.now() - draft.created < 300000) {
    for (const [name, max] of [['full_name',120],['email',254]]) {
      const field = document.querySelector(`#teste-gratuito [name="${name}"]`);
      if (field && !field.value && typeof draft[name] === 'string' && draft[name].length <= max) {
        field.value = draft[name]; field.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }
  }
} catch { /* Existing Brazilian registration remains independent of storage. */ }
