import { undefined, z, ZodDiscriminatedUnionOption } from 'zod';
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

const AllowedValuesListSchema = z
  .object({
    type: z.literal('list'),
    values: z.discriminatedUnion('valueType', [
      z.object({
        valueType: z.literal('number'),
        values: z
          .array(AllowedValuesNumberSchema)
          .superRefine((data, ctx) =>
            checkForDuplicateAllowedValues(data, ctx)
          ),
      }),
      z.object({
        valueType: z.literal('string'),
        values: z
          .array(AllowedValuesStringSchema)
          .superRefine((data, ctx) =>
            checkForDuplicateAllowedValues(data, ctx)
          ),
      }),
    ]),
  })
  .transform((data) => {
    return { ...data, values: data.values.values.map((val) => val.value) };
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
  }).transform((data) => {
    const { cip_placement_id, ...rest } = data;
    return {
      ...rest,
    };
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
    return {
      ...data,
      properties: is_leaf ? properties : undefined,
    };
  });
