(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
  function storageKey(name) {
    return `app-ui:${name}`;
  }

  function loadJson(key, fallback) {
    if (!window.localStorage) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    if (!window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function removeKey(key) {
    if (!window.localStorage) return;
    window.localStorage.removeItem(key);
  }

  function createView(name, config) {
    return { id: `view-${Date.now()}-${Math.round(Math.random() * 1000)}`, name, isDefault: false, config };
  }

  function normalizeViews(list) {
    return Array.isArray(list) ? list.filter((entry) => entry && typeof entry === 'object' && entry.id && entry.name) : [];
  }

  ROOT.datatable = ROOT.datatable || {};
  ROOT.datatable.views = Object.freeze({
    storageKey,
    loadJson,
    saveJson,
    removeKey,
    createView,
    normalizeViews,
  });
})();
