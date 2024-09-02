import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import {
  AllowedValuesListType,
  CatalogueCategory,
  CatalogueCategoryPropertyPost,
  CatalogueCategoryPropertyType,
} from '../../../api/api.types';
import { usePostCatalogueCategoryProperty } from '../../../api/catalogueCategories';
import { useGetUnits } from '../../../api/units';
import { AddPropertyMigration } from '../../../app.types';
import { CatalogueCategoryPropertyPostSchema } from '../../../form.schemas';
import { transformAllowedValues } from '../catalogueCategoryDialog.component';

const AllowedValuesListTextFields = () => {
  const {
    control,
    formState: { errors },
    clearErrors,
    setValue,
    watch,
  } = useFormContext<AddPropertyMigration>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `allowed_values.values.values`, // Adjust the field name according to your data structure
  });

  const clearDuplicateValueErrors = React.useCallback(() => {
    const allowedValuesErrors = errors?.allowed_values;
    const errorIndexes =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((allowedValuesErrors?.values?.values as any[]) || [])
        .map((error, index) => {
          if (error?.value?.message === 'Duplicate value.') {
            return index;
          }
          return -1;
        })
        .filter((index) => index !== -1);

    errorIndexes.forEach((errorIndex) => {
      clearErrors(`allowed_values.values.values.${errorIndex}`);
    });
  }, [clearErrors, errors]);
  const property = watch();

  const clearDefaultValue = React.useCallback(
    (av_placement_id: string) => {
      if (av_placement_id === property.default_value.value.av_placement_id) {
        clearErrors('default_value.value.value');
        setValue('default_value', {
          valueType: `${property.type}_${property.mandatory}`,
          value: { av_placement_id: crypto.randomUUID(), value: '' },
        });
      }
    },
    [clearErrors, property, setValue]
  );

  return (
    <>
      {fields.map((field, index) => {
        return (
          <Stack
            key={field.av_placement_id}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }}
            spacing={1}
          >
            <Controller
              control={control}
              name={`allowed_values.values.values.${index}`}
              render={({ field: controllerField }) => (
                <TextField
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
                  error={
                    !!errors?.allowed_values?.values?.values?.[index]?.value
                  }
                  helperText={
                    errors?.allowed_values?.values?.values?.[index]?.value
                      ?.message as string
                  }
                />
              )}
            />
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
      {!!errors?.allowed_values?.values?.values && (
        <FormHelperText error>
          {errors?.allowed_values?.values?.values?.message}
        </FormHelperText>
      )}
    </>
  );
};

interface MigrationWarningMessageProps {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
}
export const MigrationWarningMessage = (
  props: MigrationWarningMessageProps
) => {
  const { isChecked, setIsChecked } = props;
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        mx: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={isChecked}
            onChange={(event) => {
              setIsChecked(event.target.checked);
            }}
            color="primary"
          />
        }
        label=""
        aria-label="Confirm understanding and proceed checkbox"
      />
      <WarningIcon
        sx={{
          pr: 2,
          fontSize: '50px',
          color: 'warning.main',
        }}
      />
      <Typography variant="body1">
        This action will permanently alter all existing items and catalogue
        items in this catalogue category. Please confirm that you understand the
        consequences by checking the box to proceed.
      </Typography>
    </Paper>
  );
};

function transformAddPropertyMigrationToCatalogueCategoryPropertyPost(
  property: AddPropertyMigration
): CatalogueCategoryPropertyPost {
  return {
    name: property.name,
    type: property.type as CatalogueCategoryPropertyType, // Assuming 'type' field is already correct
    ...(property.unit_id && { unit_id: property.unit_id }),
    mandatory: String(property.mandatory) === 'true',
    ...(property.allowed_values && {
      allowed_values: transformAllowedValues(property.allowed_values),
    }),
    ...(property.default_value && {
      default_value: property.default_value.value.value,
    }),
  };
}

export interface AddPropertyMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueCategory: CatalogueCategory;
}

