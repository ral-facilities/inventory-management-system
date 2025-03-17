import { z, ZodDiscriminatedUnionOption } from 'zod';
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
  .transform((val) => (!val ? undefined : JSON.parse(val)))
  .pipe(z.boolean().optional());

const MandatoryNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .trim()
    .min(1, {
      message: props.requiredErrorMessage,
    })
    .pipe(
      z.coerce
        .number({
          invalid_type_error: props.invalidTypeErrorMessage,
          required_error: props.requiredErrorMessage,
        })
        .min(props.min ?? -Infinity, {
          message: `Number must be greater than or equal to ${props.min}`,
        })
        .max(props.max ?? Infinity, {
          message: `Number must be less than or equal to ${props.max}`,
        })
        .refine((value) => (props.isInteger ? Number.isInteger(value) : true), {
          message: 'Please enter a valid integer.',
        })
    );

const OptionalNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .trim()
    .transform((val) => (!val ? undefined : val))
    .pipe(
      z.coerce
        .number({
          invalid_type_error: props.invalidTypeErrorMessage,
        })
        .min(props.min ?? -Infinity, {
          message: `Number must be greater than or equal to ${props.min}`,
        })
        .max(props.max ?? Infinity, {
          message: `Number must be less than or equal to ${props.max}`,
        })
        .refine((value) => (props.isInteger ? Number.isInteger(value) : true), {
          message: 'Please enter a valid integer.',
        })
        .optional()
    );

const NullableNumberSchema = (props: NumberZodSchemaProps) =>
  z
    .string()
    .transform((val) => (!val ? null : val))
    .pipe(
      z.coerce
        .number({
          invalid_type_error: props.invalidTypeErrorMessage,
        })
        .min(props.min ?? -Infinity, {
          message: `Number must be greater than or equal to ${props.min}`,
        })
        .max(props.max ?? Infinity, {
          message: `Number must be less than or equal to ${props.max}`,
        })
        .refine((value) => (props.isInteger ? Number.isInteger(value) : true), {
          message: 'Please enter a valid integer.',
        })
        .nullable()
    );

const NullableDateSchema = (props: DateZodSchemaProps) =>
  z
    .any()
    .transform((val) => (!val ? null : val))
    .pipe(
      z.coerce
        .date({
          errorMap: (issue, { defaultError }) => ({
            message:
              issue.code === 'invalid_date'
                ? props.dateFormatErrorMessage || defaultError
                : defaultError,
          }),
        })
        .max(props.maxDate, {
          message: `Date cannot be later than ${props.maxDate.toLocaleDateString()}.`,
        })
        .min(props.minDate, {
          message: `Date cannot be earlier than ${props.minDate.toLocaleDateString()}.`,
        })
        .nullable()
    );

const OptionalDateSchema = (props: DateZodSchemaProps) =>
  z
    .any()
    .transform((val) => (!val ? undefined : val))
    .pipe(
      z.coerce
        .date({
          errorMap: (issue, { defaultError }) => ({
            message:
              issue.code === 'invalid_date'
                ? props.dateFormatErrorMessage || defaultError
                : defaultError,
          }),
        })
        .max(props.maxDate, {
          message: `Date cannot be later than ${props.maxDate.toLocaleDateString()}.`,
        })
        .min(props.minDate, {
          message: `Date cannot be earlier than ${props.minDate.toLocaleDateString()}.`,
        })
        .optional()
    );

const OptionalOrNullableDateSchema = (props: PostPatchZodDateSchemaProps) =>
  props.requestType === 'post'
    ? OptionalDateSchema({ ...props })
    : NullableDateSchema({ ...props });

const OptionalOrNullableNumberSchema = (
  props: PostPatchZodNumberSchemaProps
) =>
  props.requestType === 'post'
    ? OptionalNumberSchema({
        ...props,
      })
    : NullableNumberSchema({
        ...props,
      });

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
      value: OptionalStringSchema,
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
  allowed_values: AllowedValuesListSchema.nullable().optional(),
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
  });

export const CatalogueCategorySchema = z.object({
  name: MandatoryStringSchema({ errorMessage: 'Please enter a name.' }),
  is_leaf: MandatoryBooleanSchema({}),
  properties: z
    .array(CatalogueCategoryPostPropertySchema)
    .superRefine((data, ctx) => checkForDuplicatePropertyNames(data, ctx))
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
    drawing_number: OptionalOrNullableStringSchema({ requestType }),
    drawing_link: OptionalOrNullableURLSchema({
      requestType,
      errorMessage:
        'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted.',
    }),
    item_model_number: OptionalOrNullableStringSchema({ requestType }),
    notes: OptionalOrNullableStringSchema({ requestType }),
  });
};

export const PropertiesStepSchema = z.object({
  properties: z.array(z.discriminatedUnion('valueType', propertiesTypeList)),
});

// ------------------------------------ ITEMS ------------------------------------

export const ItemDetailsStepSchema = (requestType: RequestType) => {
  return z.object({
    purchase_order_number: OptionalOrNullableStringSchema({ requestType }),
    is_defective: MandatoryBooleanSchema({}),
    usage_status_id: MandatoryStringSchema({
      errorMessage: 'Please select a usage status.',
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
        const issues: z.ZodIssue[] = [];

        if (
          (typeof data.starting_value === 'number' ||
            typeof data.quantity === 'number') &&
          !data.serial_number?.includes('%s')
        ) {
          issues.push({
            path: ['serial_number'],
            message:
              'Please use %s to specify the location you want to append the number to serial number.',
            code: 'custom',
          });
        }

        if (
          typeof data.starting_value !== 'number' &&
          typeof data.quantity === 'number'
        ) {
          issues.push({
            path: ['starting_value'],
            message: 'Please enter a starting value.',
            code: 'custom',
          });
        }

        if (
          typeof data.starting_value === 'number' &&
          typeof data.quantity !== 'number'
        ) {
          issues.push({
            path: ['quantity'],
            message: 'Please enter a quantity value.',
            code: 'custom',
          });
        }

        // Add all queued issues in one loop
        issues.forEach((issue) => {
          ctx.addIssue(issue);
        });
        return data;
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

// ------------------------------------ SPARES ------------------------------------

export const SparesDefinitionSchema = z.object({
  usage_statuses: z.array(z.object({ id: z.string() })).min(1, {
    message: 'The list must have at least one item. Please add a usage status.',
  }),
});

// ------------------------------------ FILES ------------------------------------

export const FileSchemaPatch = z.object({
  file_name: MandatoryStringSchema({
    errorMessage: 'Please enter a file name.',
  }),
  title: NullableStringSchema,
  description: NullableStringSchema,
});
