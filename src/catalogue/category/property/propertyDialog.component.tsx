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
import {
  Control,
  Controller,
  FormProvider,
  UseFormReturn,
  useForm,
  useFormContext,
} from 'react-hook-form';
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
  AddCatalogueCategoryWithPlacementIds,
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

// Using `any` instead of `FieldPath` to avoid circular dependencies
function getProperty<T extends Record<string, unknown>>(
  obj: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  key: any
) {
  if (key === undefined) return undefined;

  const keys = key.toString().split('.');
  let current: unknown = obj;

  for (const part of keys) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

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

export interface PropertyDialogProps {
  open: boolean;
  onClose: (removeRow?: boolean) => void;
  type: RequestType;
  catalogueCategory?: CatalogueCategory;
  selectedProperty?: AddCatalogueCategoryPropertyWithPlacementIds;
  isMigration: boolean;
  index?: number;
}

const PropertyDialog = (props: PropertyDialogProps) => {
  const {
    open,
    onClose,
    catalogueCategory,
    type,
    selectedProperty,
    isMigration,
    index = 0,
  } = props;

  const formMethodsAdd = useFormContext<AddCatalogueCategoryWithPlacementIds>();

  const {
    watch: watchAdd,
    control: controlAdd,
    register: registerAdd,
    formState: { errors: errorsAdd },
    setValue: setValueAdd,
    resetField: resetFieldAdd,
    trigger: triggerAdd,
    clearErrors: clearErrorsAdd,
  } = formMethodsAdd;

  const propertyAdd = watchAdd();

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    const subscription = watchAdd((_, type) => {
      if (type.name && !!getProperty(errorsAdd, type.name)) {
        clearErrorsAdd(type.name);
      }
    });
    return () => subscription.unsubscribe();
  }, [clearErrorsAdd, errorsAdd, watchAdd]);

  const allowedValuesTypeAdd =
    propertyAdd.properties &&
    propertyAdd?.properties[index]?.allowed_values?.type;

  const typeAdd = propertyAdd.properties && propertyAdd.properties[index].type;

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

  const handleClose = React.useCallback(
    (removeRow?: boolean) => {
      reset();
      clearErrors();
      onClose(removeRow);
      setIsMigrationWarningChecked(false);
    },
    [clearErrors, onClose, reset]
  );

  const handleAddSubmit = React.useCallback(() => {
    triggerAdd(`properties.${index}`).then((isValid) => {
      if (isValid) {
        handleClose();
      }
    });
  }, [handleClose, index, triggerAdd]);
  const property = watch();

  const { mutate: postCatalogueCategoryProperty } =
    usePostCatalogueCategoryProperty();

  const { mutate: patchCatalogueCategoryProperty } =
    usePatchCatalogueCategoryProperty();

  const handleAddPropertyMigration = React.useCallback(
    (property: CatalogueCategoryPropertyPost) => {
      if (!catalogueCategory) return;
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

  const handleEditPropertyMigration = React.useCallback(
    (property: CatalogueCategoryPropertyPatch) => {
      if (!catalogueCategory) return;
      const propertyAPIFormat = catalogueCategory.properties.find(
        (prop) => prop.name === selectedProperty?.name
      );
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
  const newControl = (isMigration ? control : controlAdd) as Control<
    AddPropertyMigration | AddCatalogueCategoryWithPlacementIds,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
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
            {...(isMigration
              ? register('name')
              : registerAdd(`properties.${index}.name`))}
            error={
              isMigration
                ? !!errors?.name
                : !!errorsAdd?.properties?.[index]?.name
            }
            helperText={
              isMigration
                ? errors?.name?.message
                : errorsAdd?.properties?.[index]?.name?.message
            }
            fullWidth
          />
          <Controller
            control={newControl}
            name={isMigration ? 'type' : `properties.${index}.type`}
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                id={crypto.randomUUID()}
                disableClearable
                disabled={type === 'patch' && isMigration}
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

                  if (isMigration) {
                    resetDefaultValue();

                    clearErrors('default_value.value');
                    clearErrors('allowed_values');

                    if (
                      property.allowed_values?.type &&
                      formattedValue !== CatalogueCategoryPropertyType.Boolean
                    )
                      setValue(
                        'allowed_values.values.valueType',
                        formattedValue
                      );

                    if (
                      formattedValue === CatalogueCategoryPropertyType.Boolean
                    ) {
                      resetField('allowed_values');
                      resetField('unit_id');
                    }
                  } else {
                    if (
                      allowedValuesTypeAdd &&
                      formattedValue !== CatalogueCategoryPropertyType.Boolean
                    ) {
                      setValueAdd(
                        `properties.${index}.allowed_values.values.valueType`,
                        formattedValue
                      );
                    }

                    if (formattedValue === 'boolean') {
                      resetFieldAdd(`properties.${index}.allowed_values`);
                      resetFieldAdd(`properties.${index}.unit_id`);
                    }
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
                    disabled={type === 'patch' && isMigration}
                    required={true}
                    label="Select Type"
                    variant="outlined"
                  />
                )}
              />
            )}
          />
          <Controller
            control={newControl}
            name={
              isMigration
                ? `allowed_values`
                : `properties.${index}.allowed_values`
            }
            render={({ field: { value, onChange } }) => {
              return (
                <Autocomplete
                  disableClearable
                  disabled={
                    property.type === CatalogueCategoryPropertyType.Boolean ||
                    (type === 'patch' && isMigration)
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

                    if (isMigration) resetDefaultValue();

                    onChange(
                      formattedValue === 'list'
                        ? {
                            type: formattedValue,
                            values: {
                              valueType: isMigration
                                ? property.type
                                : propertyAdd?.properties?.[index].type,
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
                        (type === 'patch' && isMigration)
                      }
                    />
                  )}
                />
              );
            }}
          />
          {(isMigration
            ? property.allowed_values?.type === 'list' &&
              property.type !== CatalogueCategoryPropertyType.Boolean
            : allowedValuesTypeAdd &&
              typeAdd !== CatalogueCategoryPropertyType.Boolean) && (
            <Stack direction="column" spacing={1}>
              <FormProvider
                {...((isMigration
                  ? formMethods
                  : formMethodsAdd) as UseFormReturn<
                  AddCatalogueCategoryWithPlacementIds | AddPropertyMigration,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  any,
                  undefined
                >)}
              >
                <AllowedValuesListTextFields
                  property={isMigration ? selectedProperty : undefined}
                  propertyIndex={isMigration ? undefined : index}
                />
              </FormProvider>
            </Stack>
          )}

          {type === 'post' && isMigration && (
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
            control={newControl}
            name={isMigration ? `unit_id` : `properties.${index}.unit_id`}
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                disabled={
                  property.type === CatalogueCategoryPropertyType.Boolean ||
                  (type === 'patch' && isMigration)
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
                      (type === 'patch' && isMigration)
                    }
                  />
                )}
              />
            )}
          />
          <Controller
            control={newControl}
            name={isMigration ? `mandatory` : `properties.${index}.mandatory`}
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                disableClearable
                disabled={type === 'patch' && isMigration}
                id={crypto.randomUUID()}
                value={value === 'true' ? 'Yes' : 'No'}
                onChange={(_event, value) => {
                  const newValue = value === 'Yes' ? 'true' : 'false';
                  if (isMigration) {
                    setValue(
                      'default_value.valueType',
                      `${property.type}_${newValue}`
                    );
                    clearErrors('default_value.value');
                  }
                  onChange(newValue);
                }}
                fullWidth
                options={['Yes', 'No']}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select is mandatory?"
                    variant="outlined"
                    disabled={type === 'patch' && isMigration}
                  />
                )}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Grid container px={1.5}>
          {isMigration && (
            <Grid item sx={{ width: '100%' }}>
              <Grid item sx={{ width: '100%' }}>
                <WarningMessage
                  isChecked={isMigrationWarningChecked}
                  setIsChecked={setIsMigrationWarningChecked}
                  message={migrationWarningMessageText}
                />
              </Grid>
            </Grid>
          )}
          <Grid
            item
            display="flex"
            sx={{ width: '100%', marginTop: 2, marginBottom: 1 }}
          >
            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={() => handleClose(!isMigration)}
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={isMigration ? handleSubmit(onSubmit) : handleAddSubmit}
              disabled={
                isMigration
                  ? Object.values(errors).length !== 0 ||
                    !isMigrationWarningChecked
                  : errorsAdd?.properties?.[index] !== undefined
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

export default PropertyDialog;