const AddPropertyMigrationDialog = (props: AddPropertyMigrationDialogProps) => {
  const { open, onClose, catalogueCategory } = props;

  const formMethods = useForm<AddPropertyMigration>({
    resolver: zodResolver(CatalogueCategoryPropertyPostSchema),
    defaultValues: {
      name: '',
      type: CatalogueCategoryPropertyType.Text,
      mandatory: 'false',
      default_value: {
        valueType: 'string_false',
        value: { av_placement_id: crypto.randomUUID(), value: '' },
      },
    },
  });

  const { data: units } = useGetUnits();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    control,
    setValue,
    clearErrors,
    setError,
    resetField,
    reset,
  } = formMethods;

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
    setIsTermsAndConditionsChecked(false);
  }, [clearErrors, onClose, reset]);

  const property = watch();

  const { mutate: postCatalogueCategoryProperty } =
    usePostCatalogueCategoryProperty();

  const handleAddPropertyMigration = React.useCallback(
    (property: CatalogueCategoryPropertyPost) => {
      const propertyNames = catalogueCategory.properties.map(
        (prop) => prop.name
      );

      if (propertyNames.includes(property.name)) {
        setError('name', {
          message: 'Duplicate property name. Please change the name.',
        });
        return;
      }

      postCatalogueCategoryProperty({ catalogueCategory, property });
      handleClose();
    },
    [catalogueCategory, handleClose, postCatalogueCategoryProperty, setError]
  );

  const onSubmit = (data: AddPropertyMigration) => {
    const transformedData =
      transformAddPropertyMigrationToCatalogueCategoryPropertyPost(data);

    handleAddPropertyMigration(transformedData);
  };
  const resetDefaultValue = () =>
    setValue('default_value', {
      valueType: `${property.type}_${property.mandatory}`,
      value: { av_placement_id: crypto.randomUUID(), value: '' },
    });

  const [isTermsAndConditionsChecked, setIsTermsAndConditionsChecked] =
    React.useState(false);
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Property</DialogTitle>
      <DialogContent sx={{ pb: 0.5 }}>
        <Stack direction="column" spacing={1} px={0.5} py={1}>
          <TextField
            id={crypto.randomUUID()}
            label="Property Name"
            variant="outlined"
            required
            {...register('name')}
            error={!!errors?.name}
            helperText={errors?.name?.message}
            fullWidth
          />
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                id={crypto.randomUUID()}
                disableClearable
                value={(
                  Object.keys(CatalogueCategoryPropertyType) as Array<
                    keyof typeof CatalogueCategoryPropertyType
                  >
                ).find((key) => CatalogueCategoryPropertyType[key] === value)}
                onChange={(_event, value) => {
                  const formattedValue =
                    CatalogueCategoryPropertyType[
                      value as keyof typeof CatalogueCategoryPropertyType
                    ];
                  onChange(formattedValue);

                  resetDefaultValue();

                  clearErrors('default_value.value');
                  clearErrors('allowed_values');

                  if (
                    property.allowed_values?.type &&
                    formattedValue !== CatalogueCategoryPropertyType.Boolean
                  )
                    setValue('allowed_values.values.valueType', formattedValue);

                  if (
                    formattedValue === CatalogueCategoryPropertyType.Boolean
                  ) {
                    resetField('allowed_values');
                    resetField('unit_id');
                  }
                }}
                fullWidth
                options={Object.keys(CatalogueCategoryPropertyType)}
                isOptionEqualToValue={(option, value) =>
                  option === value || value === ''
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required={true}
                    label="Select Type"
                    variant="outlined"
                  />
                )}
              />
            )}
          />
          <Controller
            control={control}
            name={`allowed_values`}
            render={({ field: { value, onChange } }) => {
              return (
                <Autocomplete
                  disableClearable
                  disabled={
                    property.type === CatalogueCategoryPropertyType.Boolean
                  }
                  id={crypto.randomUUID()}
                  value={
                    (
                      Object.keys(AllowedValuesListType) as Array<
                        keyof typeof AllowedValuesListType
                      >
                    ).find(
                      (key) => AllowedValuesListType[key] === value?.type
                    ) ?? 'Any'
                  }
                  onChange={(_event, value) => {
                    const formattedValue =
                      AllowedValuesListType[
                        value as keyof typeof AllowedValuesListType
                      ];

                    resetDefaultValue();

                    onChange(
                      formattedValue === 'list'
                        ? {
                            type: formattedValue,
                            values: {
                              valueType: property.type,
                              values: [],
                            },
                          }
                        : undefined
                    );
                  }}
                  fullWidth
                  options={Object.keys(AllowedValuesListType)}
                  isOptionEqualToValue={(option, value) =>
                    option.toLowerCase() == value.toLowerCase() || value == ''
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Select Allowed values"
                      variant="outlined"
                      disabled={
                        property.type === CatalogueCategoryPropertyType.Boolean
                      }
                    />
                  )}
                />
              );
            }}
          />
          {property.allowed_values?.type === 'list' &&
            property.type !== CatalogueCategoryPropertyType.Boolean && (
              <Stack direction="column" spacing={1}>
                <FormProvider {...formMethods}>
                  <AllowedValuesListTextFields />
                </FormProvider>
              </Stack>
            )}
          {property.allowed_values?.type === 'list' ? (
            <Controller
              control={control}
              name={`default_value`}
              render={({ field: { value: defaultValue, onChange } }) => {
                return (
                  <Autocomplete
                    disableClearable={property.mandatory === 'true'}
                    componentsProps={{
                      clearIndicator: { onClick: resetDefaultValue },
                    }}
                    id={crypto.randomUUID()}
                    value={defaultValue?.value || ''}
                    onChange={(_event, newValue) => {
                      onChange({
                        valueType: `${property.type}_${property.mandatory}`,
                        value: newValue,
                      });
                    }}
                    fullWidth
                    options={
                      property.allowed_values
                        ? property.allowed_values.values.values.filter(
                            (val) => val.value
                          )
                        : []
                    }
                    getOptionLabel={(option) => option.value}
                    getOptionKey={(option) => option.av_placement_id}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value.value || value.value === ''
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Default value"
                        variant="outlined"
                        required={property.mandatory === 'true'}
                        error={!!errors?.default_value?.value?.value}
                        helperText={
                          errors?.default_value?.value?.value?.message as string
                        }
                      />
                    )}
                  />
                );
              }}
            />
          ) : property.type === CatalogueCategoryPropertyType.Boolean ? (
            <Controller
              control={control}
              name={`default_value`}
              render={({ field: { value: defaultValue, onChange } }) => {
                return (
                  <Autocomplete
                    disableClearable={property.mandatory === 'true'}
                    componentsProps={{
                      clearIndicator: { onClick: resetDefaultValue },
                    }}
                    id={crypto.randomUUID()}
                    value={
                      defaultValue?.value?.value
                        ? String(defaultValue.value.value)
                            .charAt(0)
                            .toUpperCase() +
                          String(defaultValue.value.value).slice(1)
                        : ''
                    }
                    onChange={(_event, newValue) => {
                      onChange({
                        valueType: `${property.type}_${property.mandatory}`,
                        value: {
                          av_placement_id: defaultValue.value.av_placement_id,
                          value: newValue ? newValue.toLowerCase() : '',
                        },
                      });
                    }}
                    fullWidth
                    options={['True', 'False']}
                    isOptionEqualToValue={(option, value) =>
                      option.toLowerCase() == value.toLowerCase() || value == ''
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Default value"
                        variant="outlined"
                        required={property.mandatory === 'true'}
                        error={!!errors?.default_value?.value?.value}
                        helperText={
                          errors?.default_value?.value?.value?.message as string
                        }
                      />
                    )}
                  />
                );
              }}
            />
          ) : (
            <Controller
              control={control}
              name={`default_value`}
              render={({ field }) => {
                const defaultValue = field.value;
                return (
                  <TextField
                    required={property.mandatory === 'true'}
                    label="Default value"
                    id={crypto.randomUUID()}
                    variant="outlined"
                    {...field}
                    value={defaultValue?.value?.value ?? ''}
                    onChange={(event) => {
                      field.onChange({
                        valueType: `${property.type}_${property.mandatory}`,
                        value: {
                          av_placement_id: defaultValue.value.av_placement_id,
                          value: event.target.value,
                        },
                      });
                    }}
                    error={!!errors?.default_value?.value?.value}
                    helperText={
                      errors?.default_value?.value?.value?.message as string
                    }
                    fullWidth
                  />
                );
              }}
            />
          )}
          <Controller
            control={control}
            name={`unit_id`}
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                disabled={
                  property.type === CatalogueCategoryPropertyType.Boolean
                }
                id={crypto.randomUUID()}
                options={units ?? []}
                getOptionLabel={(option) => option.value}
                value={units?.find((unit) => unit.id === value) || null}
                fullWidth
                onChange={(_event, unit) => {
                  onChange(unit?.id ?? null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Unit"
                    variant="outlined"
                    disabled={
                      property.type === CatalogueCategoryPropertyType.Boolean
                    }
                  />
                )}
              />
            )}
          />
          <Controller
            control={control}
            name={`mandatory`}
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                disableClearable
                id={crypto.randomUUID()}
                value={value === 'true' ? 'Yes' : 'No'}
                onChange={(_event, value) => {
                  const newValue = value === 'Yes' ? 'true' : 'false';
                  setValue(
                    'default_value.valueType',
                    `${property.type}_${newValue}`
                  );
                  clearErrors('default_value.value');
                  onChange(newValue);
                }}
                fullWidth
                options={['Yes', 'No']}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select is mandatory?"
                    variant="outlined"
                  />
                )}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Grid container px={1.5}>
          <Grid item sx={{ width: '100%' }}>
            <MigrationWarningMessage
              isChecked={isTermsAndConditionsChecked}
              setIsChecked={setIsTermsAndConditionsChecked}
            />
          </Grid>
          <Grid item display="flex" sx={{ width: '100%', marginTop: 2 }}>
            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={handleSubmit(onSubmit)}
              disabled={
                Object.values(errors).length !== 0 ||
                !isTermsAndConditionsChecked
              }
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default AddPropertyMigrationDialog;
