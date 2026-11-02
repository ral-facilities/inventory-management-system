import { z } from 'zod';
import {
  CatalogueCategoryPropertyType,
  SystemImportanceType,
} from './api/api.types';
import { checkForDuplicates } from './utils';

export type RequestType = 'post' | 'patch';

export const DATE_PICKER_MIN_DATE = new Date('1900-01-01');
export const DATE_PICKER_MAX_DATE = new Date('2100-01-01');
export const DATE_TODAY = new Date();
export const INVALID_DATE_FORMAT_MESSAGE = 'Date format: dd/MM/yyyy';

interface BaseZodSchemaProps {
  errorMessage?: string;
  disableTrim?: boolean;
}

interface NumberZodSchemaProps {
  requiredErrorMessage?: string;
  invalidTypeErrorMessage?: string;
  min?: number;
  max?: number;
  isInteger?: boolean;
}

interface DateZodSchemaProps {
  minDate: Date;
  maxDate: Date;
  dateFormatErrorMessage?: string;
}

interface PostPatchZodSchemaProps extends BaseZodSchemaProps {
  requestType: RequestType;
}

interface PostPatchZodNumberSchemaProps extends NumberZodSchemaProps {
  requestType: RequestType;
}

interface PostPatchZodDateSchemaProps extends DateZodSchemaProps {
  requestType: RequestType;
}

const withOptionalTrim = (schema: z.ZodString, disableTrim?: boolean) =>
  disableTrim ? schema : schema.trim();

const OptionalStringSchema = (props?: BaseZodSchemaProps) =>
  withOptionalTrim(z.string(), props?.disableTrim)
    .transform((val) => (!val ? undefined : val))
    .optional();

const NullableStringSchema = (props?: BaseZodSchemaProps) =>
  withOptionalTrim(z.string(), props?.disableTrim)
    .transform((val) => (!val ? null : val))
    .nullable();

const OptionalOrNullableStringSchema = (props: PostPatchZodSchemaProps) =>
  props.requestType === 'post'
    ? OptionalStringSchema(props)
    : NullableStringSchema(props);

const MandatoryStringSchema = (props: BaseZodSchemaProps) =>
  withOptionalTrim(
    z.string({ error: props.errorMessage }),
    props.disableTrim
  ).min(1, { error: props.errorMessage });

const MandatoryBooleanSchema = (props: BaseZodSchemaProps) =>
  z
    .string()
    .min(1, { error: props.errorMessage })
    .toLowerCase()
    .transform((val) => (!val ? null : JSON.parse(val)))
    .pipe(z.boolean({ error: props.errorMessage }));

const OptionalBooleanSchema = z
  .string()
  .toLowerCase()
  .transform((val) => (!val ? undefined : JSON.parse(val)))
  .pipe(z.boolean().optional());

const NumberSchema = (props: NumberZodSchemaProps) => {
  let schema = z.coerce.number<string>({
    error: props.invalidTypeErrorMessage,
  });
  if (props.min !== undefined)
    schema = schema.min(props.min, {
      error: `Number must be greater than or equal to ${props.min}`,
    });
  if (props.max !== undefined)
    schema = schema.max(props.max, {
      error: `Number must be less than or equal to ${props.max}`,
    });
  if (props.isInteger)
    schema = schema.int({ error: 'Please enter a valid integer.' });
  return schema;
};

const MandatoryNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .trim()
    .min(1, { error: props.requiredErrorMessage })
    .pipe(NumberSchema(props));

const OptionalNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .trim()
    .transform((val) => (!val ? undefined : val))
    .pipe(NumberSchema(props).optional());

const NullableNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .transform((val) => (!val ? null : val))
    .pipe(NumberSchema(props).nullable());

const OptionalOrNullableNumberSchema = (
  props: PostPatchZodNumberSchemaProps
) =>
  props.requestType === 'post'
    ? OptionalNumberSchema(props)
    : NullableNumberSchema(props);

