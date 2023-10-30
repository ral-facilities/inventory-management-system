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
}

export interface CatalogueCategory {
  id: string;
  name: string;
  parent_path: string;
  path: string;
  parent_id: string | null;
  code: string;
  is_leaf: boolean;
  catalogue_item_properties?: CatalogueCategoryFormData[];
}

export interface ViewManufacturerResponse {
  name: string;
  url: string;
  address: Address;
  telephone: string;
  id: string;
}

export interface AddManufacturer {
  name: string;
  url?: string;
  address: Address | undefined;
  telephone?: string;
}

export interface AddManufacturerResponse {
  name: string;
  code: string;
  url: string;
  address: Address;
  telephone: string;
  id: string;
}

export interface EditManufacturer {
  name?: string;
  url?: string;
  address?: EditAddress;
  telephone?: string;
  id?: string;
}

export interface ManufacturerDetail {
  name: string;
  url?: string;
  address: Address;
  telephone: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  url: string;
  address: Address;
  telephone: string;
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
  web_url: string;
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

interface Address {
  building_number: string;
  street_name: string;
  town?: string;
  county?: string;
  postcode: string;
}

interface EditAddress {
  building_number?: string;
  street_name?: string;
  town?: string;
  county?: string;
  postcode?: string;
}

export enum SystemImportanceType {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface System {
  id: string;
  name: string;
  location: string;
  owner: string;
  importance: SystemImportanceType;
  description: string;
  parent_id: string | null;
  parent_path: string;
  code: string;
  path: string;
}
