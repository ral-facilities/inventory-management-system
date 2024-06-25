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

interface AddressPatch extends Partial<Address> {}

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

export interface SystemPatch extends Partial<SystemPost> {}

// ------------------------------------ CATALOGUE CATEGORIES ------------------------------------

export interface AllowedValuesList {
  type: 'list';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[];
}
export type AllowedValues = AllowedValuesList;

export interface CatalogueCategoryPostProperty {
  name: string;
  type: string;
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
  parent_id?: string | null;
  is_leaf: boolean;
  properties?: CatalogueCategoryPostProperty[];
}

export interface CatalogueCategoryPatch
  extends Partial<CatalogueCategoryPost> {}

export interface CatalogueCategory
  extends Omit<CatalogueCategoryPost, 'parent_id' | 'properties'>,
    CreatedModifiedMixin {
  id: string;
  code: string;
  parent_id: string | null;
  properties: CatalogueCategoryProperty[];
}
