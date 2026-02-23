import { PluginId } from '../app.types';

const key = (suffix: string) => `${PluginId}:${suffix}`;

export function loadIsAdminMode(): boolean | undefined {
  const v = localStorage.getItem(key('isAdminMode'));
  return v === 'true' ? true : v === 'false' ? false : undefined;
}

export function saveIsAdminMode(value: boolean) {
  localStorage.setItem(key('isAdminMode'), value.toString());
}

export function clearIsAdminMode() {
  localStorage.removeItem(key('isAdminMode'));
}