const DateSchema = (props: DateZodSchemaProps) =>
  z.coerce
    .date<string>({ error: props.dateFormatErrorMessage })
    .max(props.maxDate, {
      error: `Date cannot be later than ${props.maxDate.toLocaleDateString()}.`,
    })
    .min(props.minDate, {
      error: `Date cannot be earlier than ${props.minDate.toLocaleDateString()}.`,
    });

const NullableDateSchema = (props: DateZodSchemaProps) =>
  z
    .string()
    .transform((val) => (!val ? null : val))
    .pipe(DateSchema(props).nullable());

const OptionalDateSchema = (props: DateZodSchemaProps) =>
  z
    .string()
    .transform((val) => (!val ? undefined : val))
    .pipe(DateSchema(props).optional());

const OptionalOrNullableDateSchema = (props: PostPatchZodDateSchemaProps) =>
  props.requestType === 'post'
    ? OptionalDateSchema(props)
    : NullableDateSchema(props);

const OptionalOrNullableURLSchema = (props: PostPatchZodSchemaProps) => {
  const urlSchema = z.url({ error: props.errorMessage });
  return props.requestType === 'post'
    ? OptionalStringSchema().pipe(urlSchema)
    : NullableStringSchema().pipe(urlSchema);
};

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

export const ManufacturerPostSchema = ManufacturerSchema('post');

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
    importance: z.enum(SystemImportanceType),
    type_id: MandatoryStringSchema({
      errorMessage: 'Please select a type.',
    }),
  });

export const SystemsPostSchema = SystemsSchema('post');

// ------------------------------------ CATALOGUE CATEGORIES ------------------------------------

const handleAllowedValuesErrors = (
  data: {
    valueType: 'string' | 'number';
    values: z.output<typeof allowedValuesObject>[];
  },
  ctx: z.RefinementCtx
) => {
  const numberSchema = MandatoryNumberSchema({
    requiredErrorMessage: 'Please enter a value.',
    invalidTypeErrorMessage: 'Please enter a valid number.',
  });

  const stringSchema = MandatoryStringSchema({
    errorMessage: 'Please enter a value.',
  });

  data.values.forEach((item, index) => {
    const result =
      data.valueType === 'number'
        ? numberSchema.safeParse(item.value)
        : stringSchema.safeParse(item.value);
    if (!result.success) {
      ctx.addIssue({
        path: ['values', index, 'value'],
        message: result.error.issues[0]?.message || 'Invalid value.',
        code: 'custom',
      });
    }
  });

  // Check for duplicates
  const duplicateIds = checkForDuplicates({
    data: data.values.map((val) => ({
      ...val,
      value: data.valueType === 'number' ? Number(val.value) : val.value,
    })),
    idName: 'av_placement_id',
    field: 'value',
  });

  duplicateIds.forEach((duplicateId) => {
    const itemIndex = data.values.findIndex(
      (item) => item.av_placement_id === duplicateId
    );

    ctx.addIssue({
      path: ['values', itemIndex, 'value'],
      message: 'Duplicate value.',
      code: 'custom',
    });
  });
};

const checkForDuplicatePropertyNames = (
  data: z.output<typeof CatalogueCategoryPostPropertySchema>[],
  ctx: z.RefinementCtx
) => {
  const duplicateIds = checkForDuplicates({
    data,
    idName: 'cip_placement_id',
    field: 'name',
  });

  duplicateIds.forEach((duplicateId) => {
    const itemIndex = data.findIndex(
      (item) => item.cip_placement_id === duplicateId
    );

    ctx.addIssue({
      path: [itemIndex, 'name'],
      message:
        'Duplicate property name. Please change the name or remove the property.',
      code: 'custom',
    });
  });
};

