
export const safeParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    if (parsed === undefined || parsed === null) return fallback;
    return parsed as T;
  } catch (error) {
    console.error("[Storage] Failed to parse JSON:", error);
    // If it's corrupted, we might want to clear it, but safeParse is a pure helper.
    // The caller should handle clearing if needed.
    return fallback;
  }
};

export const getStorageItem = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return safeParse(item, fallback);
  } catch (error) {
    console.error(`[Storage] Error reading key "${key}":`, error);
    return fallback;
  }
};

export const setStorageItem = (key: string, value: any): void => {
  try {
    if (value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    const valToStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, valToStore);
  } catch (error) {
    console.error(`[Storage] Error writing key "${key}":`, error);
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Error removing key "${key}":`, error);
  }
};
