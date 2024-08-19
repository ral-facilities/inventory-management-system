import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import {
  AllowedValues,
  AllowedValuesListType,
  APIError,
  CatalogueCategory,
  CatalogueCategoryPost,
  CatalogueCategoryPostProperty,
  CatalogueCategoryProperty,
  CatalogueCategoryPropertyType,
} from '../../api/api.types';
import {
  usePatchCatalogueCategory,
  usePostCatalogueCategory,
} from '../../api/catalogueCategories';
import { useGetUnits } from '../../api/units';
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  AddCatalogueCategoryWithPlacementIds,
  AllowedValues as AllowedValuesPlaceholder,
} from '../../app.types';
import { CatalogueCategorySchema, RequestType } from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';
import CatalogueItemsPropertiesTable from './property/catalogueItemPropertiesTable.component';

// Function to convert a list of strings to a list of numbers
export const convertListToNumbers = (values: string[]): number[] => {
  return values.map((value) => parseFloat(value));
};

export interface CatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  requestType: RequestType;
  saveAs?: boolean;
  selectedCatalogueCategory?: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
}

//-------------------------------------Transform form type to API type----------------------------------
function transformToCatalogueCategoryPost(
  input: AddCatalogueCategoryWithPlacementIds
): CatalogueCategoryPost {
  return {
    name: input.name,
    is_leaf: String(input.is_leaf) === 'true',
    ...(input.parent_id && { parent_id: input.parent_id }),
    ...(input.properties &&
      input.properties.length !== 0 && {
        properties: input.properties.map(transformProperty),
      }),
  };
}

function transformProperty(
  property: AddCatalogueCategoryPropertyWithPlacementIds
): CatalogueCategoryPostProperty {
  return {
    name: property.name,
    type: property.type as CatalogueCategoryPropertyType, // Assuming 'type' field is already correct
    ...(property.unit_id && { unit_id: property.unit_id }),
    mandatory: String(property.mandatory) === 'true',
    ...(property.allowed_values && {
      allowed_values: transformAllowedValues(property.allowed_values),
    }),
  };
}

export function transformAllowedValues(
  allowedValues: AllowedValuesPlaceholder
): AllowedValues | undefined {
  if (allowedValues.type === 'list') {
    return {
      type: 'list',
      values: allowedValues.values.values.map((value) =>
        allowedValues.values.valueType === 'number'
          ? Number(value.value)
          : value.value
      ),
    };
  }
  return undefined;
}

//-------------------------------------Transform API type to form type----------------------------------

export function transformToAddCatalogueCategoryWithPlacementIds(
  input: CatalogueCategory
): AddCatalogueCategoryWithPlacementIds {
  return {
    name: input.name,
    is_leaf: input.is_leaf ? 'true' : 'false',
    parent_id: input.parent_id || null,
    properties: input.properties.map(transformPostPropertyToAddProperty),
  };
}

function transformPostPropertyToAddProperty(
  property: CatalogueCategoryProperty
): AddCatalogueCategoryPropertyWithPlacementIds {
  const allowedValuesWithId =
    property.allowed_values?.type === 'list'
      ? property.allowed_values.values.map((value) => ({
          av_placement_id: crypto.randomUUID(),
          value: String(value),
        }))
      : undefined;

  const modifiedCatalogueItemProperty: AddCatalogueCategoryPropertyWithPlacementIds =
    {
      name: property.name,
      type: property.type,
      unit: property.unit ?? undefined,
      unit_id: property.unit_id ?? undefined,
      mandatory: property.mandatory ? 'true' : 'false',
      cip_placement_id: crypto.randomUUID(),
      allowed_values:
        allowedValuesWithId && allowedValuesWithId.length > 0
          ? {
              type: 'list',
              values: {
                valueType: property.type as 'string' | 'number',
                values: allowedValuesWithId,
              },
            }
          : undefined,
    };

  return modifiedCatalogueItemProperty;
}

