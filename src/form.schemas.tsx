import { z } from 'zod';
import {
  CatalogueCategoryPost,
  CatalogueCategoryPropertyTypes,
  SystemImportanceType,
} from './api/api.types';

export type RequestType = 'post' | 'patch';

interface BaseZodSchemaProps {
  errorMessage?: string;
}

interface NumberZodSchemaProps {
  requiredErrorMessage?: string;
  invalidTypeErrorMessage?: string;
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

const MandatoryBooleanSchema = (props: BaseZodSchemaProps) =>
  z.boolean({
    required_error: props.errorMessage,
  });

const MandatoryNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .min(1, {
      message: props.requiredErrorMessage,
    })
    .pipe(
      z.coerce.number({
        invalid_type_error: props.invalidTypeErrorMessage,
        required_error: props.requiredErrorMessage,
      })
    );

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

// ------------------------------------ MANUFACTURERS -----------------------------------------------

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

// ------------------------------------ UNITS -------------------------------------------------------

export const UnitSchema = z.object({
  value: MandatoryStringSchema({ errorMessage: 'Please enter a value.' }),
});

// ------------------------------------ USAGE STATUSES -----------------------------------------------

export const UsageStatusSchema = z.object({
  value: MandatoryStringSchema({ errorMessage: 'Please enter a value.' }),
});

// ------------------------------------ SYSTEMS ------------------------------------------------------

export const SystemsSchema = (requestType: RequestType) =>
  z.object({
    name: MandatoryStringSchema({ errorMessage: 'Please enter a name.' }),
    description: OptionalOrNullableStringSchema({ requestType }),
    location: OptionalOrNullableStringSchema({ requestType }),
    owner: OptionalOrNullableStringSchema({ requestType }),
    importance: z.nativeEnum(SystemImportanceType),
  });

// ------------------------------------ CATALOGUE CATEGORIES ------------------------------------

const AllowedValuesNumberSchema = z.object({
  value: MandatoryNumberSchema({
    requiredErrorMessage: 'Please enter a value.',
    invalidTypeErrorMessage: 'Please enter a valid number.',
  }),
  av_placement_id: z.string(),
});

const AllowedValuesStringSchema = z.object({
  value: MandatoryStringSchema({ errorMessage: 'Please enter a value.' }),
  av_placement_id: z.string(),
});

//utils
const checkForDuplicates = (props: {
  data: any[];
  idName: string;
  field: string;
}) => {
  const { data, idName, field } = props;
  const duplicateIds: string[] = [];
  const seenValues: { [key: string]: { [key: string]: string; value: any } } =
    {};

  data.forEach((value) => {
    const currentValue = value[field];
    if (currentValue) {
      if (seenValues[currentValue]) {
        duplicateIds.push(value[idName], seenValues[currentValue][idName]);
      } else {
        seenValues[currentValue] = value;
      }
    }
  });

  return duplicateIds;
};

const checkForDuplicateAllowedValues = (data: any[], ctx: z.RefinementCtx) => {
  const duplicateIds = checkForDuplicates({
    data,
    idName: 'av_placement_id',
    field: 'value',
  });

  if (duplicateIds.length > 0) {
    const duplicateIssues: z.ZodIssue[] = duplicateIds.map((duplicateId) => ({
      path: ['values', duplicateId],
      message: 'Duplicate value',
      code: 'custom',
    }));

    duplicateIssues.forEach((issue) => {
      ctx.addIssue(issue);
    });
  }

  return data;
};

const AllowedValuesListSchema = z.object({
  type: z.literal('list'),
  values: z.discriminatedUnion('valueType', [
    z.object({
      valueType: z.literal('number'),
      values: z
        .array(AllowedValuesNumberSchema)
        .superRefine((data, ctx) => checkForDuplicateAllowedValues(data, ctx)),
    }),
    z.object({
      valueType: z.literal('string'),
      values: z
        .array(AllowedValuesStringSchema)
        .superRefine((data, ctx) => checkForDuplicateAllowedValues(data, ctx)),
    }),
  ]),
});

export const CatalogueCategoryPropertyPatchSchema = z.object({
  name: MandatoryStringSchema({
    errorMessage: 'Please enter a property name.',
  }),
  allowed_values: AllowedValuesListSchema.optional(),
});

export const CatalogueCategoryPostPropertySchema =
  CatalogueCategoryPropertyPatchSchema.extend({
    cip_placement_id: z.string(),
    type: z.nativeEnum(CatalogueCategoryPropertyTypes),
    unit_id: OptionalOrNullableStringSchema({ requestType: 'post' }),
    mandatory: MandatoryBooleanSchema({}),
  });

export const CatalogueCategoryPropertyPostSchema =
  CatalogueCategoryPostPropertySchema.extend({
    // use dsicrimtate unions
    default_value: z
      .any()
      .superRefine((data, ctx) => {
        const { mandatory, type, default_value } = data;

        if (mandatory) {
          if (
            default_value === undefined ||
            default_value === null ||
            (typeof default_value === 'string' && !default_value.trim())
          ) {
            ctx.addIssue({
              path: ['default_value'],
              message: 'Please enter a default value.',
              code: 'custom',
            });
            return default_value;
          }

          if (type === 'number' && typeof default_value !== 'number') {
            ctx.addIssue({
              path: ['default_value'],
              message: 'Please enter a valid number.',
              code: 'custom',
            });
          }
        }
        return default_value;
      })
      .optional(),
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkForDuplicatePropertyNames = (data: any[], ctx: z.RefinementCtx) => {
  const duplicateIds = checkForDuplicates({
    data,
    idName: 'cip_placement_id',
    field: 'name',
  });

  if (duplicateIds.length > 0) {
    const duplicateIssues: z.ZodIssue[] = duplicateIds.map((duplicateId) => ({
      path: [duplicateId, 'name'],
      message:
        'Duplicate property name. Please change the name or remove the property.',
      code: 'custom',
    }));

    duplicateIssues.forEach((issue) => {
      ctx.addIssue(issue);
    });
  }

  return data;
};

export const CatalogueCategorySchema = z
  .object({
    name: MandatoryStringSchema({ errorMessage: 'Please enter a name.' }),
    is_leaf: z.boolean(),
    properties: z
      .array(CatalogueCategoryPostPropertySchema)
      .superRefine((data, ctx) => checkForDuplicatePropertyNames(data, ctx))
      .optional(),
  })
  .transform((data) => {
    const { is_leaf, properties } = data;

    // const APIProperties = properties.map((property) => {

    //   const
    //   return { ...property };
    // });

    const catalogueCategory: CatalogueCategoryPost = {
      ...data,
      properties: [],
    };

    console.log(catalogueCategory);

    return {
      ...data,
      properties: is_leaf ? properties : undefined,
    };
  });
