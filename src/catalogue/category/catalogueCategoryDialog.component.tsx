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
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import {
  useAddCatalogueCategory,
  useCatalogueCategoryById,
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

export interface CatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  type: 'add' | 'edit';
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
        setCategoryData(selectedCatalogueCategory as AddCatalogueCategory);
    }, [selectedCatalogueCategory]);

    const [nameError, setNameError] = React.useState<string | undefined>(
      undefined
    );

    const [formError, setFormError] = React.useState<string | undefined>(
      undefined
    );

    const [catchAllError, setCatchAllError] = React.useState(false);

    const { mutateAsync: addCatalogueCategory } = useAddCatalogueCategory();
    const { mutateAsync: editCatalogueCategory } = useEditCatalogueCategory();

    const [nameFields, setNameFields] = React.useState<string[]>([]);
    const [typeFields, setTypeFields] = React.useState<string[]>([]);

    React.useEffect(() => {
      // When the catalogue category name changes, update the nameFields and typeFields.
      if (categoryData.catalogue_item_properties) {
        const newNames = categoryData.catalogue_item_properties.map(
          (field) => field.name
        );
        const newTypes = categoryData.catalogue_item_properties.map(
          (field) => field.type
        );
        setNameFields(newNames);
        setTypeFields(newTypes);
      }
    }, [categoryData.catalogue_item_properties, categoryData.name]);

    const [errorFields, setErrorFields] = React.useState<number[]>([]);

    const { data: selectedCatalogueCategoryData } = useCatalogueCategoryById(
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
      setNameFields([]);
      setTypeFields([]);
      setFormError(undefined);
      resetSelectedCatalogueCategory();
    }, [onClose, resetSelectedCatalogueCategory]);

    // Reset errors when required
    const handleFormChange = (newCategoryData: AddCatalogueCategory) => {
      setCategoryData(newCategoryData);

      if (newCategoryData.name !== categoryData.name) setNameError(undefined);
      setFormError(undefined);
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
          if (!nameFields[i].trim() || !typeFields[i].trim())
            errorIndexes.push(i);
        }
      }

      setErrorFields(errorIndexes);
      return errorIndexes;
    }, [categoryData.catalogue_item_properties, nameFields, typeFields]);

    const clearFormFields = React.useCallback(() => {
      setErrorFields([]);
      setNameFields([...nameFields, '']);
      setTypeFields([...typeFields, '']);
    }, [nameFields, typeFields]);

    const handleAddCatalogueCategory = React.useCallback(() => {
      // Check if catalogue category name is undefined or an empty string
      if (!categoryData.name || categoryData.name.trim() === '') {
        setNameError('Please enter a name.');
        return; // Stop further execution if the name is invalid
      }
      let catalogueCategory: AddCatalogueCategory;
      catalogueCategory = {
        name: categoryData.name,
        is_leaf: categoryData.is_leaf,
      };

      const errorIndexes = validateFormFields();
      if (errorIndexes.length === 0) {
        clearFormFields();

        if (parentId !== null) {
          catalogueCategory = {
            ...catalogueCategory,
            parent_id: parentId,
          };
        }
        if (!!categoryData.catalogue_item_properties) {
          catalogueCategory = {
            ...catalogueCategory,
            catalogue_item_properties: categoryData.catalogue_item_properties,
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
      }
    }, [
      addCatalogueCategory,
      categoryData.catalogue_item_properties,
      categoryData.is_leaf,
      categoryData.name,
      clearFormFields,
      handleClose,
      parentId,
      validateFormFields,
    ]);

    const handleEditCatalogueCategory = React.useCallback(() => {
      let catalogueCategory: EditCatalogueCategory;

      // Check if catalogue category name is undefined or an empty string
      if (!categoryData.name || categoryData.name.trim() === '') {
        setNameError('Please enter a name.');
        return; // Stop further execution if the name is invalid
      }

      if (selectedCatalogueCategory && selectedCatalogueCategoryData) {
        catalogueCategory = {
          id: selectedCatalogueCategory.id,
        };

        const isNameUpdated =
          categoryData.name !== selectedCatalogueCategoryData?.name;

        const isIsLeafUpdated =
          categoryData.is_leaf !== selectedCatalogueCategoryData?.is_leaf;
        const isCatalogueItemPropertiesUpdated =
          JSON.stringify(categoryData.catalogue_item_properties) !==
          JSON.stringify(
            selectedCatalogueCategoryData?.catalogue_item_properties ?? null
          );

        if (isNameUpdated) {
          catalogueCategory = {
            ...catalogueCategory,
            name: categoryData.name,
          };
        }

        if (isIsLeafUpdated) {
          catalogueCategory = {
            ...catalogueCategory,
            is_leaf: categoryData.is_leaf,
          };
        }

        if (
          !!categoryData.catalogue_item_properties &&
          isCatalogueItemPropertiesUpdated
        ) {
          catalogueCategory = {
            ...catalogueCategory,
            catalogue_item_properties: categoryData.catalogue_item_properties,
          };
        }

        const errorIndexes = validateFormFields();

        if (errorIndexes.length === 0) {
          // Clear the error state and add a new field
          clearFormFields();

          if (
            catalogueCategory.id && // Check if id is present
            (isNameUpdated ||
              (!!categoryData.catalogue_item_properties &&
                isCatalogueItemPropertiesUpdated) ||
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
      }
    }, [
      categoryData.catalogue_item_properties,
      categoryData.is_leaf,
      categoryData.name,
      clearFormFields,
      editCatalogueCategory,
      handleClose,
      resetSelectedCatalogueCategory,
      selectedCatalogueCategory,
      selectedCatalogueCategoryData,
      validateFormFields,
    ]);

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {type === 'edit'
            ? 'Edit Catalogue Category'
            : 'Add Catalogue Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            required={true}
            sx={{ marginLeft: '4px', marginTop: '8px' }} // Adjusted the width and margin
            value={categoryData.name}
            error={nameError !== undefined}
            helperText={nameError}
            onChange={(event) => {
              handleFormChange({ ...categoryData, name: event.target.value });
            }}
            fullWidth
          />
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
                  setNameFields([]);
                  setTypeFields([]);
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
          {categoryData.is_leaf === true && (
            <Box sx={{ alignItems: 'center', width: '100%' }}>
              <Box>
                <Divider sx={{ minWidth: '700px' }} />
              </Box>
              <Box sx={{ paddingLeft: '8px', paddingTop: '24px' }}>
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
                  nameFields={nameFields}
                  onChangeNameFields={setNameFields}
                  typeFields={typeFields}
                  onChangeTypeFields={setTypeFields}
                  errorFields={errorFields}
                  onChangeErrorFields={setErrorFields}
                  resetFormError={() => setFormError(undefined)}
                />
              </Box>
            </Box>
          )}
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
                type === 'add'
                  ? handleAddCatalogueCategory
                  : handleEditCatalogueCategory
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
