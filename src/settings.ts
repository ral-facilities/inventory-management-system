import { PluginRoute } from './state/actions/actions.types';

export interface InventoryManagementSystemSettings {
  apiUrl: string;
  routes: PluginRoute[];
  pluginHost?: string;
}

export let settings: Promise<InventoryManagementSystemSettings | void>;
export const setSettings = (
  newSettings: Promise<InventoryManagementSystemSettings | void>
): void => {
  settings = newSettings;
};
