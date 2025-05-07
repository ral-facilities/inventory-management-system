import { zodResolver } from '@hookform/resolvers/zod';
import {
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
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  AllowedValues,
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
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  AddCatalogueCategoryWithPlacementIds,
  AllowedValues as AllowedValuesPlaceholder,
} from '../../app.types';
import { CatalogueCategorySchema, RequestType } from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';
import { createFormControlWithRootErrorClearing } from '../../utils';
import CatalogueItemsPropertiesTable from './property/catalogueItemPropertiesTable.component';

// Function to convert a list of strings to a list of numbers
export const convertListToNumbers = (values: string[]): number[] => {
  return values.map((value) => parseFloat(value));
};

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

const formControl =
  createFormControlWithRootErrorClearing<AddCatalogueCategoryWithPlacementIds>({
    // @ts-expect-error: The callback is missing name, when the type exist
    customCallback: ({ name, errors }) => {
      if (errors && !!getProperty(errors, name)) {
        formControl.clearErrors(name);
      }
    },
  });

export interface CatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  selectedCatalogueCategory?: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
  requestType: RequestType;
  duplicate?: boolean;
}

const CatalogueCategoryDialog = (props: CatalogueCategoryDialogProps) => {
  const {
    open,
    onClose,
    parentId,
    requestType,
    duplicate,
    selectedCatalogueCategory,
    resetSelectedCatalogueCategory,
  } = props;

  const initialCatalogueCategory: AddCatalogueCategoryWithPlacementIds =
    React.useMemo(() => {
      const emptyCatalogueCategory: AddCatalogueCategoryWithPlacementIds = {
        name: '',
        parent_id: null,
        is_leaf: 'false',
        properties: undefined,
      };
      if (
        !selectedCatalogueCategory &&
        (requestType === 'post' || !duplicate)
      ) {
        return emptyCatalogueCategory;
      }

      // Only call transformToAddCatalogueCategoryWithPlacementIds if selectedCatalogueCategory is defined
      if (selectedCatalogueCategory) {
        return transformToAddCatalogueCategoryWithPlacementIds(
          selectedCatalogueCategory
        );
      }

      // Add a fallback in case selectedCatalogueCategory is undefined
      return emptyCatalogueCategory;
    }, [requestType, duplicate, selectedCatalogueCategory]);

  const formMethods = useForm<AddCatalogueCategoryWithPlacementIds>({
    formControl,
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
    setValue,
  } = formMethods;

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
                'A catalogue category with the same name already exists within the same parent catalogue category. Please enter a different name.',
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
          }).catch((error: AxiosError) => {
            const response = error.response?.data as APIError;
            if (response && error.response?.status === 409) {
              setError('name', {
                message:
                  'A catalogue category with the same name already exists within the same parent catalogue category. Please enter a different name.',
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
    [selectedCatalogueCategory, patchCatalogueCategory, setError]
  );

  const onSubmit = (data: AddCatalogueCategoryWithPlacementIds) => {
    const transformedData = transformToCatalogueCategoryPost({
      ...data,
      ...(requestType === 'post' && parentId && { parent_id: parentId }),
    });
    if (requestType === 'patch') {
      handleEditCatalogueCategory(transformedData);
    } else {
      handleAddCatalogueCategory({ ...transformedData });
    }
  };

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
                <Box mt={1}>
                  <FormProvider {...formMethods}>
                    <CatalogueItemsPropertiesTable
                      requestType={requestType}
                      catalogueCategory={selectedCatalogueCategory}
                    />
                  </FormProvider>
                </Box>
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
