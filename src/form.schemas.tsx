import { z, ZodDiscriminatedUnionOption } from 'zod';
import {
  CatalogueCategoryPropertyType,
  SystemImportanceType,
} from './api/api.types';
import { checkForDuplicates } from './utils';

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

const OptionalStringSchema = z
  .string()
  .trim()
  .transform((val) => (!val ? undefined : val))
  .optional();

const NullableStringSchema = z
  .string()
  .trim()
  .transform((val) => (!val ? null : val))
  .nullable();

const OptionalOrNullableStringSchema = (props: PostPatchZodSchemaProps) =>
  props.requestType === 'post' ? OptionalStringSchema : NullableStringSchema;

const MandatoryStringSchema = (props: BaseZodSchemaProps) =>
  z
    .string({
      required_error: props.errorMessage,
    })
    .trim()
    .min(1, { message: props.errorMessage });

const MandatoryBooleanSchema = (props: BaseZodSchemaProps) =>
  z
    .string()
    .min(1, { message: props.errorMessage })
    .toLowerCase()
    .transform((val) => (!val ? null : JSON.parse(val)))
    .pipe(
      z.boolean({
        required_error: props.errorMessage,
        invalid_type_error: props.errorMessage,
      })
    );

const OptionalBooleanSchema = z
  .string()
  .toLowerCase()
  .transform((val) => (!val ? null : JSON.parse(val)))
  .pipe(z.boolean().optional());

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

const OptionalNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .transform((val) => (!val ? undefined : val))
    .pipe(
      z.coerce
        .number({
          invalid_type_error: props.invalidTypeErrorMessage,
        })
        .optional()
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAllowedValuesErrors = (data: any, ctx: z.RefinementCtx) => {
  const issues: z.ZodIssue[] = [];

  // Validate each value in the data array using the appropriate schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.values.forEach((item: any, index: number) => {
    const numberSchema = MandatoryNumberSchema({
      requiredErrorMessage: 'Please enter a value.',
      invalidTypeErrorMessage: 'Please enter a valid number.',
    });

    const stringSchema = MandatoryStringSchema({
      errorMessage: 'Please enter a value.',
    });

    const result =
      data.valueType === 'number'
        ? numberSchema.safeParse(item.value)
        : stringSchema.safeParse(item.value);
    if (!result.success) {
      issues.push({
        path: ['values', index, 'value'],
        message: result.error.errors[0]?.message || 'Invalid value.',
        code: 'custom',
      });
    }
  });

  // Check for duplicates
  const duplicateIds = checkForDuplicates({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data.values.map((val: { av_placement_id: string; value: any }) => ({
      ...val,
      value: data.valueType === 'number' ? Number(val.value) : val.value,
    })),
    idName: 'av_placement_id',
    field: 'value',
  });

  if (duplicateIds.length > 0) {
    duplicateIds.forEach((duplicateId) => {
      const itemIndex = data.values.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.av_placement_id === duplicateId
      );

      issues.push({
        path: ['values', itemIndex, 'value'],
        message: 'Duplicate value.',
        code: 'custom',
      });
    });
  }

  // Add all queued issues in one loop
  issues.forEach((issue) => {
    ctx.addIssue(issue);
  });

  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkForDuplicatePropertyNames = (data: any[], ctx: z.RefinementCtx) => {
  const duplicateIds = checkForDuplicates({
    data,
    idName: 'cip_placement_id',
    field: 'name',
  });

  if (duplicateIds.length > 0) {
    const duplicateIssues: z.ZodIssue[] = duplicateIds.map((duplicateId) => {
      const itemIndex = data.findIndex(
        (item) => item.cip_placement_id === duplicateId
      );

      return {
        path: [itemIndex, 'name'],
        message:
          'Duplicate property name. Please change the name or remove the property.',
        code: 'custom',
      };
    });

    duplicateIssues.forEach((issue) => {
      ctx.addIssue(issue);
    });
  }

  return data;
};

const propertiesTypeList: [
  ZodDiscriminatedUnionOption<'valueType'>,
  ...ZodDiscriminatedUnionOption<'valueType'>[],
] = [
  z.object({
    valueType: z.literal('number_true'),
    value: MandatoryNumberSchema({
      requiredErrorMessage:
        'Please enter a valid value as this field is mandatory',
      invalidTypeErrorMessage: 'Please enter a valid number',
    }),
  }),
  z.object({
    valueType: z.literal('string_true'),
    value: MandatoryStringSchema({
      errorMessage: 'Please enter a valid value as this field is mandatory.',
    }),
  }),
  z.object({
    valueType: z.literal('boolean_true'),
    value: MandatoryBooleanSchema({
      errorMessage: 'Please select either True or False.',
    }),
  }),
  z.object({
    valueType: z.literal('number_false'),
    value: OptionalNumberSchema({
      invalidTypeErrorMessage: 'Please enter a valid number',
    }),
  }),
  z.object({
    valueType: z.literal('string_false'),
    value: OptionalStringSchema,
  }),
  z.object({
    valueType: z.literal('boolean_false'),
    value: OptionalBooleanSchema,
  }),
];

const allowedValuesObject = z.object({
  value: z.any(),
  av_placement_id: z.string(),
});

const AllowedValuesListSchema = z.object({
  type: z.literal('list'),
  // The error handling had to be done manually for the  allowed values as
  // there was an error displaying duplicate and invalid errors at the same
  // time
  values: z
    .object({
      valueType: z.enum(['string', 'number']),
      values: z
        .array(allowedValuesObject)
        .min(1, { message: 'Please create a valid list item.' }),
    })
    .superRefine((data, ctx) => handleAllowedValuesErrors(data, ctx)),
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
    type: z.nativeEnum(CatalogueCategoryPropertyType),
    unit_id: OptionalOrNullableStringSchema({ requestType: 'post' }),
    mandatory: MandatoryBooleanSchema({}),
  });

export const CatalogueCategoryPropertyPostSchema =
  CatalogueCategoryPropertyPatchSchema.extend({
    type: z.nativeEnum(CatalogueCategoryPropertyType),
    unit_id: OptionalOrNullableStringSchema({ requestType: 'post' }),
    mandatory: MandatoryBooleanSchema({}),
    default_value: z.discriminatedUnion('valueType', propertiesTypeList),
  }).transform((data) => {
    return {
      ...data,
      default_value: data.default_value.value,
    };
  });

export const CatalogueCategorySchema = z.object({
  name: MandatoryStringSchema({ errorMessage: 'Please enter a name.' }),
  is_leaf: MandatoryBooleanSchema({}),
  properties: z
    .array(CatalogueCategoryPostPropertySchema)
    .superRefine((data, ctx) => checkForDuplicatePropertyNames(data, ctx))
    .optional(),
});