const propertiesTypeList = [
  z.object({
    valueType: z.literal('number_true'),
    value: z.object({
      value: MandatoryNumberSchema({
        requiredErrorMessage:
          'Please enter a valid value as this field is mandatory.',
        invalidTypeErrorMessage: 'Please enter a valid number.',
      }),
      av_placement_id: z.string(),
    }),
  }),
  z.object({
    valueType: z.literal('string_true'),
    value: z.object({
      value: MandatoryStringSchema({
        errorMessage: 'Please enter a valid value as this field is mandatory.',
      }),
      av_placement_id: z.string(),
    }),
  }),
  z.object({
    valueType: z.literal('string_true_av'),
    value: z.object({
      value: MandatoryStringSchema({
        errorMessage: 'Please enter a valid value as this field is mandatory.',
        disableTrim: true,
      }),
      av_placement_id: z.string(),
    }),
  }),
  z.object({
    valueType: z.literal('boolean_true'),
    value: z.object({
      value: MandatoryBooleanSchema({
        errorMessage: 'Please select either True or False.',
      }),
      av_placement_id: z.string(),
    }),
  }),
  z.object({
    valueType: z.literal('number_false'),
    value: z.object({
      value: OptionalNumberSchema({
        invalidTypeErrorMessage: 'Please enter a valid number.',
      }),
      av_placement_id: z.string(),
    }),
  }),
  z.object({
    valueType: z.literal('string_false'),
    value: z.object({
      value: OptionalStringSchema(),
      av_placement_id: z.string(),
    }),
  }),
  z.object({
    valueType: z.literal('string_false_av'),
    value: z.object({
      value: OptionalStringSchema({ disableTrim: true }),
      av_placement_id: z.string(),
    }),
  }),
  z.object({
    valueType: z.literal('boolean_false'),
    value: z.object({
      value: OptionalBooleanSchema,
      av_placement_id: z.string(),
    }),
  }),
] as const;

const allowedValuesObject = z.object({
  value: z.any().transform((val) => {
    return typeof val === 'string' ? val.trim() : val;
  }),
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
        .min(1, { error: 'Please create a valid list item.' }),
    })
    .superRefine(handleAllowedValuesErrors),
});

export const CatalogueCategoryPropertyPatchSchema = z.object({
  name: MandatoryStringSchema({
    errorMessage: 'Please enter a property name.',
  }),
  allowed_values: AllowedValuesListSchema.nullable().optional(),
  unit_id: NullableStringSchema(),
});

export const CatalogueCategoryPostPropertySchema =
  CatalogueCategoryPropertyPatchSchema.extend({
    cip_placement_id: z.string(),
    type: z.enum(CatalogueCategoryPropertyType),
    unit_id: OptionalStringSchema(),
    mandatory: MandatoryBooleanSchema({}),
  });

export const CatalogueCategoryPropertyPostSchema =
  CatalogueCategoryPropertyPatchSchema.extend({
    type: z.enum(CatalogueCategoryPropertyType),
    unit_id: OptionalStringSchema(),
    mandatory: MandatoryBooleanSchema({}),
    default_value: z.discriminatedUnion('valueType', propertiesTypeList),
  });

export const CatalogueCategorySchema = z.object({
  name: MandatoryStringSchema({ errorMessage: 'Please enter a name.' }),
  is_leaf: MandatoryBooleanSchema({}),
  properties: z
    .array(CatalogueCategoryPostPropertySchema)
    .superRefine(checkForDuplicatePropertyNames)
    .optional(),
});

// ------------------------------------ CATALOGUE ITEMS ------------------------------------

export const CatalogueItemDetailsStepSchema = (requestType: RequestType) => {
  return z.object({
    manufacturer_id: MandatoryStringSchema({
      errorMessage:
        'Please choose a manufacturer or add a new manufacturer. Then select a manufacturer.',
    }),
    name: MandatoryStringSchema({ errorMessage: 'Please enter a name.' }),
    cost_gbp: MandatoryNumberSchema({
      requiredErrorMessage: 'Please enter a cost.',
      invalidTypeErrorMessage: 'Please enter a valid number.',
      min: 0,
    }),
    cost_to_rework_gbp: OptionalOrNullableNumberSchema({
      requestType,
      invalidTypeErrorMessage: 'Please enter a valid number.',
      min: 0,
    }),
    days_to_replace: MandatoryNumberSchema({
      requiredErrorMessage:
        'Please enter how many days it would take to replace.',
      invalidTypeErrorMessage: 'Please enter a valid number.',
      min: 0,
    }),
    days_to_rework: OptionalOrNullableNumberSchema({
      requestType,
      invalidTypeErrorMessage: 'Please enter a valid number.',
      min: 0,
    }),
    expected_lifetime_days: OptionalOrNullableNumberSchema({
      requestType,
      invalidTypeErrorMessage: 'Please enter a valid number.',
      min: 0,
    }),
    description: OptionalOrNullableStringSchema({ requestType }),
    item_model_number: OptionalOrNullableStringSchema({ requestType }),
    notes: OptionalOrNullableStringSchema({ requestType }),
  });
};

