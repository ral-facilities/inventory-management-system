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

interface AddressPost {
  address_line: string;
  town?: string | null;
  county?: string | null;
  country: string;
  postcode: string;
}
type Address = Required<AddressPost>;

type AddressPatch = Partial<AddressPost>;

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
  extends Required<Omit<ManufacturerPost, 'address'>>,
    CreatedModifiedMixin {
  id: string;
  code: string;
  address: Address;
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

export type SystemPatch = Partial<SystemPost>;

export interface System extends CreatedModifiedMixin, Required<SystemPost> {
  id: string;
  code: string;
}

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
  extends Required<CatalogueCategoryPostProperty> {
  id: string;
  unit: string | null;
}

export interface CatalogueCategoryPost {
  name: string;
  is_leaf: boolean;
  parent_id?: string | null;
  properties?: CatalogueCategoryPostProperty[] | null;
}

export type CatalogueCategoryPatch = Partial<CatalogueCategoryPost>;

export interface CatalogueCategory
  extends Required<Omit<CatalogueCategoryPost, 'properties'>>,
    CreatedModifiedMixin {
  id: string;
  code: string;
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
  expected_lifetime_days?: number | null;
  drawing_number?: string | null;
  drawing_link?: string | null;
  item_model_number?: string | null;
  is_obsolete: boolean;
  obsolete_reason?: string | null;
  obsolete_replacement_catalogue_item_id?: string | null;
  notes?: string | null;
  properties?: PropertyPost[] | null;
}

export type CatalogueItemPatch = Partial<CatalogueItemPost>;
export interface CatalogueItem
  extends CreatedModifiedMixin,
    Required<Omit<CatalogueItemPost, 'properties'>> {
  id: string;
  properties: Property[];
}

// ------------------------------------ ITEMS ------------------------------------------------

export interface ItemPost {
  catalogue_item_id: string;
  system_id: string;
  purchase_order_number?: string | null;
  is_defective: boolean;
  usage_status_id: string;
  warranty_end_date?: string | null;
  asset_number?: string | null;
  serial_number?: string | null;
  delivered_date?: string | null;
  notes?: string | null;
  properties?: PropertyPost[] | null;
}

export type ItemPatch = Partial<ItemPost>;

export interface Item
  extends CreatedModifiedMixin,
    Required<Omit<ItemPost, 'properties'>> {
  id: string;
  usage_status: string;
  properties: Property[];
}

// ------------------------------------ ATTACHMENTS ------------------------------------------------

// This is AttachmentPost on the object-store-api
export interface AttachmentPostMetadata {
  entity_id: string;
  file_name: string;
  title?: string | null;
  description?: string | null;
}

export interface AttachmentUploadInfo {
  url: string;
  fields: Record<string, string>;
}
export interface AttachmentPostMetadataResponse
  extends Required<AttachmentPostMetadata>,
    CreatedModifiedMixin {
  id: string;
  upload_info: AttachmentUploadInfo;
}

// ------------------------------------ IMAGES ------------------------------------------------

export interface ImagePost {
  entity_id: string;
  file_name: string;
  upload_file: File;
  title?: string | null;
  description?: string | null;
}

export interface APIImage
  extends Required<Omit<ImagePost, 'upload_file'>>,
    CreatedModifiedMixin {
  id: string;
  primary: boolean;
  thumbnail_base64: string;
}

export interface APIImageWithURL extends APIImage {
  url: string;
}

// ------------------------------------ SPARES ------------------------------------------------

export interface SparesDefinition {
  usage_statuses: UsageStatus[];
}

export interface SparesDefinitionPut {
  usage_statuses: { id: string }[];
}
