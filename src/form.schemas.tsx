import { z } from 'zod';

export type RequestType = 'post' | 'patch';

interface BaseZodSchemaProps {
  errorMessage?: string;
}

interface PostPatchZodSchemaProps extends BaseZodSchemaProps {
  requestType: RequestType;
}

const OptionalStringSchema = z.string().trim().optional();

const OptionalOrNullableStringSchema = (props: PostPatchZodSchemaProps) =>
  props.requestType === 'post'
    ? OptionalStringSchema.transform((val) => (!val ? undefined : val))
    : OptionalStringSchema.transform((val) => (!val ? null : val)).nullable();

const MandatoryStringSchema = (props: BaseZodSchemaProps) =>
  z
    .string({
      required_error: props.errorMessage,
    })
    .trim()
    .min(1, { message: props.errorMessage });

const OptionalUrlSchema = (props: BaseZodSchemaProps) =>
  z.string().trim().url({ message: props.errorMessage }).optional();

const OptionalOrNullableURLSchema = (props: PostPatchZodSchemaProps) =>
  props.requestType === 'post'
    ? OptionalUrlSchema({ errorMessage: props.errorMessage }).or(
        z.literal('').transform(() => undefined)
      )
    : OptionalUrlSchema({ errorMessage: props.errorMessage })
        .or(z.literal('').transform(() => null))
        .nullable();

export const ManufacturerSchema = (requestType: RequestType) => {
  return z.object({
    name: MandatoryStringSchema({ errorMessage: 'Please enter a name.' }),
    url: OptionalOrNullableURLSchema({
      requestType,
      errorMessage: 'Please enter a valid URL.',
    }),
    address: z.object({
      address_line: MandatoryStringSchema({
        errorMessage: 'Please enter an address.',
      }),
      town: OptionalOrNullableStringSchema({ requestType }),
      county: OptionalOrNullableStringSchema({ requestType }),
      postcode: MandatoryStringSchema({
        errorMessage: 'Please enter a post code or zip code.',
      }),
      country: MandatoryStringSchema({
        errorMessage: 'Please enter a country.',
      }),
    }),
    telephone: OptionalOrNullableStringSchema({ requestType }),
  });
};

export const UnitSchema = z.object({
  value: MandatoryStringSchema({ errorMessage: 'Please enter a value.' }),
});
