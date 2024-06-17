import { z } from 'zod';

export type RequestType = 'post' | 'patch';

const OptionalStringSchema = z.string().trim().optional();

const OptionalOrNullableStringSchema = (requestType: RequestType) =>
  requestType === 'post'
    ? OptionalStringSchema.transform((val) => (!val ? undefined : val))
    : OptionalStringSchema.transform((val) => (!val ? null : val)).nullable();

const MandatoryStringSchema = (errorMessage: string) =>
  z
    .string({
      required_error: errorMessage,
    })
    .trim()
    .min(1, { message: errorMessage });

const OptionalUrlSchema = (errorMessage: string) =>
  z.string().trim().url({ message: errorMessage }).optional();

const OptionalOrNullableURLSchema = (
  requestType: RequestType,
  errorMessage: string
) =>
  requestType === 'post'
    ? OptionalUrlSchema(errorMessage).or(
        z.literal('').transform(() => undefined)
      )
    : OptionalUrlSchema(errorMessage)
        .or(z.literal('').transform(() => null))
        .nullable();

export const ManufacturerSchema = (requestType: RequestType) => {
  return z.object({
    name: MandatoryStringSchema('Please enter a name.'),
    url: OptionalOrNullableURLSchema(requestType, 'Please enter a valid URL.'),
    address: z.object({
      address_line: MandatoryStringSchema('Please enter an address.'),
      town: OptionalOrNullableStringSchema(requestType),
      county: OptionalOrNullableStringSchema(requestType),
      postcode: MandatoryStringSchema('Please enter a post code or zip code.'),
      country: MandatoryStringSchema('Please enter a country.'),
    }),
    telephone: OptionalOrNullableStringSchema(requestType),
  });
};