const AllowedValuesListTextFields = (props: { nestIndex: number }) => {
  const {
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext<AddCatalogueCategoryWithPlacementIds>();

  const { nestIndex } = props;

  const { fields, append, remove } = useFieldArray({
    control,
    name: `properties.${nestIndex}.allowed_values.values.values`, // Adjust the field name according to your data structure
  });

  const clearDuplicateValueErrors = React.useCallback(() => {
    const allowedValuesErrors = errors?.properties?.[nestIndex]?.allowed_values;
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
      clearErrors(
        `properties.${nestIndex}.allowed_values.values.values.${errorIndex}`
      );
    });
  }, [clearErrors, errors?.properties, nestIndex]);

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
              name={`properties.${nestIndex}.allowed_values.values.values.${index}`}
              render={({ field: controllerField }) => (
                <TextField
                  id={`list-item-input-${controllerField.value.av_placement_id}`}
                  label={`List item`}
                  variant="outlined"
                  {...controllerField}
                  value={controllerField.value.value}
                  onChange={(event) => {
                    controllerField.onChange({
                      av_placement_id: controllerField.value.av_placement_id,
                      value: event.target.value,
                    });
                    clearDuplicateValueErrors();
                  }}
                  error={
                    !!errors?.properties?.[nestIndex]?.allowed_values?.values
                      ?.values?.[index]?.value
                  }
                  helperText={
                    errors?.properties?.[nestIndex]?.allowed_values?.values
                      ?.values?.[index]?.value?.message as string
                  }
                />
              )}
            />

            <IconButton
              aria-label={`Delete list item`}
              onClick={() => {
                remove(index);
                clearDuplicateValueErrors();
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        );
      })}
      <IconButton
        aria-label={`Add list item`}
        onClick={() =>
          append({ av_placement_id: crypto.randomUUID(), value: '' })
        }
      >
        <AddIcon />
      </IconButton>
      {!!errors?.properties?.[nestIndex]?.allowed_values?.values?.values && (
        <FormHelperText error>
          {
            errors?.properties?.[nestIndex]?.allowed_values?.values?.values
              ?.message
          }
        </FormHelperText>
      )}
    </>
  );
};

