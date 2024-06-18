interface CreatedModifiedMixin {
  created_time: string;
  modified_time: string;
}

export interface APIError {
  detail: string;
}

// Manufacturers

interface Address {
  address_line: string;
  town?: string | null;
  county?: string | null;
  country: string;
  postcode: string;
}

type AddressPatch = Partial<Address>;

export interface ManufacturerPost {
  name: string;
  url?: string | null;
  address: Address;
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
