const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const getValue = (key, defaultValue = null) => {
  if (isNode) return defaultValue;
  const urlParams = new URLSearchParams(window.location.search);
  const fromUrl = urlParams.get(key);
  if (fromUrl) {
    storage.setItem(`masil_${key}`, fromUrl);
    return fromUrl;
  }
  return storage.getItem(`masil_${key}`) || defaultValue;
};

export const appParams = {
  appName: '마실',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  fromUrl: getValue('from_url', window.location.href),
};
