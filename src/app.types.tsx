import {
  CatalogueCategory,
  CatalogueCategoryPost,
  CatalogueCategoryPostProperty,
  CatalogueCategoryProperty,
  CatalogueCategoryPropertyPatch,
  CatalogueCategoryPropertyPost,
  System,
} from './api/api.types';

export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export const TAB_VALUES = [
  'Ims', // Homepage
  'Catalogue',
  'Systems',
  'Manufacturers',
  'Admin',
] as const;
export type TabValue = (typeof TAB_VALUES)[number];

// ------------------------------------ CATALOGUE CATEGORIES ------------------------------------

export interface AddCatalogueCategoryWithPlacementIds
  extends Omit<CatalogueCategoryPost, 'properties'> {
  properties?: AddCatalogueCategoryPropertyWithPlacementIds[];
}

export interface MoveToCatalogueCategory {
  selectedCategories: CatalogueCategory[];
  // Null if root
  targetCategory: CatalogueCategory | null;
}

export interface CopyToCatalogueCategory {
  selectedCategories: CatalogueCategory[];
  // Null if root
  targetCategory: CatalogueCategory | null;
  // Existing known catalogue category names at the destination
  // (for appending to the names to avoid duplication)
  existingCategoryCodes: string[];
}

export interface AddPropertyMigration {
  catalogueCategory: CatalogueCategory;
  property: CatalogueCategoryPropertyPost;
}

export interface EditPropertyMigration {
  catalogueCategory: CatalogueCategory;
  property_id: string;
  property: CatalogueCategoryPropertyPatch;
}

export interface AddCatalogueCategoryPropertyWithPlacementIds
  extends CatalogueCategoryPostProperty {
  cip_placement_id: string; // Catalogue item properties (cip)
}

export interface CatalogueCategoryPropertyWithPlacementIds
  extends CatalogueCategoryProperty {
  id: string;
  cip_placement_id: string; // Catalogue item properties (cip)
}

export type FormFields =
  | CatalogueCategoryPropertyWithPlacementIds
  | AddCatalogueCategoryPropertyWithPlacementIds;

export type CatalogueCategoryPropertyPostTypes =
  | CatalogueCategoryPostProperty
  | CatalogueCategoryPropertyPost;

// Create a union type for the keys of each interface individually
type CatalogueCategoryPostPropertyKeys = keyof CatalogueCategoryPostProperty;
type CatalogueCategoryPropertyPostKeys = keyof CatalogueCategoryPropertyPost;

// Define a conditional type that resolves to the appropriate key set
type CatalogueCategoryPropertyPostTypesKeys<T> =
  T extends CatalogueCategoryPostProperty
    ? CatalogueCategoryPostPropertyKeys
    : T extends CatalogueCategoryPropertyPost
      ? CatalogueCategoryPropertyPostKeys
      : never;

// Use the conditional type for keyof CatalogueCategoryPropertyPostTypes
export type CatalogueCategoryPropertyPostTypesKey =
  CatalogueCategoryPropertyPostTypesKeys<CatalogueCategoryPropertyPostTypes>;

// ------------------------------------ CATALOGUE ITEMS ------------------------------------

export interface ObsoleteDetails {
  is_obsolete: boolean;
  obsolete_replacement_catalogue_item_id: string | null;
  obsolete_reason: string | null;
}
export interface CatalogueItemDetails extends ObsoleteDetails {
  catalogue_category_id: string;
  name: string;
  description: string | null;
  cost_gbp: number;
  cost_to_rework_gbp: number | null;
  days_to_replace: number;
  days_to_rework: number | null;
  drawing_number: string | null;
  drawing_link: string | null;
  item_model_number: string | null;
  manufacturer_id: string;
  notes: string | null;
}
// need so we can cast string to number e.g for 10.50
export type CatalogueItemDetailsPlaceholder = {
  [K in keyof CatalogueItemDetails]: string | null;
};

export type CatalogueDetailsErrorMessages = {
  [K in keyof CatalogueItemDetails]: string;
};

export interface CatalogueItemProperty {
  id: string;
  value: string | number | boolean | null;
}

export interface CatalogueItemPropertyResponse {
  id: string;
  name: string;
  value: string | number | boolean | null;
  unit: string | null;
  unit_id?: string | null;
}

export interface CatalogueItem extends CatalogueItemDetails {
  properties: CatalogueItemPropertyResponse[];
  id: string;
  created_time: string;
  modified_time: string;
}
export interface AddCatalogueItem extends CatalogueItemDetails {
  properties: CatalogueItemProperty[];
}

export interface EditCatalogueItem extends Partial<AddCatalogueItem> {
  id: string;
}

// Used for the move to and copy to
export interface TransferToCatalogueItem {
  selectedCatalogueItems: CatalogueItem[];
  // Null if root
  targetCatalogueCategory: CatalogueCategory | null;
}

export interface TransferState {
  name: string;
  message: string;
  state: 'success' | 'error' | 'information';
}

export interface MoveToSystem {
  selectedSystems: System[];
  // Null if root
  targetSystem: System | null;
}

export interface CopyToSystem {
  selectedSystems: System[];
  // Null if root
  targetSystem: System | null;
  // Existing known system names at the destination
  // (for appending to the names to avoid duplication)
  existingSystemCodes: string[];
}

export interface ItemDetails {
  catalogue_item_id: string;
  system_id: string;
  purchase_order_number: string | null;
  is_defective: boolean;
  usage_status_id: string;
  warranty_end_date: string | null;
  asset_number: string | null;
  serial_number: string | null;
  delivered_date: string | null;
  notes: string | null;
}
export type ItemDetailsPlaceholder = {
  [K in keyof ItemDetails]: K extends 'delivered_date' | 'warranty_end_date'
    ? Date | null
    : string | null;
};

export interface AddItem extends ItemDetails {
  properties: CatalogueItemProperty[];
}

export interface AddItems {
  quantity: number;
  startingValue: number;
  item: AddItem;
}

export interface Item extends ItemDetails {
  properties: CatalogueItemPropertyResponse[];
  id: string;
  usage_status: string;
  created_time: string;
  modified_time: string;
}

export interface EditItem extends Partial<AddItem> {
  id: string;
}

export interface MoveItemsToSystemUsageStatus {
  item_id: string;
  usage_status_id: string;
}
export interface MoveItemsToSystem {
  usageStatuses: MoveItemsToSystemUsageStatus[];
  selectedItems: Item[];
  targetSystem: System;
}

export interface CatalogueItemPropertiesErrorsType {
  cip_placement_id: string;
  errors: {
    fieldName: keyof CatalogueCategoryPostProperty;
    errorMessage: string;
  } | null;
}

export interface AdvancedSerialNumberOptionsType {
  quantity: string | null;
  startingValue: string | null;
}
export interface AllowedValuesListErrorsType {
  cip_placement_id: string | null;
  errors: { av_placement_id: string; errorMessage: string }[] | null;
}
