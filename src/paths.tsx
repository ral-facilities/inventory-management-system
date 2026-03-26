export const paths = {
  any: '*',
  root: '/',
  settings: '/settings',
  settingsUnits: '/settings/units',
  settingsUsageStatuses: '/settings/usage-statuses',
  settingsSystemTypes: '/settings/system-types',
  settingsRules: '/settings/rules',
  homepage: '/ims',
  catalogue: '/catalogue',
  catalogueCategories: '/catalogue/:catalogue_category_id',
  catalogueItems: '/catalogue/:catalogue_category_id/items',
  catalogueItem: '/catalogue/:catalogue_category_id/items/:catalogue_item_id',
  items: '/catalogue/:catalogue_category_id/items/:catalogue_item_id/items',
  item: '/catalogue/:catalogue_category_id/items/:catalogue_item_id/items/:item_id',
  systems: '/systems',
  system: '/systems/:system_id',
  manufacturers: '/manufacturers',
  manufacturer: '/manufacturers/:manufacturer_id',
  history: ':element_id/history',
};

export type URLPathKeyType = keyof typeof paths;

export default paths;
