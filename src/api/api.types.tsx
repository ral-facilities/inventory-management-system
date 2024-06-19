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

// Manufacturers

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
  id: string;
}

export interface Manufacturer extends ManufacturerPost, CreatedModifiedMixin {
  id: string;
  code: string;
  address: Address;
  url: string | null;
  telephone: string | null;
}

// Units

export interface UnitPost {
  value: string;
}

export interface Unit extends UnitPost, CreatedModifiedMixin {
  id: string;
  code: string;
}

// Usage Statuses

export interface UsageStatusPost {
  value: string;
}
export interface UsageStatus extends UsageStatusPost, CreatedModifiedMixin {
  id: string;
  code: string;
}

// Systems

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

export interface System extends SystemPost, CreatedModifiedMixin {
  id: string;
  description: string | null;
  location: string | null;
  owner: string | null;
  importance: SystemImportanceType;
  parent_id: string | null;
  code: string;
}

export interface SystemPatch extends Partial<SystemPost> {
  id: string;
}
