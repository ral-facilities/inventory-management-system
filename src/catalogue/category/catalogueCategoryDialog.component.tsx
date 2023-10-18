import React from 'react';
import { AxiosError } from 'axios';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import {
  AddCatalogueCategory,
  CatalogueCategory,
  EditCatalogueCategory,
  CatalogueCategoryFormData,
  ErrorParsing,
} from '../../app.types';
import {
  useAddCatalogueCategory,
  useCatalogueCategoryById,
  useEditCatalogueCategory,
} from '../../api/catalogueCategory';
import CataloguePropertiesForm from './cataloguePropertiesForm.component';

export interface CatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  onChangeCatalogueCategoryName: (name: string | undefined) => void;
  catalogueCategoryName: string | undefined;
  onChangeLeaf: (isLeaf: boolean) => void;
  isLeaf: boolean;
  formFields: CatalogueCategoryFormData[] | null;
  onChangeFormFields: (formFields: CatalogueCategoryFormData[] | null) => void;
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
      isLeaf,
      onChangeLeaf,
      type,
      onChangeCatalogueCategoryName,
      catalogueCategoryName,
      selectedCatalogueCategory,
      onChangeFormFields,
      formFields,
      resetSelectedCatalogueCategory,
    } = props;

    const [nameError, setNameError] = React.useState(false);
    const [nameErrorMessage, setNameErrorMessage] = React.useState<
      string | undefined
    >(undefined);

    const [formError, setFormError] = React.useState(false);
    const [formErrorMessage, setFormErrorMessage] = React.useState<
      string | undefined
    >(undefined);

    const [catchAllError, setCatchAllError] = React.useState(false);

    const { mutateAsync: addCatalogueCategory } = useAddCatalogueCategory();
    const { mutateAsync: editCatalogueCategory } = useEditCatalogueCategory();

    const [nameFields, setNameFields] = React.useState<string[]>([]);

    const [typeFields, setTypeFields] = React.useState<string[]>([]);

    React.useEffect(() => {
      // When the catalogueCategoryName changes, update the nameFields and typeFields.
      if (formFields) {
        const newNames = formFields.map((field) => field.name);
        const newTypes = formFields.map((field) => field.type);
        setNameFields(newNames);
        setTypeFields(newTypes);
      }
    }, [catalogueCategoryName, formFields]);

    const [errorFields, setErrorFields] = React.useState<number[]>([]);

    const { data: selectedCatalogueCategoryData } = useCatalogueCategoryById(
      selectedCatalogueCategory?.id
    );

    React.useEffect(() => {
      // When the catalogueCategoryName changes, update the nameFields and typeFields.
      if (formFields) {
        const newNames = formFields.map((field) => field.name);
        const newTypes = formFields.map((field) => field.type);
        setNameFields(newNames);
        setTypeFields(newTypes);
      }
    }, [catalogueCategoryName, formFields]);
    const handleClose = React.useCallback(() => {
      onClose();
      setNameError(false);
      setNameErrorMessage(undefined);
      onChangeCatalogueCategoryName(undefined);
      onChangeFormFields(null);
      onChangeLeaf(false);
      setErrorFields([]);
      setNameFields([]);
      setTypeFields([]);
      setFormError(false);
      resetSelectedCatalogueCategory();
    }, [
      onChangeCatalogueCategoryName,
      onChangeFormFields,
      onChangeLeaf,
      onClose,
      resetSelectedCatalogueCategory,
    ]);

    const validateFormFields = React.useCallback(() => {
      const errorIndexes = [];

      // Check if each form field has a name and type
      if (formFields) {
        for (let i = 0; i < formFields.length; i++) {
          if (!nameFields[i].trim() || !typeFields[i].trim()) {
            errorIndexes.push(i);
          }
        }
      }

      setErrorFields(errorIndexes);
      return errorIndexes;
    }, [formFields, nameFields, typeFields]);

    const clearFormFields = React.useCallback(() => {
      setErrorFields([]);
      setNameFields([...nameFields, '']);
      setTypeFields([...typeFields, '']);
    }, [nameFields, typeFields]);

    const handleAddCatalogueCategory = React.useCallback(() => {
      // Check if catalogueCategoryName is undefined or an empty string
      if (!catalogueCategoryName || catalogueCategoryName.trim() === '') {
        setNameError(true);
        setNameErrorMessage('Please enter a name.');
        return; // Stop further execution if the name is invalid
      }
      let catalogueCategory: AddCatalogueCategory;
      catalogueCategory = {
        name: catalogueCategoryName,
        is_leaf: isLeaf,
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
        if (!!formFields) {
          catalogueCategory = {
            ...catalogueCategory,
            catalogue_item_properties: formFields,
          };
        }

        addCatalogueCategory(catalogueCategory)
          .then((response) => handleClose())
          .catch((error: AxiosError) => {
            const response = error.response?.data as ErrorParsing;
            console.log(error);
            if (response && error.response?.status === 409) {
              setNameError(true);
              setNameErrorMessage(response.detail);
              return;
            }
            setCatchAllError(true);
          });
      }
    }, [
      addCatalogueCategory,
      catalogueCategoryName,
      clearFormFields,
      formFields,
      handleClose,
      isLeaf,
      parentId,
      validateFormFields,
    ]);

    const handleEditCatalogueCategory = React.useCallback(() => {
      let catalogueCategory: EditCatalogueCategory;

      // Check if catalogueCategoryName is undefined or an empty string
      if (!catalogueCategoryName || catalogueCategoryName.trim() === '') {
        setNameError(true);
        setNameErrorMessage('Please enter a name.');
        return; // Stop further execution if the name is invalid
      }

      if (selectedCatalogueCategory && selectedCatalogueCategoryData) {
        catalogueCategory = {
          id: selectedCatalogueCategory.id,
        };

        const isNameUpdated =
          catalogueCategoryName !== selectedCatalogueCategoryData?.name;

        const isIsLeafUpdated =
          isLeaf !== selectedCatalogueCategoryData?.is_leaf;
        const isCatalogueItemPropertiesUpdated =
          JSON.stringify(formFields) !==
          JSON.stringify(
            selectedCatalogueCategoryData?.catalogue_item_properties ?? null
          );

        if (isNameUpdated) {
          catalogueCategory = {
            ...catalogueCategory,
            name: catalogueCategoryName,
          };
        }

        if (isIsLeafUpdated) {
          catalogueCategory = {
            ...catalogueCategory,
            is_leaf: isLeaf,
          };
        }

        if (!!formFields && isCatalogueItemPropertiesUpdated) {
          catalogueCategory = {
            ...catalogueCategory,
            catalogue_item_properties: formFields,
          };
        }

        const errorIndexes = validateFormFields();

        if (errorIndexes.length === 0) {
          // Clear the error state and add a new field
          clearFormFields();

          if (
            catalogueCategory.id && // Check if id is present
            (isNameUpdated ||
              (!!formFields && isCatalogueItemPropertiesUpdated) ||
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
                  if (response.detail.includes('children elements')) {
                    setFormError(true);
                    setFormErrorMessage(response.detail);
                  } else {
                    setNameError(true);
                    setNameErrorMessage(response.detail);
                  }

                  return;
                }
                setCatchAllError(true);
              });
          } else {
            setFormError(true);
            setFormErrorMessage(
              'Please edit a form entry before clicking save'
            );
          }
        }
      }
    }, [
      catalogueCategoryName,
      clearFormFields,
      editCatalogueCategory,
      formFields,
      handleClose,
      isLeaf,
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
            sx={{ marginLeft: '4px' }} // Adjusted the width and margin
            value={catalogueCategoryName}
            error={nameError}
            helperText={nameError && nameErrorMessage}
            onChange={(event) => {
              onChangeCatalogueCategoryName(
                event.target.value ? event.target.value : undefined
              );
              setNameError(false);
              setNameErrorMessage(undefined);
              setFormError(false);
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
              value={isLeaf}
              onChange={(event, value) => {
                onChangeLeaf(value === 'true' ? true : false);
                setFormError(false);
                if (value === 'false') {
                  onChangeFormFields(null);
                  setErrorFields([]);
                  setNameFields([]);
                  setTypeFields([]);
                }
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
          {isLeaf === true && (
            <Box sx={{ alignItems: 'center', width: '100%' }}>
              <Box>
                <Divider sx={{ minWidth: '700px' }} />
              </Box>
              <Box sx={{ paddingLeft: '8px', paddingTop: '24px' }}>
                <Typography variant="h6">Catalogue Item Fields</Typography>
                <CataloguePropertiesForm
                  formFields={formFields ?? []}
                  onChangeFormFields={onChangeFormFields}
                  nameFields={nameFields}
                  onChangeNameFields={setNameFields}
                  typeFields={typeFields}
                  onChangeTypeFields={setTypeFields}
                  errorFields={errorFields}
                  onChangeErrorFields={setErrorFields}
                  resetFormError={() => setFormError(false)}
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
              {formErrorMessage}
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
