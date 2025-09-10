export const paths = {
  any: '*',
  root: '/',
  admin: '/admin-ims',
  adminUnits: '/admin-ims/units',
  adminUsageStatuses: '/admin-ims/usage-statuses',
  adminSystemTypes: '/admin-ims/system-types',
  adminRules: '/admin-ims/rules',
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
};

export type URLPathKeyType = keyof typeof paths;

export default paths;
