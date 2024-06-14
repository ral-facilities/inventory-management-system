// Manufacturers

interface CreatedModifiedSchemaMixin {
  created_time: string;
  modified_time: string;
}

interface AddressSchema {
  address_line: string;
  town?: string | null;
  county?: string | null;
  country: string;
  postcode: string;
}

type AddressPatchSchema = Partial<AddressSchema>;

export interface ManufacturerPostSchema {
  name: string;
  url?: string | null;
  address: AddressSchema;
  telephone?: string | null;
}

export interface ManufacturerPatchSchema
  extends Partial<Omit<ManufacturerPostSchema, 'address'>> {
  address?: AddressPatchSchema;
  id: string;
}

export interface ManufacturerSchema
  extends ManufacturerPostSchema,
    CreatedModifiedSchemaMixin {
  id: string;
  code: string;
}
