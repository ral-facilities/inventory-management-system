import { PluginRoute } from "./state/actions/actions.types";

export interface InventoryManagementSystemSettings {
  routes: PluginRoute[];
}

export let settings: Promise<InventoryManagementSystemSettings | void>;
export const setSettings = (
  newSettings: Promise<InventoryManagementSystemSettings | void>
): void => {
  settings = newSettings;
};
