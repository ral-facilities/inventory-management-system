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
  url?: string;
  address: AddAddress;
  telephone?: string | null;
}

export interface EditManufacturer {
  name?: string;
  url?: string;
  address?: EditAddress;
  telephone?: string | null;
  id?: string | null;
}

export interface ManufacturerDetails {
  name: string;
  url?: string;
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
  name: string | undefined;
  description: string | undefined;
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

export interface CatalogueItem {
  catalogue_category_id: string;
  name: string | undefined;
  description: string;
  properties: CatalogueItemPropertyResponse[];
  manufacturer: CatalogueItemManufacturer;
  id: string;
}
export interface AddCatalogueItem {
  catalogue_category_id: string;
  name: string | undefined;
  description: string;
  properties: CatalogueItemProperty[];
  manufacturer: CatalogueItemManufacturer;
}

export interface EditCatalogueItem {
  name?: string | undefined;
  description?: string;
  properties?: CatalogueItemProperty[];
  manufacturer?: CatalogueItemManufacturer;
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
