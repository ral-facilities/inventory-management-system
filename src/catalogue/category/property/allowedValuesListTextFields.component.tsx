import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  FormHelperText,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import React from 'react';
import {
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import z from 'zod';
import {
  CatalogueCategoryPropertyPatchSchema,
  CatalogueCategoryPropertyPostSchema,
  CatalogueCategorySchema,
} from '../../../form.schemas';

type AllowedValueErrors =
  | Merge<
      FieldError,
      (
        | Merge<
            FieldError,
            FieldErrorsImpl<{ av_placement_id: string; value: unknown }>
          >
        | undefined
      )[]
    >
  | undefined;

function getByPath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (current, key) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[key]
          : undefined,
      obj
    );
}

export interface AllowedValuesListTextFieldsProps {
  name: 'allowed_values' | `properties.${number}.allowed_values`;
  lockedPlacementIds?: string[];
  hasDefaultValue?: boolean;
}

const AllowedValuesListTextFields = (
  props: AllowedValuesListTextFieldsProps
) => {
  const { name, lockedPlacementIds, hasDefaultValue } = props;
  const {
    control,
    formState: { errors },
    clearErrors,
    watch,
    setValue,
  } = useFormContext<
    | z.input<typeof CatalogueCategoryPropertyPostSchema>
    | z.input<typeof CatalogueCategorySchema>
    | z.input<typeof CatalogueCategoryPropertyPatchSchema>,
    undefined,
    | z.output<typeof CatalogueCategoryPropertyPostSchema>
    | z.output<typeof CatalogueCategorySchema>
    | z.output<typeof CatalogueCategoryPropertyPatchSchema>
  >();

  const propertyRHF = watch();
  const valuesName = `${name}.values.values` as const;

  const { fields, append, remove } = useFieldArray({
    control,
    name: valuesName,
  });

  const clearDuplicateValueErrors = React.useCallback(() => {
    const errorsArray = getByPath(errors, valuesName);
    if (!Array.isArray(errorsArray)) return;

    errorsArray.forEach((error, index) => {
      if (error?.value?.message === 'Duplicate value.') {
        clearErrors(
          // Composed from `name`, which is always a valid path on the host form.
          `${valuesName}.${index}` as Parameters<typeof clearErrors>[0]
        );
      }
    });
  }, [clearErrors, errors, valuesName]);

  const clearDefaultValue = React.useCallback(
    (av_placement_id: string) => {
      if (
        hasDefaultValue &&
        'default_value' in propertyRHF &&
        av_placement_id === propertyRHF.default_value.value.av_placement_id
      ) {
        clearErrors('default_value.value.value');
        setValue('default_value', {
          valueType: `${propertyRHF.type}_${propertyRHF.mandatory}` as z.input<
            typeof CatalogueCategoryPropertyPostSchema
          >['default_value']['valueType'],
          value: { av_placement_id: crypto.randomUUID(), value: '' },
        });
      }
    },
    [clearErrors, hasDefaultValue, propertyRHF, setValue]
  );

  const allowedValueErrors = getByPath(
    errors,
    valuesName
  ) as AllowedValueErrors;

  return (
    <>
      {fields.map((field, index) => {
        const allowedValueError = getByPath(
          errors,
          `${valuesName}.${index}.value`
        ) as FieldError | undefined;

        return (
          <Stack
            key={field.av_placement_id}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }}
            spacing={1}
          >
            <Controller
              control={control}
              name={`${valuesName}.${index}` as const}
              render={({ field: controllerField }) => (
                <TextField
                  disabled={lockedPlacementIds?.includes(field.av_placement_id)}
                  id={`list-item-input-${controllerField.value?.av_placement_id}`}
                  label="List item"
                  variant="outlined"
                  fullWidth
                  {...controllerField}
                  value={controllerField.value?.value}
                  onChange={(event) => {
                    controllerField.onChange({
                      av_placement_id: controllerField.value?.av_placement_id,
                      value: event.target.value,
                    });
                    clearDefaultValue(
                      controllerField.value?.av_placement_id ?? ''
                    );
                    clearDuplicateValueErrors();
                  }}
                  error={!!allowedValueError}
                  helperText={allowedValueError?.message as string}
                />
              )}
            />

            {!lockedPlacementIds?.includes(field.av_placement_id) && (
              <Tooltip title="Delete Allowed Value">
                <span>
                  <IconButton
                    aria-label={`Delete list item`}
                    onClick={() => {
                      clearDefaultValue(field.av_placement_id);
                      remove(index);
                      clearDuplicateValueErrors();
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        );
      })}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Tooltip title="Add Allowed Value">
          <span>
            <IconButton
              aria-label={`Add list item`}
              onClick={() =>
                append({ av_placement_id: crypto.randomUUID(), value: '' })
              }
            >
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      {!!allowedValueErrors && (
        <FormHelperText error>{allowedValueErrors?.message}</FormHelperText>
      )}
    </>
  );
};

export default AllowedValuesListTextFields;
