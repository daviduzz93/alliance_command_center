/* Alliance Command Center - theme preference service
 * User preferences are intentionally local to this browser in v0.4.
 * The interface is token-based so persistence can later move to the user profile.
 */
(() => {
  "use strict";
  const STORAGE_KEY = "acc.theme";
  const THEMES = new Set(["command", "midnight", "emerald", "violet"]);
  function normalize(value) { return THEMES.has(value) ? value : "command"; }
  function apply(value) {
    const theme = normalize(value);
    document.documentElement.dataset.theme = theme;
    const selector = document.getElementById("theme-app");
    if (selector && selector.value !== theme) selector.value = theme;
    return theme;
  }
  window.ACCTheme = {
    init() {
      let saved = "command";
      try { saved = localStorage.getItem(STORAGE_KEY) || "command"; } catch (_) {}
      apply(saved);
    },
    get() { return normalize(document.documentElement.dataset.theme); },
    set(value) {
      const theme = apply(value);
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
      return theme;
    }
  };
})();