export const CatalogueItemDetailsStepPostSchema =
  CatalogueItemDetailsStepSchema('post');

export const PropertiesStepSchema = z.object({
  properties: z.array(z.discriminatedUnion('valueType', propertiesTypeList)),
});

// ------------------------------------ ITEMS ------------------------------------

export const ItemDetailsStepSchema = (
  requestType: RequestType,
  isAdminMode: boolean
) => {
  return z.object({
    purchase_order_number: OptionalOrNullableStringSchema({ requestType }),
    is_defective: MandatoryBooleanSchema({}),
    usage_status_id: MandatoryStringSchema({
      errorMessage: isAdminMode
        ? 'Please select a usage status.'
        : 'Please navigate back and select a system. This field will then be prepopulated.',
    }),
    warranty_end_date: OptionalOrNullableDateSchema({
      requestType: requestType,
      maxDate: DATE_PICKER_MAX_DATE,
      minDate: DATE_PICKER_MIN_DATE,
      dateFormatErrorMessage: INVALID_DATE_FORMAT_MESSAGE,
    }),
    asset_number: OptionalOrNullableStringSchema({ requestType }),
    serial_number: z
      .object({
        serial_number: OptionalOrNullableStringSchema({ requestType }),
        quantity: OptionalOrNullableNumberSchema({
          requestType,
          invalidTypeErrorMessage: 'Please enter a valid number.',
          min: 2,
          max: 99,
          isInteger: true,
        }),
        starting_value: OptionalOrNullableNumberSchema({
          requestType,
          invalidTypeErrorMessage: 'Please enter a valid number.',
          isInteger: true,
          min: 0,
        }),
      })
      .superRefine((data, ctx) => {
        if (
          (typeof data.starting_value === 'number' ||
            typeof data.quantity === 'number') &&
          !data.serial_number?.includes('%s')
        ) {
          ctx.addIssue({
            path: ['serial_number'],
            message:
              'Please use %s to specify the location you want to append the number to serial number.',
            code: 'custom',
          });
        }

        if (
          typeof data.starting_value !== 'number' &&
          typeof data.quantity !== 'number' &&
          data.serial_number?.includes('%s')
        ) {
          ctx.addIssue({
            path: ['serial_number'],
            message: 'Please remove %s or fill in the advanced options fields.',
            code: 'custom',
          });
        }

        if (
          typeof data.starting_value !== 'number' &&
          typeof data.quantity === 'number'
        ) {
          ctx.addIssue({
            path: ['starting_value'],
            message: 'Please enter a starting value.',
            code: 'custom',
          });
        }

        if (
          typeof data.starting_value === 'number' &&
          typeof data.quantity !== 'number'
        ) {
          ctx.addIssue({
            path: ['quantity'],
            message: 'Please enter a quantity value.',
            code: 'custom',
          });
        }
      }),
    delivered_date: OptionalOrNullableDateSchema({
      requestType: requestType,
      maxDate: DATE_TODAY,
      minDate: DATE_PICKER_MIN_DATE,
      dateFormatErrorMessage: INVALID_DATE_FORMAT_MESSAGE,
    }),
    notes: OptionalOrNullableStringSchema({ requestType }),
  });
};

export const ItemDetailsStepSchemaPost = ItemDetailsStepSchema('post', false);

// ------------------------------------ FILES ------------------------------------

export const FileSchemaPatch = z.object({
  file_name: MandatoryStringSchema({
    errorMessage: 'Please enter a file name.',
  }),
  title: NullableStringSchema(),
  description: NullableStringSchema(),
});
