import { zodResolver } from '@hookform/resolvers/zod';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import {
  Controller,
  FormProvider,
  Resolver,
  useForm,
  useFormContext,
} from 'react-hook-form';
import z from 'zod';
import {
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
import { AddPropertyMigration } from '../../../app.types';
import {
  CatalogueCategoryPropertyPatchSchema,
  CatalogueCategoryPropertyPostSchema,
  CatalogueCategorySchema,
  RequestType,
} from '../../../form.schemas';
import { transformAllowedValues } from '../catalogueCategoryDialog.component';
import AllowedValuesListTextFields from './allowedValuesListTextFields.component';
import AllowedValuesController from './controllers/allowedValuesContoller.component';
import MandatoryController from './controllers/mandatoryContoller.component';
import TypeController from './controllers/typeContoller.component';
import UnitController from './controllers/unitContoller.component';

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

export interface PropertyDialogProps {
  open: boolean;
  onClose: (removeRow?: boolean) => void;
  type: RequestType;
  catalogueCategory?: CatalogueCategory;
  selectedProperty?: NonNullable<
    z.input<typeof CatalogueCategorySchema>['properties']
  >[number];
  isMigration: boolean;
  index?: number;
  isAdminMode: boolean;
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
    isAdminMode,
  } = props;

  const [isMigrationWarningChecked, setIsMigrationWarningChecked] =
    React.useState(false);

  const formMethodsAdd = useFormContext<
    z.input<typeof CatalogueCategorySchema>,
    undefined,
    z.output<typeof CatalogueCategorySchema>
  >();

  const {
    watch: watchAdd,
    control: controlAdd,
    register: registerAdd,
    formState: { errors: errorsAdd },
    setValue: setValueAdd,
    resetField: resetFieldAdd,
    trigger: triggerAdd,
  } = formMethodsAdd;

  const propertyAdd = watchAdd();

  const allowedValuesTypeAdd =
    propertyAdd.properties &&
    propertyAdd?.properties[index]?.allowed_values?.type;

  const typeAdd = propertyAdd.properties && propertyAdd.properties[index]?.type;

  const formMethodsMigPost = useForm({
    // Zod correctly validates and discriminates the `properties` union at runtime,
    // but TypeScript is unable to fully infer the resulting shape of complex
    // `z.discriminatedUnion` schemas (specifically the nested `value.value` field).
    // This causes the inferred resolver type from `zodResolver` to conflict with
    //  the form's declared `AddPropertyMigration` type, even though the runtime behaviour
    //  is correct.
    //  We therefore explicitly assert the resolver to `Resolver<AddPropertyMigration>`
    //  to bridge the gap between Zod's runtime guarantees and React Hook Form's
    resolver: zodResolver(
      CatalogueCategoryPropertyPostSchema
    ) as unknown as Resolver<AddPropertyMigration>,
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

  const formMethodsMigPatch = useForm({
    resolver: zodResolver(CatalogueCategoryPropertyPatchSchema),
    defaultValues: {
      ...selectedProperty,
      unit_id: selectedProperty?.unit_id ?? null,
    },
  });

  const { data: units } = useGetUnits();

  const {
    handleSubmit: handleSubmitMigPost,
    register: registerMigPost,
    formState: { errors: errorsMigPost },
    watch: watchMigPost,
    control: controlMigPost,
    setValue: setValueMigPost,
    clearErrors: clearErrorsMigPost,
    setError: setErrorMigPost,
    resetField: resetFieldMigPost,
    reset: resetMigPost,
  } = formMethodsMigPost;

  const {
    handleSubmit: handleSubmitMigPatch,
    register: registerMigPatch,
    formState: { errors: errorsMigPatch },
    watch: watchMigPatch,
    control: controlMigPatch,
    clearErrors: clearErrorsMigPatch,
    setError: setErrorMigPatch,
    reset: resetMigPatch,
  } = formMethodsMigPatch;

  const handleClose = React.useCallback(
    (removeRow?: boolean) => {
      resetMigPost();
      resetMigPatch();
      clearErrorsMigPost();
      clearErrorsMigPatch();
      onClose(removeRow);
      setIsMigrationWarningChecked(false);
    },
    [
      clearErrorsMigPatch,
      clearErrorsMigPost,
      onClose,
      resetMigPatch,
      resetMigPost,
    ]
  );

  const handleAddSubmit = React.useCallback(() => {
    triggerAdd(`properties.${index}`).then((isValid) => {
      if (isValid) {
        handleClose();
      }
    });
  }, [handleClose, index, triggerAdd]);

  const propertyMigPost = watchMigPost();

  const propertyMigPatch = watchMigPatch();

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
        if (type === 'post') {
          setErrorMigPost('name', {
            message: 'Duplicate property name. Please change the name.',
          });
        } else {
          setErrorMigPatch('name', {
            message: 'Duplicate property name. Please change the name.',
          });
        }
        return;
      }

      postCatalogueCategoryProperty({ catalogueCategory, property });
      handleClose();
    },
    [
      catalogueCategory,
      handleClose,
      postCatalogueCategoryProperty,
      setErrorMigPatch,
      setErrorMigPost,
      type,
    ]
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
        if (type === 'post') {
          setErrorMigPost('name', {
            message: 'Duplicate property name. Please change the name.',
          });
        } else {
          setErrorMigPatch('name', {
            message: 'Duplicate property name. Please change the name.',
          });
        }
        return;
      }
      const patchProperty: CatalogueCategoryPropertyPatch = {};
      const isNameUpdated = property.name !== propertyAPIFormat?.name;

      const isAllowedValuesUpdated =
        JSON.stringify(property.allowed_values?.values) !==
        JSON.stringify(propertyAPIFormat?.allowed_values?.values);

      const isUnitUpdated = property.unit_id !== propertyAPIFormat?.unit_id;

      if (isNameUpdated) patchProperty.name = property.name;
      if (isAllowedValuesUpdated)
        patchProperty.allowed_values = property.allowed_values;
      if (isUnitUpdated) patchProperty.unit_id = property.unit_id;

      if (
        propertyAPIFormat?.id &&
        (isNameUpdated || isAllowedValuesUpdated || isUnitUpdated)
      ) {
        patchCatalogueCategoryProperty({
          catalogueCategory,
          property: patchProperty,
          propertyId: propertyAPIFormat.id,
        });
      } else {
        if (type === 'post') {
          setErrorMigPost('name', {
            message: `There have been no changes made. Please change ${isAdminMode ? 'a' : 'the name'} field value or press Close.`,
          });
        } else {
          setErrorMigPatch('name', {
            message: `There have been no changes made. Please change ${isAdminMode ? 'a' : 'the name'} field value or press Close.`,
          });
        }
        return;
      }
      handleClose();
    },
    [
      catalogueCategory,
      handleClose,
      isAdminMode,
      patchCatalogueCategoryProperty,
      selectedProperty?.name,
      setErrorMigPatch,
      setErrorMigPost,
      type,
    ]
  );

  const onSubmitMigPost = React.useCallback(
    (data: AddPropertyMigration) => {
      const transformedData =
        transformAddPropertyMigrationToCatalogueCategoryPropertyPost(data);

      handleAddPropertyMigration(transformedData);
    },
    [handleAddPropertyMigration]
  );

  const onSubmitMigPatch = React.useCallback(
    (data: z.output<typeof CatalogueCategoryPropertyPatchSchema>) => {
      const transformedData: CatalogueCategoryPropertyPatch = {
        name: data.name,
        unit_id: data.unit_id,
        ...(data.allowed_values && {
          allowed_values: transformAllowedValues(data.allowed_values),
        }),
      };
      handleEditPropertyMigration(transformedData);
    },
    [handleEditPropertyMigration]
  );

  const resetDefaultValue = React.useCallback(
    () =>
      setValueMigPost('default_value', {
        valueType: `${propertyMigPost.type}_${propertyMigPost.mandatory}`,
        value: { av_placement_id: crypto.randomUUID(), value: '' },
      }),
    [propertyMigPost, setValueMigPost]
  );

  // Create a record object to switch between the correct property type based on isMigration
  const propertyType = isMigration
    ? propertyMigPost.type
    : propertyAdd?.properties?.[index]?.type;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {type === 'post'
          ? 'Add Property'
          : `Edit Property${isAdminMode ? ' as Admin' : ''}`}
        {isAdminMode && (
          <Tooltip
            title="As an admin, you can edit a property's unit"
            data-testid={'admin-status-tooltip'}
            placement="top"
            enterTouchDelay={0}
            arrow
            sx={{ mx: 2 }}
          >
            <InfoOutlinedIcon />
          </Tooltip>
        )}
      </DialogTitle>
      <DialogContent sx={{ pb: 0.5 }}>
        <Stack
          direction="column"
          spacing={1}
          sx={{
            px: 0.5,
            py: 1,
          }}
        >
          <TextField
            id={crypto.randomUUID()}
            label="Property Name"
            variant="outlined"
            required
            {...(isMigration
              ? type === 'post'
                ? registerMigPost('name')
                : registerMigPatch('name')
              : registerAdd(`properties.${index}.name`))}
            error={
              isMigration
                ? type === 'post'
                  ? !!errorsMigPost?.name
                  : !!errorsMigPatch?.name
                : !!errorsAdd?.properties?.[index]?.name
            }
            helperText={
              isMigration
                ? type === 'post'
                  ? errorsMigPost?.name?.message
                  : errorsMigPatch?.name?.message
                : errorsAdd?.properties?.[index]?.name?.message
            }
            fullWidth
          />
          {isMigration ? (
            <TypeController
              control={controlMigPost}
              name="type"
              disabled={type === 'patch'}
              extraOnChange={(formattedValue) => {
                resetDefaultValue();

                clearErrorsMigPost('default_value.value');
                clearErrorsMigPost('allowed_values');

                if (
                  propertyMigPost.allowed_values?.type &&
                  formattedValue !== CatalogueCategoryPropertyType.Boolean
                ) {
                  setValueMigPost(
                    'allowed_values.values.valueType',
                    formattedValue
                  );
                }

                if (formattedValue === CatalogueCategoryPropertyType.Boolean) {
                  resetFieldMigPost('allowed_values');
                  resetFieldMigPost('unit_id');
                }
              }}
            />
          ) : (
            <TypeController
              control={controlAdd}
              name={`properties.${index}.type`}
              extraOnChange={(formattedValue) => {
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
              }}
            />
          )}

          {isMigration ? (
            <AllowedValuesController
              control={controlMigPost}
              name={'allowed_values'}
              valueType={propertyMigPost.type}
              extraOnChange={() => {
                resetDefaultValue();
              }}
              disabled={
                propertyMigPost.type ===
                  CatalogueCategoryPropertyType.Boolean ||
                (type === 'patch' && isMigration)
              }
            />
          ) : (
            <AllowedValuesController
              control={controlAdd}
              name={`properties.${index}.allowed_values`}
              valueType={propertyAdd?.properties?.[index].type}
              disabled={
                propertyAdd?.properties?.[index].type ===
                CatalogueCategoryPropertyType.Boolean
              }
            />
          )}

          {isMigration &&
            type === 'post' &&
            propertyMigPost.allowed_values?.type === 'list' && (
              <Stack direction="column" spacing={1}>
                <FormProvider {...formMethodsMigPost}>
                  <AllowedValuesListTextFields property={selectedProperty} />
                </FormProvider>
              </Stack>
            )}

          {isMigration &&
            type === 'patch' &&
            propertyMigPatch.allowed_values?.type === 'list' && (
              <Stack direction="column" spacing={1}>
                <FormProvider {...formMethodsMigPatch}>
                  <AllowedValuesListTextFields property={selectedProperty} />
                </FormProvider>
              </Stack>
            )}

          {!isMigration &&
            allowedValuesTypeAdd &&
            typeAdd !== CatalogueCategoryPropertyType.Boolean && (
              <Stack direction="column" spacing={1}>
                <FormProvider {...formMethodsAdd}>
                  <AllowedValuesListTextFields propertyIndex={index} />
                </FormProvider>
              </Stack>
            )}

          {type === 'post' && isMigration && (
            <>
              {propertyMigPost.allowed_values?.type === 'list' ? (
                <Controller
                  control={controlMigPost}
                  name={`default_value`}
                  render={({ field: { value: defaultValue, onChange } }) => (
                    <Autocomplete
                      disableClearable={propertyMigPost.mandatory === 'true'}
                      id={crypto.randomUUID()}
                      value={defaultValue?.value || ''}
                      onChange={(_event, newValue) => {
                        onChange({
                          valueType: `${propertyMigPost.type}_${propertyMigPost.mandatory}`,
                          value:
                            newValue !== null
                              ? {
                                  av_placement_id: newValue.av_placement_id,
                                  value: newValue.value
                                    ? String(newValue.value)
                                    : '',
                                }
                              : null,
                        });
                      }}
                      fullWidth
                      options={
                        propertyMigPost.allowed_values
                          ? propertyMigPost.allowed_values.values.values.filter(
                              (val) => val.value
                            )
                          : []
                      }
                      getOptionLabel={(option) =>
                        option.value ? option.value.toString() : ''
                      }
                      getOptionKey={(option) => option.av_placement_id}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value ||
                        value.value === '' ||
                        value.value === undefined
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Default value"
                          variant="outlined"
                          required={propertyMigPost.mandatory === 'true'}
                          error={!!errorsMigPost?.default_value?.value?.value}
                          helperText={
                            errorsMigPost?.default_value?.value?.value
                              ?.message as string
                          }
                        />
                      )}
                    />
                  )}
                />
              ) : propertyType === CatalogueCategoryPropertyType.Boolean ? (
                <Controller
                  control={controlMigPost}
                  name={`default_value`}
                  render={({ field: { value: defaultValue, onChange } }) => {
                    return (
                      <Autocomplete
                        disableClearable={propertyMigPost.mandatory === 'true'}
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
                            valueType: `${propertyMigPost.type}_${propertyMigPost.mandatory}`,
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
                            required={propertyMigPost.mandatory === 'true'}
                            error={!!errorsMigPost?.default_value?.value?.value}
                            helperText={
                              errorsMigPost?.default_value?.value?.value
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
                  control={controlMigPost}
                  name={`default_value`}
                  render={({ field }) => {
                    const defaultValue = field.value;
                    return (
                      <TextField
                        required={propertyMigPost.mandatory === 'true'}
                        label="Default value"
                        id={crypto.randomUUID()}
                        variant="outlined"
                        {...field}
                        value={defaultValue?.value?.value ?? ''}
                        onChange={(event) => {
                          field.onChange({
                            valueType: `${propertyMigPost.type}_${propertyMigPost.mandatory}`,
                            value: {
                              av_placement_id:
                                defaultValue.value.av_placement_id,
                              value: event.target.value,
                            },
                          });
                        }}
                        error={!!errorsMigPost?.default_value?.value?.value}
                        helperText={
                          errorsMigPost?.default_value?.value?.value
                            ?.message as string
                        }
                        fullWidth
                      />
                    );
                  }}
                />
              )}
            </>
          )}

          {isMigration ? (
            type === 'post' ? (
              <UnitController
                control={controlMigPost}
                units={units}
                name={`unit_id`}
                disabled={
                  propertyMigPost.type === CatalogueCategoryPropertyType.Boolean
                }
                extraOnChange={() => {
                  clearErrorsMigPost();
                }}
              />
            ) : (
              <UnitController
                control={controlMigPatch}
                units={units}
                name={`unit_id`}
                disabled={
                  selectedProperty?.type ===
                    CatalogueCategoryPropertyType.Boolean || !isAdminMode
                }
                extraOnChange={() => {
                  clearErrorsMigPatch();
                }}
              />
            )
          ) : (
            <UnitController
              control={controlAdd}
              units={units}
              name={`properties.${index}.unit_id`}
              disabled={
                propertyAdd?.properties?.[index].type ===
                CatalogueCategoryPropertyType.Boolean
              }
            />
          )}

          {isMigration ? (
            <MandatoryController
              control={controlMigPost}
              name={`mandatory`}
              disabled={type === 'patch'}
              extraOnChange={(newValue) => {
                setValueMigPost(
                  'default_value.valueType',
                  `${propertyMigPost.type}_${newValue}`
                );
                clearErrorsMigPost('default_value.value');
              }}
            />
          ) : (
            <MandatoryController
              control={controlAdd}
              name={`properties.${index}.mandatory`}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Grid
          container
          size={12}
          sx={{
            px: 1.5,
          }}
        >
          {isMigration && (
            <Grid size={12}>
              <MigrationWarningMessage
                isChecked={isMigrationWarningChecked}
                setIsChecked={setIsMigrationWarningChecked}
              />
            </Grid>
          )}
          <Grid
            size={12}
            sx={{
              display: 'flex',
              marginTop: 2,
              marginBottom: 1,
            }}
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
              onClick={
                isMigration
                  ? type === 'post'
                    ? handleSubmitMigPost(onSubmitMigPost)
                    : handleSubmitMigPatch(onSubmitMigPatch)
                  : handleAddSubmit
              }
              disabled={
                isMigration
                  ? type === 'post'
                    ? Object.values(errorsMigPost).length !== 0 ||
                      !isMigrationWarningChecked
                    : Object.values(errorsMigPatch).length !== 0 ||
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
