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
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { APIError } from '../../api/api.types';
import {
  useAddCatalogueCategory,
  useEditCatalogueCategory,
} from '../../api/catalogueCategories';
import {
  AddCatalogueCategory,
  AddCatalogueCategoryProperty,
  AddCatalogueCategoryPropertyWithPlacementIds,
  AddCatalogueCategoryWithPlacementIds,
  AllowedValuesListErrorsType,
  CatalogueCategory,
  CatalogueItemPropertiesErrorsType,
  EditCatalogueCategory,
} from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { generateUniqueId, trimStringValues } from '../../utils';
import CataloguePropertiesForm from './cataloguePropertiesForm.component';

// Function to convert a list of strings to a list of numbers
export const convertListToNumbers = (values: string[]): number[] => {
  return values.map((value) => parseFloat(value));
};
export interface CatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  type: 'add' | 'edit' | 'duplicate';
  selectedCatalogueCategory?: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
}

const CatalogueCategoryDialog = React.memo(
  (props: CatalogueCategoryDialogProps) => {
    const {
      open,
      onClose,
      parentId,
      type,
      selectedCatalogueCategory,
      resetSelectedCatalogueCategory,
    } = props;

    const [categoryData, setCategoryData] =
      React.useState<AddCatalogueCategoryWithPlacementIds>({
        name: '',
        parent_id: null,
        is_leaf: false,
        properties: undefined,
      });

    React.useEffect(() => {
      if (selectedCatalogueCategory) {
        const updatedCatalogueItemProperties =
          selectedCatalogueCategory.properties?.map((property) => {
            // Transform allowed_values to an array of objects with id and value keys
            const allowedValuesWithId = property.allowed_values?.values.map(
              (value) => ({
                av_placement_id: generateUniqueId('av_placement_id_'), // Allowed values (av)
                value: value,
              })
            ) || [
              {
                av_placement_id: generateUniqueId('av_placement_id_'),
                value: '',
              },
            ]; // Default case if allowed_values is undefined or empty

            let modifiedCatalogueItemProperties = {
              ...property,
              cip_placement_id: generateUniqueId('cip_placement_id_'),
              id: undefined,
            };

            if (property.allowed_values) {
              modifiedCatalogueItemProperties = {
                ...modifiedCatalogueItemProperties,
                allowed_values: {
                  type: property.allowed_values?.type,
                  values: allowedValuesWithId,
                },
              };
            }

            return modifiedCatalogueItemProperties;
          }) || undefined;

        const updatedSelectedCatalogueCategory: AddCatalogueCategoryWithPlacementIds =
          {
            ...selectedCatalogueCategory,
            properties: updatedCatalogueItemProperties,
          };

        setCategoryData(
          // This is not ideal but fixes the properties being reset when closing the dialog
          // The array itself is stored as a reference in typescript meaning that modifying
          // categoryData.properties without this will also modify
          // selectedCatalogueCategory.properties preventing any modified fields
          // from being reset
          // This ensures the array created is brand new with a different reference to fix it
          // See https://stackoverflow.com/questions/9885821/copying-of-an-array-of-objects-to-another-array-without-object-reference-in-java

          JSON.parse(
            JSON.stringify(updatedSelectedCatalogueCategory)
          ) as AddCatalogueCategoryWithPlacementIds
        );
      }
    }, [selectedCatalogueCategory]);

    const [nameError, setNameError] = React.useState<string | undefined>(
      undefined
    );

    const [formError, setFormError] = React.useState<string | undefined>(
      undefined
    );

    // State to manage list item errors
    const [allowedValuesListErrors, setAllowedValuesListErrors] =
      React.useState<AllowedValuesListErrorsType[]>([]);

    const { mutateAsync: addCatalogueCategory, isPending: isAddPending } =
      useAddCatalogueCategory();
    const { mutateAsync: editCatalogueCategory, isPending: isEditPending } =
      useEditCatalogueCategory();

    const [catalogueItemPropertiesErrors, setCatalogueItemPropertiesErrors] =
      React.useState<CatalogueItemPropertiesErrorsType[]>([]);

    const handleClose = React.useCallback(() => {
      onClose();
      setNameError(undefined);
      setCategoryData({
        name: '',
        parent_id: null,
        is_leaf: false,
        properties: undefined,
      });
      setCatalogueItemPropertiesErrors([]);
      setAllowedValuesListErrors([]);
      setFormError(undefined);
      resetSelectedCatalogueCategory();
    }, [onClose, resetSelectedCatalogueCategory]);

    // Reset errors when required
    const handleFormChange = (
      newCategoryData: AddCatalogueCategoryWithPlacementIds
    ) => {
      setCategoryData(newCategoryData);

      if (newCategoryData.name !== categoryData.name) setNameError(undefined);
      setFormError(undefined);
    };

    const validateAllowedValuesList = (
      catalogueItemProperties: AddCatalogueCategoryPropertyWithPlacementIds[]
    ): boolean => {
      let hasErrors = false;

      catalogueItemProperties.forEach((property) => {
        if (property.allowed_values?.type === 'list') {
          const trimmedLowerCaseValues = property.allowed_values.values.map(
            (val) => ({
              av_placement_id: val.av_placement_id,
              value: String(val.value).trim().toLowerCase(),
            })
          );
          const duplicateIds: string[] = [];
          const invalidNumberIds: string[] = [];
          const missingValueIds: string[] = [];

          trimmedLowerCaseValues.forEach((value, i) => {
            for (let j = i + 1; j < trimmedLowerCaseValues.length; j++) {
              const isDuplicate =
                property.type === 'number'
                  ? Number(value.value) ===
                    Number(trimmedLowerCaseValues[j].value)
                  : value.value === trimmedLowerCaseValues[j].value;

              if (isDuplicate && value.value) {
                duplicateIds.push(
                  value.av_placement_id,
                  trimmedLowerCaseValues[j].av_placement_id
                );
              }
            }

            if (!value.value) {
              missingValueIds.push(value.av_placement_id);
            } else if (
              property.type === 'number' &&
              (isNaN(+value.value) || !value.value)
            ) {
              invalidNumberIds.push(value.av_placement_id);
            }
          });

          if (
            // If there are more than 2 instances of the same duplicate value, it adds the ID multiple times.
            // The set removes the repeated IDs.
            Array.from(new Set(duplicateIds)).length > 0 ||
            invalidNumberIds.length > 0 ||
            missingValueIds.length > 0
          ) {
            // Update listItemErrors state with the error IDs
            // The useState below is order-dependent since the duplicate error could occur simultaneously with the errors above.
            // The error above should be displayed first.

            setAllowedValuesListErrors((prev) => [
              ...prev,
              {
                cip_placement_id: property.cip_placement_id,
                errors: [
                  ...(prev.find(
                    (prevValue) =>
                      prevValue.cip_placement_id === property.cip_placement_id
                  )?.errors || []),
                  ...invalidNumberIds.map((id) => ({
                    av_placement_id: id,
                    errorMessage: 'Please enter a valid number',
                  })),
                  ...missingValueIds.map((id) => ({
                    av_placement_id: id,
                    errorMessage: 'Please enter a value',
                  })),
                  ...Array.from(new Set(duplicateIds)).map((id) => ({
                    av_placement_id: id,
                    errorMessage: 'Duplicate value',
                  })),
                ],
              },
            ]);

            hasErrors = true;
          }
        }
      });

      return hasErrors;
    };

    const validateFormFields = React.useCallback(() => {
      let hasErrors = false;
      if (categoryData.properties && categoryData.properties?.length > 0) {
        for (let i = 0; i < categoryData.properties.length; i++) {
          if (!categoryData.properties[i].name.trim()) {
            setCatalogueItemPropertiesErrors((prev) => [
              ...prev,
              {
                cip_placement_id: categoryData.properties
                  ? categoryData.properties[i].cip_placement_id
                  : '',
                errors: {
                  fieldName: 'name',
                  errorMessage: 'Please enter a property name',
                },
              },
            ]);
            hasErrors = true;
          }

          if (!categoryData.properties[i].type.trim()) {
            setCatalogueItemPropertiesErrors((prev) => [
              ...prev,
              {
                cip_placement_id: categoryData.properties
                  ? categoryData.properties[i].cip_placement_id
                  : '',
                errors: {
                  fieldName: 'type',
                  errorMessage: 'Please select a type',
                },
              },
            ]);

            hasErrors = true;
          }

          if (categoryData.properties[i].allowed_values?.values.length === 0) {
            setCatalogueItemPropertiesErrors((prev) => [
              ...prev,
              {
                cip_placement_id: categoryData.properties
                  ? categoryData.properties[i].cip_placement_id
                  : '',
                errors: {
                  fieldName: 'allowed_values',
                  errorMessage: 'Please create a valid list item',
                },
              },
            ]);

            hasErrors = true;
          }
        }

        const listOfPropertyNames: string[] = categoryData.properties.map(
          (property) => property.name.toLowerCase().trim()
        );

        const duplicateIds: string[] = [];

        listOfPropertyNames.forEach((value, i) => {
          for (let j = i + 1; j < listOfPropertyNames.length; j++) {
            if (value === listOfPropertyNames[j]) {
              duplicateIds.push(
                categoryData.properties
                  ? categoryData.properties[i].cip_placement_id
                  : '',
                categoryData.properties
                  ? categoryData.properties[j].cip_placement_id
                  : ''
              );
            }
          }
        });

        const uniqueDuplicateIds = Array.from(new Set(duplicateIds));
        for (let i = 0; i < uniqueDuplicateIds.length; i++) {
          setCatalogueItemPropertiesErrors((prev) => [
            ...prev,
            {
              cip_placement_id: uniqueDuplicateIds[i],
              errors: {
                fieldName: 'name',
                errorMessage:
                  'Duplicate property name. Please change the name or remove the property',
              },
            },
          ]);
          hasErrors = true;
        }

        const hasAllowedValuesListErrors = validateAllowedValuesList(
          categoryData.properties
        );

        if (hasAllowedValuesListErrors) {
          hasErrors = true;
        }
      }
      return hasErrors;
    }, [categoryData]);

    const clearFormFields = React.useCallback(() => {
      setCatalogueItemPropertiesErrors([]);
    }, []);

    const handleErrorStates = React.useCallback(() => {
      let hasErrors = false;
      if (!categoryData.name || categoryData.name.trim() === '') {
        setNameError('Please enter a name.');
        hasErrors = true;
      }
      const formFieldErrors = validateFormFields();

      if (formFieldErrors) {
        hasErrors = true;
      }

      //add error handling here?
      return { hasErrors };
    }, [categoryData, validateFormFields]);

    const handleAddCatalogueCategory = React.useCallback(() => {
      let catalogueCategory: AddCatalogueCategory;
      catalogueCategory = {
        name: categoryData.name,
        is_leaf: categoryData.is_leaf,
      };

      const { hasErrors } = handleErrorStates();
      if (hasErrors) {
        return;
      }

      let updatedProperties: AddCatalogueCategoryProperty[] | undefined;
      // Inside your component or wherever you're processing the data
      if (categoryData.properties) {
        updatedProperties = categoryData.properties.map((property) => {
          const allowedValuesList = property.allowed_values?.values.map(
            (val) => val.value
          );
          if (property.allowed_values?.type === 'list') {
            // Assuming values are strings, convert them to numbers
            const convertedValues = convertListToNumbers(
              allowedValuesList || []
            );

            // Update the property with the converted values
            return {
              ...property,
              cip_placement_id: undefined,
              allowed_values: {
                ...property.allowed_values,
                values:
                  property.type === 'number'
                    ? convertedValues
                    : (allowedValuesList ?? []),
              },
            };
          }
          return {
            ...property,
            cip_placement_id: undefined,
          };
        });
      }
      clearFormFields();

      if (parentId !== null) {
        catalogueCategory = {
          ...catalogueCategory,
          parent_id: parentId,
        };
      }
      if (updatedProperties) {
        catalogueCategory = {
          ...catalogueCategory,
          properties: updatedProperties,
        };
      }

      addCatalogueCategory(trimStringValues(catalogueCategory))
        .then(() => handleClose())
        .catch((error) => {
          const response = error.response?.data as APIError;
          if (response && error.response?.status === 409) {
            setNameError(response.detail);
            return;
          }

          handleIMS_APIError(error);
        });
    }, [
      addCatalogueCategory,
      categoryData,
      clearFormFields,
      handleClose,
      handleErrorStates,
      parentId,
    ]);

    const handleEditCatalogueCategory = React.useCallback(() => {
      let catalogueCategory: EditCatalogueCategory;

      if (selectedCatalogueCategory) {
        const { hasErrors } = handleErrorStates();
        if (hasErrors) {
          return;
        }

        catalogueCategory = {
          id: selectedCatalogueCategory.id,
        };

        const isNameUpdated =
          categoryData.name !== selectedCatalogueCategory?.name;

        if (isNameUpdated) catalogueCategory.name = categoryData.name;

        if (
          catalogueCategory.id && // Check if id is present
          isNameUpdated // Check if any of these properties have been updated
        ) {
          // Only call editCatalogueCategory if id is present and at least one of the properties has been updated
          editCatalogueCategory(trimStringValues(catalogueCategory))
            .then(() => {
              resetSelectedCatalogueCategory();
              handleClose();
            })
            .catch((error: AxiosError) => {
              const response = error.response?.data as APIError;
              if (response && error.response?.status === 409) {
                setNameError(response.detail);
                return;
              }

              handleIMS_APIError(error);
            });
        } else setFormError('Please edit a form entry before clicking save');
      }
    }, [
      categoryData,
      editCatalogueCategory,
      handleClose,
      handleErrorStates,
      resetSelectedCatalogueCategory,
      selectedCatalogueCategory,
    ]);

    return (
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogTitle>
          {type === 'edit'
            ? 'Edit Catalogue Category'
            : 'Add Catalogue Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={1}>
            <Grid item sx={{ mt: 1 }}>
              <TextField
                id="catalogue-category-name-input"
                label="Name"
                required={true}
                sx={{ marginLeft: '4px', marginTop: '8px' }} // Adjusted the width and margin
                value={categoryData.name}
                error={nameError !== undefined}
                helperText={nameError}
                onChange={(event) => {
                  handleFormChange({
                    ...categoryData,
                    name: event.target.value,
                  });
                }}
                fullWidth
              />
            </Grid>
            <Grid item>
              <FormControl disabled={type === 'edit'} sx={{ margin: '8px' }}>
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
                  value={categoryData.is_leaf ? 'true' : 'false'}
                  onChange={(_event, value) => {
                    const newData = {
                      ...categoryData,
                      is_leaf: value === 'true' ? true : false,
                    };
                    if (value === 'false') {
                      newData.properties = undefined;
                      setCatalogueItemPropertiesErrors([]);
                    }
                    handleFormChange(newData);
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
            </Grid>
            {categoryData.is_leaf === true && (
              <>
                <Grid item>
                  <Divider sx={{ minWidth: '700px' }} />
                </Grid>
                <Grid item sx={{ paddingLeft: 1, paddingTop: 3 }}>
                  <Typography variant="h6">Catalogue Item Fields</Typography>
                  <CataloguePropertiesForm
                    formFields={categoryData.properties ?? []}
                    onChangeFormFields={(
                      formFields: AddCatalogueCategoryPropertyWithPlacementIds[]
                    ) =>
                      handleFormChange({
                        ...categoryData,
                        properties: formFields,
                      })
                    }
                    onChangeCatalogueItemPropertiesErrors={
                      setCatalogueItemPropertiesErrors
                    }
                    catalogueItemPropertiesErrors={
                      catalogueItemPropertiesErrors
                    }
                    allowedValuesListErrors={allowedValuesListErrors}
                    onChangeAllowedValuesListErrors={setAllowedValuesListErrors}
                    resetFormError={() => setFormError(undefined)}
                    isDisabled={type === 'edit'}
                  />
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
              sx={{ width: '50%', mx: 1 }}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={
                type === 'edit'
                  ? handleEditCatalogueCategory
                  : handleAddCatalogueCategory
              }
              disabled={
                isEditPending ||
                isAddPending ||
                formError !== undefined ||
                nameError !== undefined ||
                catalogueItemPropertiesErrors.length !== 0 ||
                allowedValuesListErrors.length !== 0
              }
              endIcon={
                isAddPending || isEditPending ? (
                  <CircularProgress size={20} />
                ) : null
              }
            >
              Save
            </Button>
          </Box>
          {formError && (
            <FormHelperText sx={{ marginBottom: '16px' }} error>
              {formError}
            </FormHelperText>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);
CatalogueCategoryDialog.displayName = 'CatalogueCategoryDialog';

export default CatalogueCategoryDialog;