const CatalogueCategoryDialog = (props: CatalogueCategoryDialogProps) => {
  const {
    open,
    onClose,
    parentId,
    requestType,
    saveAs,
    selectedCatalogueCategory,
    resetSelectedCatalogueCategory,
  } = props;

  const initialCatalogueCategory: AddCatalogueCategoryWithPlacementIds =
    React.useMemo(() => {
      if (
        (!selectedCatalogueCategory && (requestType === 'post' || !saveAs)) ||
        !selectedCatalogueCategory
      )
        return {
          name: '',
          parent_id: null,
          is_leaf: 'false', // Use 'false' as a string instead of a boolean
          properties: undefined,
        };

      return transformToAddCatalogueCategoryWithPlacementIds(
        selectedCatalogueCategory
      );
    }, [requestType, saveAs, selectedCatalogueCategory]);

  const formMethods = useForm<AddCatalogueCategoryWithPlacementIds>({
    resolver: zodResolver(CatalogueCategorySchema),
    defaultValues: initialCatalogueCategory,
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    control,
    setError,
    clearErrors,
    reset,
    resetField,
    setValue,
  } = formMethods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'properties',
  });

  const isLeaf = watch(`is_leaf`);

  // Load the values for editing.
  React.useEffect(() => {
    reset(initialCatalogueCategory);
  }, [initialCatalogueCategory, reset]);

  const { mutateAsync: postCatalogueCategory, isPending: isAddPending } =
    usePostCatalogueCategory();
  const { mutateAsync: patchCatalogueCategory, isPending: isEditPending } =
    usePatchCatalogueCategory();

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
    resetSelectedCatalogueCategory();
  }, [clearErrors, onClose, reset, resetSelectedCatalogueCategory]);

  const handleAddCatalogueCategory = React.useCallback(
    (data: CatalogueCategoryPost) => {
      postCatalogueCategory(data)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          const response = error.response?.data as APIError;
          if (response && error.response?.status === 409) {
            setError('name', {
              message:
                'A Catalogue category with the same name already exists within the same parent Catalogue category. Please enter a different name.',
            });
            return;
          }

          handleIMS_APIError(error);
        });
    },
    [handleClose, postCatalogueCategory, setError]
  );

  const handleEditCatalogueCategory = React.useCallback(
    (data: CatalogueCategoryPost) => {
      if (selectedCatalogueCategory) {
        const isNameUpdated = data.name !== selectedCatalogueCategory?.name;

        if (
          selectedCatalogueCategory.id && // Check if id is present
          isNameUpdated // Check if any of these properties have been updated
        ) {
          // Only call editCatalogueCategory if id is present and at least one of the properties has been updated
          patchCatalogueCategory({
            id: selectedCatalogueCategory.id,
            catalogueCategory: { name: data.name },
          })
            .then(() => {
              resetSelectedCatalogueCategory();
            })
            .catch((error: AxiosError) => {
              const response = error.response?.data as APIError;
              if (response && error.response?.status === 409) {
                setError('name', {
                  message:
                    'A Catalogue category with the same name already exists within the same parent Catalogue category. Please enter a different name.',
                });
                return;
              }

              handleIMS_APIError(error);
            });
        } else
          setError('name', {
            message:
              'There have been no changes made. Please change the name field value or press Close.',
          });
      }
    },
    [
      selectedCatalogueCategory,
      patchCatalogueCategory,
      resetSelectedCatalogueCategory,
      setError,
    ]
  );

  const onSubmit = (data: AddCatalogueCategoryWithPlacementIds) => {
    const transformedData = transformToCatalogueCategoryPost({
      ...data,
      ...(requestType === 'post' && parentId && { parent_id: parentId }),
    });

    if (requestType === 'patch') {
      handleEditCatalogueCategory(transformedData);
    } else {
      handleAddCatalogueCategory({
        ...transformedData,
      });
    }
  };

  const { data: units } = useGetUnits();
  const clearDuplicateNameErrors = React.useCallback(() => {
    const errorIndexes =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((errors?.properties as any[]) || [])
        .map((error, index) => {
          if (
            error?.name?.message ===
            'Duplicate property name. Please change the name or remove the property.'
          ) {
            return index;
          }
          return -1;
        })
        .filter((index) => index !== -1);

    errorIndexes.forEach((errorIndex) => {
      clearErrors(`properties.${errorIndex}.name`);
    });
  }, [clearErrors, errors?.properties]);

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>
        {requestType === 'patch'
          ? 'Edit Catalogue Category'
          : 'Add Catalogue Category'}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item container sx={{ mt: 1, alignItems: 'center' }}>
            <Grid item xs={requestType === 'patch' ? 11 : 12}>
              <TextField
                id="catalogue-category-name-input"
                label="Name"
                required
                sx={{ marginLeft: '4px', marginTop: '8px' }}
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
            </Grid>
            {requestType === 'patch' && (
              <Grid
                sx={{
                  alignItems: 'center',
                  marginTop: '8px',
                  justifyContent: 'center',
                  paddingLeft: 1,
                }}
                item
                xs={1}
              >
                <Button
                  size="large"
                  variant="outlined"
                  sx={{ width: '50%', mx: 1 }}
                  onClick={handleSubmit(onSubmit)}
                  disabled={
                    isEditPending ||
                    isAddPending ||
                    Object.values(errors).length !== 0
                  }
                  endIcon={
                    isAddPending || isEditPending ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                >
                  Save
                </Button>
              </Grid>
            )}
          </Grid>
          <Grid item>
            <Controller
              control={control}
              name="is_leaf"
              render={({ field: { value, onChange } }) => (
                <FormControl
                  disabled={requestType === 'patch'}
                  sx={{ margin: '8px' }}
                >
                  <FormLabel
                    id="controlled-radio-buttons-group"
                    sx={{ fontWeight: 'bold' }}
                    disabled={false}
                  >
                    Catalogue Directory Content
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={value}
                    onChange={(_event, value) => {
                      onChange(value);
                      if (value === 'true') setValue('properties', []);
                    }}
                  >
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label="Catalogue Categories"
                    />
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Catalogue Items"
                    />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Grid>
          {isLeaf === 'true' && (
            <>
              <Grid item>
                <Divider sx={{ minWidth: '700px' }} />
              </Grid>
              <Grid item sx={{ paddingLeft: 1, paddingTop: 3 }}>
                <Typography variant="h6">Catalogue Item Properties</Typography>
                {requestType === 'post' ? (
                  <>
                    {fields.map((field, index) => {
                      const properties = watch(`properties`);

                      const allowedValuesType =
                        properties &&
                        properties?.length > 0 &&
                        properties[index]?.allowed_values?.type;

                      const type =
                        properties &&
                        properties?.length > 0 &&
                        properties[index].type;

                      return (
                        <Stack
                          direction="row"
                          key={field.cip_placement_id}
                          spacing={1}
                          px={0.5}
                          py={1}
                        >
                          <TextField
                            id={crypto.randomUUID()}
                            label="Property Name"
                            variant="outlined"
                            required
                            {...register(`properties.${index}.name`)}
                            onChange={(event) => {
                              clearDuplicateNameErrors();
                              register(`properties.${index}.name`).onChange(
                                event
                              );
                            }}
                            error={!!errors?.properties?.[index]?.name}
                            helperText={
                              errors?.properties?.[index]?.name?.message
                            }
                            sx={{ minWidth: '150px', width: '150px' }}
                          />
                          <Controller
                            control={control}
                            name={`properties.${index}.type`}
                            render={({ field: { value, onChange } }) => (
                              <Autocomplete
                                id={crypto.randomUUID()}
                                disableClearable
                                value={(
                                  Object.keys(
                                    CatalogueCategoryPropertyType
                                  ) as Array<
                                    keyof typeof CatalogueCategoryPropertyType
                                  >
                                ).find(
                                  (key) =>
                                    CatalogueCategoryPropertyType[key] === value
                                )}
                                onChange={(_event, value) => {
                                  const formattedValue =
                                    CatalogueCategoryPropertyType[
                                      value as keyof typeof CatalogueCategoryPropertyType
                                    ];
                                  onChange(formattedValue);

                                  if (
                                    allowedValuesType &&
                                    formattedValue !== 'boolean'
                                  )
                                    setValue(
                                      `properties.${index}.allowed_values.values.valueType`,
                                      formattedValue
                                    );

                                  if (formattedValue === 'boolean') {
                                    resetField(
                                      `properties.${index}.allowed_values`
                                    );
                                    resetField(`properties.${index}.unit_id`);
                                  }
                                }}
                                sx={{
                                  minWidth: '150px',
                                  width: '150px',
                                }}
                                fullWidth
                                options={Object.keys(
                                  CatalogueCategoryPropertyType
                                )}
                                isOptionEqualToValue={(option, value) =>
                                  option == value || value == ''
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
                            name={`properties.${index}.allowed_values`}
                            render={({ field: { value, onChange } }) => {
                              return (
                                <Autocomplete
                                  disableClearable
                                  disabled={type === 'boolean'}
                                  id={crypto.randomUUID()}
                                  value={
                                    (
                                      Object.keys(
                                        AllowedValuesListType
                                      ) as Array<
                                        keyof typeof AllowedValuesListType
                                      >
                                    ).find(
                                      (key) =>
                                        AllowedValuesListType[key] ===
                                        value?.type
                                    ) ?? 'Any'
                                  }
                                  onChange={(_event, value) => {
                                    const formattedValue =
                                      AllowedValuesListType[
                                        value as keyof typeof AllowedValuesListType
                                      ];

                                    onChange(
                                      formattedValue === 'list'
                                        ? {
                                            type: formattedValue,
                                            values: {
                                              valueType: type,
                                              values: [],
                                            },
                                          }
                                        : undefined
                                    );
                                  }}
                                  sx={{
                                    width: '200px',
                                    minWidth: '200px',
                                  }}
                                  fullWidth
                                  options={Object.keys(AllowedValuesListType)}
                                  isOptionEqualToValue={(option, value) =>
                                    option.toLowerCase() ==
                                      value.toLowerCase() || value == ''
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      required={true}
                                      label="Select Allowed values"
                                      variant="outlined"
                                      disabled={type === 'boolean'}
                                    />
                                  )}
                                />
                              );
                            }}
                          />
                          {allowedValuesType === 'list' &&
                            type !== 'boolean' && (
                              <Stack
                                direction="column"
                                sx={{
                                  width: '200px',
                                  minWidth: '200px',
                                  alignItems: 'center',
                                  display: 'flex',
                                  justifyContent: 'center',
                                }}
                              >
                                <FormProvider {...formMethods}>
                                  <AllowedValuesListTextFields
                                    nestIndex={index}
                                  />
                                </FormProvider>
                              </Stack>
                            )}
                          <Controller
                            control={control}
                            name={`properties.${index}.unit_id`}
                            render={({ field: { value, onChange } }) => (
                              <Autocomplete
                                disabled={type === 'boolean'}
                                options={units ?? []}
                                getOptionLabel={(option) => option.value}
                                value={
                                  units?.find((unit) => unit.id === value) ||
                                  null
                                }
                                sx={{
                                  width: '200px',
                                  minWidth: '200px',
                                }}
                                onChange={(_event, unit) => {
                                  onChange(unit?.id ?? null);
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select Unit"
                                    variant="outlined"
                                    disabled={type === 'boolean'}
                                  />
                                )}
                              />
                            )}
                          />

                          <Controller
                            control={control}
                            name={`properties.${index}.mandatory`}
                            render={({ field: { value, onChange } }) => (
                              <Autocomplete
                                disableClearable
                                id={crypto.randomUUID()}
                                value={value === 'true' ? 'Yes' : 'No'}
                                onChange={(_event, value) => {
                                  onChange(value === 'Yes' ? 'true' : 'false');
                                }}
                                sx={{
                                  width: '150px',
                                  minWidth: '150px',
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
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <IconButton
                              aria-label={
                                'Delete catalogue category field entry'
                              }
                              onClick={() => {
                                remove(index);
                                clearDuplicateNameErrors();
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Stack>
                      );
                    })}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <IconButton
                        sx={{ margin: '8px' }}
                        onClick={() => {
                          append({
                            cip_placement_id: crypto.randomUUID(),
                            name: '',
                            type: CatalogueCategoryPropertyType.Text,
                            mandatory: 'false',
                          });
                        }}
                        aria-label={'Add catalogue category field entry'}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  selectedCatalogueCategory && (
                    <Box mt={1}>
                      <CatalogueItemsPropertiesTable
                        properties={fields}
                        requestType={requestType}
                        catalogueCategory={selectedCatalogueCategory}
                      />
                    </Box>
                  )
                )}
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', padding: '0px 24px' }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
        ></Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            my: 2,
          }}
        >
          <Button
            variant="outlined"
            sx={{ width: requestType === 'patch' ? '100%' : '50%', mx: 1 }}
            onClick={handleClose}
          >
            {requestType === 'post' ? 'Cancel' : 'Close'}
          </Button>
          {requestType === 'post' && (
            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={handleSubmit(onSubmit)}
              disabled={
                isEditPending ||
                isAddPending ||
                Object.values(errors).length !== 0
              }
              endIcon={
                isAddPending || isEditPending ? (
                  <CircularProgress size={20} />
                ) : null
              }
            >
              Save
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

CatalogueCategoryDialog.displayName = 'CatalogueCategoryDialog';

export default CatalogueCategoryDialog;
