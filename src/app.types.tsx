export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export type TabValue = 'Systems' | 'Catalogue' | 'Manufacturer';

export interface AddCatalogueCategory {
  name: string;
  parent_id?: string;
  is_leaf: boolean;
  catalogue_item_properties?: CatalogueCategoryFormData[];
}

export interface EditCatalogueCategory {
  name?: string;
  id: string;
  catalogue_item_properties?: CatalogueCategoryFormData[];
  is_leaf?: boolean;
  parent_id?: string | null;
}

export interface MoveToCatalogueCategory {
  catalogueCategories: EditCatalogueCategory[];
  selectedCategories: CatalogueCategory[];
  targetLocationCatalogueCategory: CatalogueCategory;
}

export interface CopyToCatalogueCategory {
  catalogueCategories: AddCatalogueCategory[];
  selectedCategories: CatalogueCategory[];
  targetLocationCatalogueCategory: CatalogueCategory;
}

export interface CatalogueCategory {
  id: string;
  name: string;
  parent_id: string | null;
  code: string;
  is_leaf: boolean;
  catalogue_item_properties?: CatalogueCategoryFormData[];
}

export interface AddManufacturer {
  name: string;
  url?: string | null;
  address: AddAddress;
  telephone?: string | null;
}

export interface EditManufacturer {
  name?: string;
  url?: string | null;
  address?: EditAddress;
  telephone?: string | null;
  id?: string | null;
}

export interface ManufacturerDetails {
  name: string;
  url?: string | null;
  address: AddAddress;
  telephone: string | null;
}

export interface Manufacturer extends ManufacturerDetails {
  id: string;
}

export interface CatalogueCategoryFormData {
  name: string;
  type: string;
  unit?: string;
  mandatory: boolean;
}

export interface CatalogueItemDetails {
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
  is_obsolete: boolean;
  obsolete_replacement_catalogue_item_id: string | null;
  obsolete_reason: string | null;
  manufacturer_id: string;
}
// need so we can cast string to number e.g for 10.50
export type CatalogueItemDetailsPlaceholder = {
  [K in keyof CatalogueItemDetails]: string | null;
};

export interface CatalogueDetailsErrorMessages {
  name: string;
  description: string;
  cost_gbp: string;
  cost_to_rework_gbp: string;
  days_to_replace: string;
  days_to_rework: string;
  drawing_number: string;
  drawing_link: string;
  item_model_number: string;
}

export interface CatalogueItemManufacturer {
  name: string;
  address: string;
  url: string;
}

export interface CatalogueItemProperty {
  name: string;
  value: string | number | boolean | null;
}

export interface CatalogueItemPropertyResponse {
  name: string;
  value: string | number | boolean | null;
  unit: string;
}

export interface CatalogueItem extends CatalogueItemDetails {
  properties: CatalogueItemPropertyResponse[];

  id: string;
}
export interface AddCatalogueItem extends CatalogueItemDetails {
  properties: CatalogueItemProperty[];
  manufacturer_id: string;
}

export interface EditCatalogueItem extends Partial<AddCatalogueItem> {
  id: string;
}
export interface ErrorParsing {
  detail: string;
}

interface AddAddress {
  address_line: string;
  town?: string | null;
  county?: string | null;
  postcode: string;
  country: string;
}
interface EditAddress {
  address_line?: string;
  town?: string | null;
  county?: string | null;
  postcode?: string;
  country?: string;
}
export interface CatalogueCategoryTransferState {
  name: string;
  message: string;
  state: 'success' | 'error';
}
export interface BreadcrumbsInfo {
  trail: [id: string, name: string][];
  full_trail: boolean;
}

export enum SystemImportanceType {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface AddSystem {
  name: string;
  description?: string;
  location?: string;
  owner?: string;
  importance: SystemImportanceType;
  parent_id?: string;
}

export interface System {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  owner: string | null;
  importance: SystemImportanceType;
  parent_id: string | null;
  code: string;
}
