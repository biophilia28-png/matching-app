export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a, b = new Date()) {
  const aa = new Date(a);
  const bb = new Date(b);
  return Math.floor((bb - aa) / 86400000);
}

export function createStore(key, defaults) {
  const read = () => {
    try {
      return { ...defaults, ...(JSON.parse(localStorage.getItem(key) || "{}")) };
    } catch {
      return { ...defaults };
    }
  };
  const write = value => {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  };
  return {
    get: read,
    set: value => write(value),
    patch: patch => write({ ...read(), ...patch }),
    reset: () => write({ ...defaults })
  };
}

export function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[ch]));
}

export function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.add("hidden"), 2300);
}

export function renderEmpty(title, body) {
  return `<div class="card"><h2 class="title">${escapeHTML(title)}</h2><p class="small">${escapeHTML(body)}</p></div>`;
}
