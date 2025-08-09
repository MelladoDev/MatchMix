const KEY = (k) => `app:${k}`;
export function ssGet(k) {
  try {
    const raw = sessionStorage.getItem(KEY(k));
    if (!raw) return null;
    const { v, t, ttl } = JSON.parse(raw);
    if (ttl && Date.now() - t > ttl) { sessionStorage.removeItem(KEY(k)); return null; }
    return v;
  } catch { return null; }
}
export function ssSet(k, v, ttlMs = 60_000) {
  sessionStorage.setItem(KEY(k), JSON.stringify({ v, t: Date.now(), ttl: ttlMs }));
}
export function ssDel(k) { sessionStorage.removeItem(KEY(k)); }

export function readLastListSnapshot() {
  try {
    const pid = localStorage.getItem("lastPairId");
    if (!pid) return null;
    const raw = sessionStorage.getItem(`app:lists:${pid}`);
    if (!raw) return null;
    const { v, t, ttl } = JSON.parse(raw);
    if (ttl && Date.now() - t > ttl) return null;
    return v; // array de items
  } catch { return null; }
}