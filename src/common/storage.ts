import { PluginId } from '../app.types';

const key = (suffix: string) => `${PluginId}:${suffix}`;

export interface StorageDeps {
  load: () => boolean | undefined;
  save: (v: boolean) => void;
  clear: () => void;
}

export function createBooleanLocalStorage(keyName: string): StorageDeps {
  return {
    load(): boolean | undefined {
      const v = localStorage.getItem(key(keyName));
      return v === 'true' ? true : v === 'false' ? false : undefined;
    },
    save(value: boolean) {
      localStorage.setItem(key(keyName), value.toString());
    },
    clear() {
      localStorage.removeItem(key(keyName));
    },
  };
}

export const authorisationStorage = createBooleanLocalStorage('isAdminMode');
export const criticalityStorage = createBooleanLocalStorage('isCriticalMode');
