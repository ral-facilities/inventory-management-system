import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  AllowedValuesListType,
  CatalogueCategory,
  CatalogueCategoryPropertyPatch,
  CatalogueCategoryPropertyPost,
  CatalogueCategoryPropertyType,
} from '../../../api/api.types';
import {
  usePatchCatalogueCategoryProperty,
  usePostCatalogueCategoryProperty,
} from '../../../api/catalogueCategories';
import { useGetUnits } from '../../../api/units';
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  AddPropertyMigration,
} from '../../../app.types';
import WarningMessage from '../../../common/warningMessage.component';
import {
  CatalogueCategoryPropertyPatchSchema,
  CatalogueCategoryPropertyPostSchema,
  RequestType,
} from '../../../form.schemas';
import { transformAllowedValues } from '../catalogueCategoryDialog.component';
import AllowedValuesListTextFields from './allowedValuesListTextFields.component';

export const migrationWarningMessageText =
  'This action will permanently alter all existing items and catalogue items in this catalogue category. Please confirm that you understand the consequences by checking the box to proceed.';
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

export interface PropertyMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  type: RequestType;
  catalogueCategory: CatalogueCategory;
  selectedProperty?: AddCatalogueCategoryPropertyWithPlacementIds;
}

const PropertyMigrationDialog = (props: PropertyMigrationDialogProps) => {
  const { open, onClose, catalogueCategory, type, selectedProperty } = props;

  const formMethods = useForm<AddPropertyMigration>({
    resolver: zodResolver(
      type === 'post'
        ? CatalogueCategoryPropertyPostSchema
        : CatalogueCategoryPropertyPatchSchema
    ),
    defaultValues: {
      ...(type === 'post'
        ? {
            name: '',
            type: CatalogueCategoryPropertyType.Text,
            mandatory: 'false',
          }
        : selectedProperty),
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
    setIsMigrationWarningChecked(false);
  }, [clearErrors, onClose, reset]);

  const property = watch();

  const { mutate: postCatalogueCategoryProperty } =
    usePostCatalogueCategoryProperty();

  const { mutate: patchCatalogueCategoryProperty } =
    usePatchCatalogueCategoryProperty();

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

  const propertyAPIFormat = catalogueCategory.properties.find(
    (prop) => prop.name === selectedProperty?.name
  );

  const handleEditPropertyMigration = React.useCallback(
    (property: CatalogueCategoryPropertyPatch) => {
      const propertyNames = catalogueCategory.properties
        .map((prop) => prop.name)
        .filter((name) => name !== selectedProperty?.name);

      if (property.name && propertyNames.includes(property.name)) {
        setError('name', {
          message: 'Duplicate property name. Please change the name.',
        });
        return;
      }
      const patchProperty: CatalogueCategoryPropertyPatch = {};
      const isNameUpdated = property.name !== propertyAPIFormat?.name;

      const isAllowedValuesUpdated =
        JSON.stringify(property.allowed_values?.values) !==
        JSON.stringify(propertyAPIFormat?.allowed_values?.values);

      if (isNameUpdated) patchProperty.name = property.name;
      if (isAllowedValuesUpdated)
        patchProperty.allowed_values = property.allowed_values;

      if (propertyAPIFormat?.id && (isNameUpdated || isAllowedValuesUpdated)) {
        patchCatalogueCategoryProperty({
          catalogueCategory,
          property: patchProperty,
          propertyId: propertyAPIFormat.id,
        });
      } else {
        setError('name', {
          message:
            'There have been no changes made. Please change the name field value or press Close.',
        });
        return;
      }
      handleClose();
    },
    [
      catalogueCategory,
      handleClose,
      patchCatalogueCategoryProperty,
      propertyAPIFormat,
      selectedProperty,
      setError,
    ]
  );

  const onSubmit = (data: AddPropertyMigration) => {
    if (type === 'post') {
      const transformedData =
        transformAddPropertyMigrationToCatalogueCategoryPropertyPost(data);

      handleAddPropertyMigration(transformedData);
    } else {
      const transformedData: CatalogueCategoryPropertyPatch = {
        name: data.name,
        ...(data.allowed_values && {
          allowed_values: transformAllowedValues(data.allowed_values),
        }),
      };
      handleEditPropertyMigration(transformedData);
    }
  };
  const resetDefaultValue = () =>
    setValue('default_value', {
      valueType: `${property.type}_${property.mandatory}`,
      value: { av_placement_id: crypto.randomUUID(), value: '' },
    });

  const [isMigrationWarningChecked, setIsMigrationWarningChecked] =
    React.useState(false);
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === 'post' ? 'Add Property' : 'Edit Property'}
      </DialogTitle>
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
                disabled={type === 'patch'}
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
                    disabled={type === 'patch'}
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
                    property.type === CatalogueCategoryPropertyType.Boolean ||
                    type === 'patch'
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
                        property.type ===
                          CatalogueCategoryPropertyType.Boolean ||
                        type === 'patch'
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
                  <AllowedValuesListTextFields property={selectedProperty} />
                </FormProvider>
              </Stack>
            )}

          {type === 'post' && (
            <>
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
                              errors?.default_value?.value?.value
                                ?.message as string
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
                              av_placement_id:
                                defaultValue.value.av_placement_id,
                              value: newValue ? newValue.toLowerCase() : '',
                            },
                          });
                        }}
                        fullWidth
                        options={['True', 'False']}
                        isOptionEqualToValue={(option, value) =>
                          option.toLowerCase() == value.toLowerCase() ||
                          value == ''
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Default value"
                            variant="outlined"
                            required={property.mandatory === 'true'}
                            error={!!errors?.default_value?.value?.value}
                            helperText={
                              errors?.default_value?.value?.value
                                ?.message as string
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
                              av_placement_id:
                                defaultValue.value.av_placement_id,
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
            </>
          )}

          <Controller
            control={control}
            name={`unit_id`}
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                disabled={
                  property.type === CatalogueCategoryPropertyType.Boolean ||
                  type === 'patch'
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
                      property.type === CatalogueCategoryPropertyType.Boolean ||
                      type === 'patch'
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
                disabled={type === 'patch'}
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
                    disabled={type === 'patch'}
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
            <WarningMessage
              isChecked={isMigrationWarningChecked}
              setIsChecked={setIsMigrationWarningChecked}
              message={migrationWarningMessageText}
            />
          </Grid>
          <Grid
            item
            display="flex"
            sx={{ width: '100%', marginTop: 2, marginBottom: 1 }}
          >
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
                Object.values(errors).length !== 0 || !isMigrationWarningChecked
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

export default PropertyMigrationDialog;
