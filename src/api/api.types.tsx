interface CreatedModifiedMixin {
  created_time: string;
  modified_time: string;
}

export interface APIError {
  detail: string;
}

export interface BreadcrumbsInfo {
  trail: [id: string, name: string][];
  full_trail: boolean;
}

// ------------------------------------ MANUFACTURERS -----------------------------------------------

interface Address {
  address_line: string;
  town: string | null;
  county: string | null;
  country: string;
  postcode: string;
}

interface AddressPost extends Omit<Address, 'town' | 'county'> {
  town?: string | null;
  county?: string | null;
}

type AddressPatch = Partial<Address>;

export interface ManufacturerPost {
  name: string;
  url?: string | null;
  address: AddressPost;
  telephone?: string | null;
}

export interface ManufacturerPatch
  extends Partial<Omit<ManufacturerPost, 'address'>> {
  address?: AddressPatch;
}

export interface Manufacturer
  extends Omit<ManufacturerPost, 'telephone' | 'url' | 'address'>,
    CreatedModifiedMixin {
  id: string;
  code: string;
  address: Address;
  url: string | null;
  telephone: string | null;
}

// ------------------------------------ UNITS -------------------------------------------------------

export interface UnitPost {
  value: string;
}

export interface Unit extends UnitPost, CreatedModifiedMixin {
  id: string;
  code: string;
}

// ------------------------------------ USAGE STATUSES -----------------------------------------------

export interface UsageStatusPost {
  value: string;
}
export interface UsageStatus extends UsageStatusPost, CreatedModifiedMixin {
  id: string;
  code: string;
}

// ------------------------------------ SYSTEMS ------------------------------------------------------

export enum SystemImportanceType {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface SystemPost {
  name: string;
  description?: string | null;
  location?: string | null;
  owner?: string | null;
  importance: SystemImportanceType;
  parent_id?: string | null;
}

export interface System extends CreatedModifiedMixin {
  id: string;
  name: string;
  code: string;
  description: string | null;
  location: string | null;
  owner: string | null;
  importance: SystemImportanceType;
  parent_id: string | null;
}

export type SystemPatch = Partial<SystemPost>;

// ------------------------------------ CATALOGUE CATEGORIES ------------------------------------

export enum AllowedValuesListType {
  Any = 'any',
  List = 'list',
}
export interface AllowedValuesList {
  type: 'list';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[];
}
export type AllowedValues = AllowedValuesList;

export enum CatalogueCategoryPropertyType {
  Number = 'number',
  Text = 'string',
  Boolean = 'boolean',
}

export interface CatalogueCategoryPostProperty {
  name: string;
  type: CatalogueCategoryPropertyType;
  unit_id?: string | null;
  mandatory: boolean;
  allowed_values?: AllowedValues | null;
}

export interface CatalogueCategoryPropertyPost
  extends CatalogueCategoryPostProperty {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default_value: any;
}

export interface CatalogueCategoryPropertyPatch {
  name?: string;
  allowed_values?: AllowedValues | null;
}

export interface CatalogueCategoryProperty
  extends Omit<CatalogueCategoryPostProperty, 'unit_id' | 'allowed_values'> {
  id: string;
  unit_id: string | null;
  unit: string | null;
  allowed_values: AllowedValues | null;
}

export interface CatalogueCategoryPost {
  name: string;
  is_leaf: boolean;
  parent_id?: string | null;
  properties?: CatalogueCategoryPostProperty[] | null;
}

export type CatalogueCategoryPatch = Partial<CatalogueCategoryPost>;

export interface CatalogueCategory
  extends Omit<CatalogueCategoryPost, 'parent_id' | 'properties'>,
    CreatedModifiedMixin {
  id: string;
  code: string;
  parent_id: string | null;
  properties: CatalogueCategoryProperty[];
}

// ------------------------------------ CATALOGUE ITEMS ------------------------------------

export interface PropertyPost {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface Property extends PropertyPost {
  name: string;
  unit_id: string | null;
  unit: string | null;
}
export interface CatalogueItemPost {
  catalogue_category_id: string;
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
  is_obsolete: boolean;
  obsolete_reason?: string | null;
  obsolete_replacement_catalogue_item_id?: string | null;
  notes?: string | null;
  properties?: PropertyPost[] | null;
}

export interface CatalogueItemPatch
  extends Omit<
    CatalogueItemPost,
    | 'catalogue_category_id'
    | 'manufacturer_id'
    | 'name'
    | 'cost_gbp'
    | 'days_to_replace'
    | 'is_obsolete'
  > {
  catalogue_category_id?: string | null;
  manufacturer_id?: string | null;
  name?: string | null;
  cost_gbp?: number | null;
  days_to_replace?: number | null;
  is_obsolete?: boolean;
}

export interface CatalogueItem {
  catalogue_category_id: string;
  manufacturer_id: string;
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
  obsolete_reason: string | null;
  obsolete_replacement_catalogue_item_id: string | null;
  notes: string | null;
  properties: Property[];
}
