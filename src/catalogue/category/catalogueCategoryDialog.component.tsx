import {
  Box,
  Button,
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
import {
  useAddCatalogueCategory,
  useCatalogueCategory,
  useEditCatalogueCategory,
} from '../../api/catalogueCategory';
import {
  AddCatalogueCategory,
  CatalogueCategory,
  CatalogueCategoryFormData,
  EditCatalogueCategory,
  ErrorParsing,
} from '../../app.types';
import CataloguePropertiesForm from './cataloguePropertiesForm.component';

// Function to convert a list of strings to a list of numbers
const convertListToNumbers = (values: string[]): number[] => {
  return values.map((value) => parseFloat(value));
};
export interface CatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  type: 'add' | 'edit' | 'save as';
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
      React.useState<AddCatalogueCategory>({
        name: '',
        parent_id: null,
        is_leaf: false,
        catalogue_item_properties: undefined,
      });

    React.useEffect(() => {
      if (selectedCatalogueCategory)
        setCategoryData(
          // This is not ideal but fixes the properties being reset when closing the dialog
          // The array itself is stored as a reference in typescript meaning that modifying
          // categoryData.catalogue_item_properties without this will also modify
          // selectedCatalogueCategory.catalogue_item_properties preventing any modified fields
          // from being reset
          // This ensures the array created is brand new with a different reference to fix it
          // See https://stackoverflow.com/questions/9885821/copying-of-an-array-of-objects-to-another-array-without-object-reference-in-java
          JSON.parse(
            JSON.stringify(selectedCatalogueCategory)
          ) as AddCatalogueCategory
        );
    }, [selectedCatalogueCategory]);

    const [nameError, setNameError] = React.useState<string | undefined>(
      undefined
    );

    const [formError, setFormError] = React.useState<string | undefined>(
      undefined
    );

    const [duplicatePropertyError, setDuplicatePropertyError] = React.useState<
      string[]
    >([]);

    // State to manage list item errors
    const [listItemErrors, setListItemErrors] = React.useState<
      {
        index: number | null;
        valueIndex: { index: number; errorMessage: string }[] | null;
      }[]
    >([]);

    const [catchAllError, setCatchAllError] = React.useState(false);

    const { mutateAsync: addCatalogueCategory } = useAddCatalogueCategory();
    const { mutateAsync: editCatalogueCategory } = useEditCatalogueCategory();

    const [errorFields, setErrorFields] = React.useState<number[]>([]);

    const { data: selectedCatalogueCategoryData } = useCatalogueCategory(
      selectedCatalogueCategory?.id
    );

    const handleClose = React.useCallback(() => {
      onClose();
      setNameError(undefined);
      setCategoryData({
        name: '',
        parent_id: null,
        is_leaf: false,
        catalogue_item_properties: undefined,
      });
      setErrorFields([]);
      setDuplicatePropertyError([]);
      setListItemErrors([]);
      setFormError(undefined);
      resetSelectedCatalogueCategory();
    }, [onClose, resetSelectedCatalogueCategory]);

    // Reset errors when required
    const handleFormChange = (newCategoryData: AddCatalogueCategory) => {
      setCategoryData(newCategoryData);

      if (newCategoryData.name !== categoryData.name) setNameError(undefined);
      setFormError(undefined);
    };

    const checkDuplicateListItems = (
      catalogueItemProperties: CatalogueCategoryFormData[]
    ): boolean => {
      let hasErrors = false;

      catalogueItemProperties.forEach((property, index) => {
        if (property.allowed_values?.type === 'list') {
          const listOfValues = property.allowed_values.values;
          const trimmedLowerCaseValues = listOfValues.map((value) =>
            String(value).trim().toLowerCase()
          );

          const duplicateIndexes: number[] = [];

          trimmedLowerCaseValues.forEach((value, i) => {
            for (let j = i + 1; j < trimmedLowerCaseValues.length; j++) {
              if (value === trimmedLowerCaseValues[j]) {
                duplicateIndexes.push(i, j);
              }
            }
          });

          if (duplicateIndexes.length > 0) {
            // Update listItemErrors state with the error indexes
            setListItemErrors((prev) => [
              ...prev.slice(0, index),
              {
                index,
                valueIndex: [
                  ...(prev[index]?.valueIndex || []),
                  ...duplicateIndexes.map((i) => ({
                    index: i,
                    errorMessage: 'Duplicate value',
                  })),
                ],
              },
              ...prev.slice(index + 1),
            ]);

            hasErrors = true;
          }
        }
      });

      return hasErrors;
    };

    const checkListValuesType = (
      catalogueItemProperties: CatalogueCategoryFormData[]
    ): boolean => {
      let hasErrors = false;

      // Use a traditional for loop to iterate over the array
      for (let index = 0; index < catalogueItemProperties.length; index++) {
        const property = catalogueItemProperties[index];

        if (property.allowed_values?.type === 'list') {
          const invalidNumberIndexes: number[] = [];

          // Check each value in the list
          property.allowed_values.values.forEach((value, valueIndex) => {
            if (property.type === 'number' && (isNaN(value) || !value)) {
              invalidNumberIndexes.push(valueIndex);
            }
          });

          if (invalidNumberIndexes.length > 0) {
            // Update listItemErrors state with the error indexes
            setListItemErrors((prev) => [
              ...prev.slice(0, index), // Keep the previous items before the current index
              {
                index,
                valueIndex: [
                  ...(prev[index]?.valueIndex || []),
                  ...invalidNumberIndexes.map((i) => ({
                    index: i,
                    errorMessage: 'Please enter a valid number',
                  })),
                ],
              },
              ...prev.slice(index + 1), // Keep the items after the current index
            ]);

            hasErrors = true;
          }
        }
      }

      return hasErrors;
    };

    const validateFormFields = React.useCallback(() => {
      const errorIndexes = [];

      // Check if each form field has a name and type
      if (categoryData.catalogue_item_properties) {
        for (
          let i = 0;
          i < categoryData.catalogue_item_properties.length;
          i++
        ) {
          if (
            !categoryData.catalogue_item_properties[i].name.trim() ||
            !categoryData.catalogue_item_properties[i].type.trim()
          )
            errorIndexes.push(i);
        }
      }
      //add error handling here?

      setErrorFields(errorIndexes);
      return errorIndexes;
    }, [categoryData.catalogue_item_properties]);

    const clearFormFields = React.useCallback(() => {
      setErrorFields([]);
    }, []);

    const handleErrorStates = React.useCallback(() => {
      let hasErrors = false;
      if (!categoryData.name || categoryData.name.trim() === '') {
        setNameError('Please enter a name.');
        hasErrors = true;
      }
      const errorIndexes = validateFormFields();
      if (errorIndexes.length !== 0) {
        hasErrors = true;
      }

      if (categoryData.catalogue_item_properties) {
        const listOfPropertyNames: string[] =
          categoryData.catalogue_item_properties.map((property) =>
            property.name.toLowerCase().trim()
          );
        const uniqueNames = new Set();
        const duplicateNames: string[] = [];

        for (const name of listOfPropertyNames) {
          if (uniqueNames.has(name)) {
            duplicateNames.push(name);
          } else {
            uniqueNames.add(name);
          }
        }
        if (duplicateNames.length > 0) {
          setDuplicatePropertyError(duplicateNames);
          hasErrors = true;
        }

        const hasListValuesTypeErrors = checkListValuesType(
          categoryData.catalogue_item_properties
        );

        const hasDuplicateListValues = checkDuplicateListItems(
          categoryData.catalogue_item_properties
        );

        if (hasListValuesTypeErrors || hasDuplicateListValues) {
          hasErrors = true;
        }
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

      let updatedProperties: CatalogueCategoryFormData[] | undefined;
      // Inside your component or wherever you're processing the data
      if (categoryData.catalogue_item_properties) {
        updatedProperties = categoryData.catalogue_item_properties.map(
          (property) => {
            if (
              property.type === 'number' &&
              property.allowed_values?.type === 'list'
            ) {
              // Assuming values are strings, convert them to numbers
              const convertedValues = convertListToNumbers(
                property.allowed_values.values || []
              );

              // Update the property with the converted values
              return {
                ...property,
                allowed_values: {
                  ...property.allowed_values,
                  values: convertedValues,
                },
              };
            }
            return property;
          }
        );
      }
      clearFormFields();

      if (parentId !== null) {
        catalogueCategory = {
          ...catalogueCategory,
          parent_id: parentId,
        };
      }
      if (!!updatedProperties) {
        catalogueCategory = {
          ...catalogueCategory,
          catalogue_item_properties: updatedProperties,
        };
      }

      addCatalogueCategory(catalogueCategory)
        .then((response) => handleClose())
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;
          console.log(error);
          if (response && error.response?.status === 409) {
            setNameError(response.detail);
            return;
          }
          setCatchAllError(true);
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

      if (selectedCatalogueCategory && selectedCatalogueCategoryData) {
        const { hasErrors } = handleErrorStates();
        if (hasErrors) {
          return;
        }

        let updatedProperties: CatalogueCategoryFormData[] | undefined;
        // Inside your component or wherever you're processing the data
        if (categoryData.catalogue_item_properties) {
          updatedProperties = categoryData.catalogue_item_properties.map(
            (property) => {
              if (
                property.type === 'number' &&
                property.allowed_values?.type === 'list'
              ) {
                // Assuming values are strings, convert them to numbers
                const convertedValues = convertListToNumbers(
                  property.allowed_values.values || []
                );

                // Update the property with the converted values
                return {
                  ...property,
                  allowed_values: {
                    ...property.allowed_values,
                    values: convertedValues,
                  },
                };
              }
              return property;
            }
          );
        }
        // Clear the error state and add a new field
        clearFormFields();

        catalogueCategory = {
          id: selectedCatalogueCategory.id,
        };

        const isNameUpdated =
          categoryData.name !== selectedCatalogueCategoryData?.name;

        const isIsLeafUpdated =
          categoryData.is_leaf !== selectedCatalogueCategoryData?.is_leaf;
        const isCatalogueItemPropertiesUpdated =
          JSON.stringify(updatedProperties) !==
          JSON.stringify(
            selectedCatalogueCategoryData?.catalogue_item_properties ?? null
          );

        isNameUpdated && (catalogueCategory.name = categoryData.name);

        isIsLeafUpdated && (catalogueCategory.is_leaf = categoryData.is_leaf);

        isCatalogueItemPropertiesUpdated &&
          (catalogueCategory.catalogue_item_properties = updatedProperties);

        if (
          catalogueCategory.id && // Check if id is present
          (isNameUpdated ||
            (!!updatedProperties && isCatalogueItemPropertiesUpdated) ||
            isIsLeafUpdated) // Check if any of these properties have been updated
        ) {
          // Only call editCatalogueCategory if id is present and at least one of the properties has been updated
          editCatalogueCategory(catalogueCategory)
            .then((response) => {
              resetSelectedCatalogueCategory();
              handleClose();
            })
            .catch((error: AxiosError) => {
              console.log(error.response);
              const response = error.response?.data as ErrorParsing;
              if (response && error.response?.status === 409) {
                if (response.detail.includes('child elements'))
                  setFormError(response.detail);
                else setNameError(response.detail);

                return;
              }
              setCatchAllError(true);
            });
        } else setFormError('Please edit a form entry before clicking save');
      }
    }, [
      categoryData,
      clearFormFields,
      editCatalogueCategory,
      handleClose,
      handleErrorStates,
      resetSelectedCatalogueCategory,
      selectedCatalogueCategory,
      selectedCatalogueCategoryData,
    ]);

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {type === 'edit'
            ? 'Edit Catalogue Category'
            : 'Add Catalogue Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={1}>
            <Grid item sx={{ mt: 1 }}>
              <TextField
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
              <FormControl sx={{ margin: '8px' }}>
                <FormLabel id="controlled-radio-buttons-group">
                  Catalogue Directory Content
                </FormLabel>
                <RadioGroup
                  aria-labelledby="controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={categoryData.is_leaf ? 'true' : 'false'}
                  onChange={(event, value) => {
                    const newData = {
                      ...categoryData,
                      is_leaf: value === 'true' ? true : false,
                    };
                    if (value === 'false') {
                      newData.catalogue_item_properties = undefined;
                      setErrorFields([]);
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
                    formFields={categoryData.catalogue_item_properties ?? []}
                    onChangeFormFields={(
                      formFields: CatalogueCategoryFormData[]
                    ) =>
                      handleFormChange({
                        ...categoryData,
                        catalogue_item_properties: formFields,
                      })
                    }
                    errorFields={errorFields}
                    propertyNameError={duplicatePropertyError}
                    onChangePropertyNameError={setDuplicatePropertyError}
                    onChangeErrorFields={setErrorFields}
                    listItemErrors={listItemErrors}
                    onChangeListItemErrors={setListItemErrors}
                    resetFormError={() => setFormError(undefined)}
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
                formError !== undefined ||
                catchAllError ||
                nameError !== undefined ||
                errorFields.length !== 0 ||
                duplicatePropertyError.length !== 0
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
          {catchAllError && (
            <FormHelperText sx={{ marginBottom: '16px' }} error>
              {'Please refresh and try again'}
            </FormHelperText>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);

export default CatalogueCategoryDialog;
