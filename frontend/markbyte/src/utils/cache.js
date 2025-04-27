export function setCache(key, data) {
  const payload = {
    data,
    ts: Date.now(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to write cache:", err);
  }
}

export function getCache(key) {
  const json = localStorage.getItem(key);
  if (!json) return null;
  try {
    const { data, ts } = JSON.parse(json);
    if (Date.now() - ts < 5 * 60 * 1000) {
      return data;
    } else {
      localStorage.removeItem(key);
      return null;
    }
  } catch (err) {
    console.error("Failed to read cache:", err);
    localStorage.removeItem(key);
    return null;
  }
}
