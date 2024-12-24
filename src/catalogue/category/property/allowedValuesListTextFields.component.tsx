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
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  AddCatalogueCategoryWithPlacementIds,
  AddPropertyMigration,
} from '../../../app.types';

const AllowedValuesListTextFields = (props: {
  property?: AddCatalogueCategoryPropertyWithPlacementIds;
  nestIndex?: number;
}) => {
  const { property, nestIndex } = props;
  const {
    control,
    formState: { errors },
    clearErrors,
    watch,
    setValue,
  } = useFormContext<
    AddPropertyMigration | AddCatalogueCategoryWithPlacementIds
  >();

  const propertyRHF = watch();
  const { fields, append, remove } = useFieldArray({
    control,
    name:
      typeof nestIndex === 'number' && 'properties' in propertyRHF
        ? `properties.${nestIndex}.allowed_values.values.values`
        : `allowed_values.values.values`,
  });

  const allowedValuesIds = property?.allowed_values?.values?.values.map(
    (val) => val.av_placement_id
  );

  const clearDuplicateValueErrors = React.useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getErrorIndexes = (errorsArray: any) => {
      if (!Array.isArray(errorsArray)) {
        return [];
      }
      return errorsArray
        .map((error, index) =>
          error?.value?.message === 'Duplicate value.' ? index : -1
        )
        .filter((index) => index !== -1);
    };

    if ('allowed_values' in errors) {
      const errorIndexes = getErrorIndexes(
        errors?.allowed_values?.values?.values
      );
      errorIndexes.forEach((errorIndex) =>
        clearErrors(`allowed_values.values.values.${errorIndex}`)
      );
    } else if ('properties' in errors && typeof nestIndex === 'number') {
      const errorIndexes = getErrorIndexes(
        errors?.properties?.[nestIndex]?.allowed_values?.values?.values
      );
      errorIndexes.forEach((errorIndex) =>
        clearErrors(
          `properties.${nestIndex}.allowed_values.values.values.${errorIndex}`
        )
      );
    }
  }, [clearErrors, errors, nestIndex]);

  const clearDefaultValue = React.useCallback(
    (av_placement_id: string) => {
      if (
        'default_value' in propertyRHF &&
        av_placement_id === propertyRHF.default_value.value.av_placement_id
      ) {
        clearErrors('default_value.value.value');
        setValue('default_value', {
          valueType: `${propertyRHF.type}_${propertyRHF.mandatory}`,
          value: { av_placement_id: crypto.randomUUID(), value: '' },
        });
      }
    },
    [clearErrors, propertyRHF, setValue]
  );

  let allowedValueErrors:
    | Merge<
        FieldError,
        (
          | Merge<
              FieldError,
              FieldErrorsImpl<{
                av_placement_id: string;
                value: unknown;
              }>
            >
          | undefined
        )[]
      >
    | undefined;

  if ('allowed_values' in errors)
    allowedValueErrors = errors?.allowed_values?.values?.values;
  if ('properties' in errors && typeof nestIndex === 'number') {
    allowedValueErrors =
      errors?.properties?.[nestIndex]?.allowed_values?.values?.values;
  }

  return (
    <>
      {fields.map((field, index) => {
        let allowedValueError:
          | FieldError
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          | Merge<FieldError, FieldErrorsImpl<any>>
          | undefined = undefined;

        if ('allowed_values' in errors)
          allowedValueError =
            errors?.allowed_values?.values?.values?.[index]?.value;
        if ('properties' in errors && typeof nestIndex === 'number')
          allowedValueError =
            errors?.properties?.[nestIndex]?.allowed_values?.values?.values?.[
              index
            ]?.value;

        return (
          <Stack
            key={field.av_placement_id}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }}
            spacing={1}
          >
            <Controller
              control={control}
              name={
                typeof nestIndex === 'number' && 'properties' in propertyRHF
                  ? `properties.${nestIndex}.allowed_values.values.values.${index}`
                  : `allowed_values.values.values.${index}`
              }
              render={({ field: controllerField }) => (
                <TextField
                  disabled={allowedValuesIds?.includes(field.av_placement_id)}
                  id={`list-item-input-${controllerField.value.av_placement_id}`}
                  label={`List item`}
                  variant="outlined"
                  fullWidth
                  {...controllerField}
                  value={controllerField.value.value}
                  onChange={(event) => {
                    controllerField.onChange({
                      av_placement_id: controllerField.value.av_placement_id,
                      value: event.target.value,
                    });
                    clearDefaultValue(controllerField.value.av_placement_id);
                    clearDuplicateValueErrors();
                  }}
                  error={!!allowedValueError}
                  helperText={allowedValueError?.message as string}
                />
              )}
            />

            {!allowedValuesIds?.includes(field.av_placement_id) && (
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
