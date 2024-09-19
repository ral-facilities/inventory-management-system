import {
  CatalogueCategory,
  CatalogueItem,
  Item,
  ItemPost,
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

export interface TransferState {
  name: string;
  message: string;
  state: 'success' | 'error' | 'information';
}

// ------------------------------------ CATALOGUE CATEGORIES ------------------------------------
export interface AllowedValuesList {
  type: 'list';
  values: {
    valueType: 'number' | 'string';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: { av_placement_id: string; value: any }[];
  };
}
export type AllowedValues = AllowedValuesList;

export interface AddCatalogueCategoryProperty {
  name: string;
  type: string;
  unit_id?: string | null;
  unit?: string | null;
  mandatory: string;
  allowed_values?: AllowedValues | null;
}

export interface AddCatalogueCategoryWithPlacementIds {
  name: string;
  parent_id?: string | null;
  is_leaf: string;
  properties?: AddCatalogueCategoryPropertyWithPlacementIds[];
}

export interface AddCatalogueCategoryPropertyWithPlacementIds
  extends AddCatalogueCategoryProperty {
  cip_placement_id: string; // Catalogue item properties (cip)
}

export interface PropertyValue {
  valueType: string;
  // The "value" contains the av_placement_id because it could correspond to an option
  // from the allowed values in the add migration. Since this option can potentially
  // be a duplicate, the av_placement_id serves as a unique identifier to differentiate them.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: { av_placement_id: string; value: any };
}
export interface AddPropertyMigration extends AddCatalogueCategoryProperty {
  default_value: PropertyValue;
}

export interface EditPropertyMigration {
  name?: string;
  allowed_values?: AllowedValues | null;
}

export interface MoveToCatalogueCategory {
  selectedCategories: CatalogueCategory[];
  // Null if root
  targetCategory: CatalogueCategory | null;
}

// ------------------------------------ CATALOGUE ITEM ------------------------------------

export interface CatalogueItemDetailsStep {
  manufacturer_id: string;
  name: string;
  description?: string | null;
  cost_gbp: string;
  cost_to_rework_gbp?: string | null;
  days_to_replace: string;
  days_to_rework?: string | null;
  drawing_number?: string | null;
  drawing_link?: string | null;
  item_model_number?: string | null;
  notes?: string | null;
}

export interface CatalogueItemDetailsStepPost {
  manufacturer_id: string;
  name: string;
  description?: string | null;
  cost_gbp: number;
  cost_to_rework_gbp?: number | null;
  days_to_replace: number;
  days_to_rework?: number | null;
  drawing_number?: string | null;
  drawing_link?: string | null;
  item_model_number?: string | null;
  notes?: string | null;
}

export interface PropertiesStep {
  properties: PropertyValue[];
}
export interface CopyToCatalogueCategory {
  selectedCategories: CatalogueCategory[];
  // Null if root
  targetCategory: CatalogueCategory | null;
  // Existing known catalogue category names at the destination
  // (for appending to the names to avoid duplication)
  existingCategoryCodes: string[];
}

export interface ObsoleteDetails {
  is_obsolete: boolean;
  obsolete_replacement_catalogue_item_id: string | null;
  obsolete_reason: string | null;
}

// Used for the move to and copy to
export interface TransferToCatalogueItem {
  selectedCatalogueItems: CatalogueItem[];
  // Null if root
  targetCatalogueCategory: CatalogueCategory | null;
}

// ------------------------------------ SYSTEM ---------------------------------

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

// ------------------------------------ ITEMS ------------------------------------
export interface ItemDetailsStep {
  purchase_order_number?: string | null;
  is_defective: string;
  usage_status_id: string;
  warranty_end_date?: string | null;
  asset_number?: string | null;
  serial_number: {
    serial_number?: string | null;
    quantity?: string;
    starting_value?: string;
  };
  delivered_date?: string | null;
  notes?: string | null;
}

export interface ItemDetailsStepPost {
  purchase_order_number?: string | null;
  is_defective: boolean;
  usage_status_id: string;
  warranty_end_date?: string | null;
  asset_number?: string | null;
  serial_number?: string | null;
  delivered_date?: string | null;
  notes?: string | null;
}

export interface PostItems {
  quantity: number;
  starting_value: number;
  item: ItemPost;
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

export interface AdvancedSerialNumberOptionsType {
  quantity: string | null;
  starting_value: string | null;
}
