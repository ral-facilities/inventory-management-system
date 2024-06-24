interface CreatedModifiedMixin {
  created_time: string;
  modified_time: string;
}

export interface APIError {
  detail: string;
}

// ------------------------------------ MANUFACTURERS ------------------------------------

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

// ------------------------------------ UNITS ------------------------------------

export interface UnitPost {
  value: string;
}

export interface Unit extends UnitPost, CreatedModifiedMixin {
  id: string;
  code: string;
}
