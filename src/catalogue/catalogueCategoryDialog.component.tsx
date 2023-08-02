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
} from '@mui/material';
import {
  AddCatalogueCategory,
  CatalogueCategory,
  EditCatalogueCategory,
  CatalogueCategoryFormData,
} from '../app.types';
import {
  useAddCatalogueCategory,
  useEditCatalogueCategory,
} from '../api/catalogueCategory';
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
  refetchData: () => void;
  type: 'add' | 'edit';
  selectedCatalogueCategory?: CatalogueCategory;
}

function CatalogueCategoryDialog(props: CatalogueCategoryDialogProps) {
  const {
    open,
    onClose,
    parentId,
    isLeaf,
    onChangeLeaf,
    refetchData,
    type,
    onChangeCatalogueCategoryName,
    catalogueCategoryName,
    selectedCatalogueCategory,
    onChangeFormFields,
    formFields,
  } = props;

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const { mutateAsync: addCatalogueCategory } = useAddCatalogueCategory();
  const { mutateAsync: editCatalogueCategory } = useEditCatalogueCategory();

  const [nameFields, setNameFields] = React.useState<string[]>(
    formFields ? formFields.map((field) => field.name) : []
  );

  const [typeFields, setTypeFields] = React.useState<string[]>(
    formFields ? formFields.map((field) => field.type) : []
  );

  const [errorFields, setErrorFields] = React.useState<number[]>([]);

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
    refetchData();
  }, [
    onChangeCatalogueCategoryName,
    onChangeFormFields,
    onChangeLeaf,
    onClose,
    refetchData,
  ]);

  const handleAddCatalogueCategory = React.useCallback(() => {
    let catalogueCategory: AddCatalogueCategory;
    catalogueCategory = {
      name: catalogueCategoryName === '' ? undefined : catalogueCategoryName,
      is_leaf: isLeaf,
    };
    const errorIndexes = [];

    // Check if each form field has a name and type
    if (formFields) {
      for (let i = 0; i < formFields.length; i++) {
        if (!nameFields[i].trim() || !typeFields[i].trim()) {
          errorIndexes.push(i);
        }
      }
    }

    // Set the error state after clicking the add button
    setErrorFields(errorIndexes);

    if (errorIndexes.length === 0) {
      // Clear the error state and add a new field
      setErrorFields([]);
      setNameFields([...nameFields, '']);
      setTypeFields([...typeFields, '']);

      if (parentId !== null) {
        catalogueCategory = {
          ...catalogueCategory,
          parent_id: parentId,
        };
      }
      if (isLeaf) {
        catalogueCategory = {
          ...catalogueCategory,
          catalogue_item_properties: formFields ?? [],
        };
      }

      addCatalogueCategory(catalogueCategory)
        .then((response) => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 422 && !catalogueCategoryName) {
            setNameError(true);
            setNameErrorMessage('Please enter a name.');
          } else if (error.response?.status === 409) {
            setNameError(true);
            setNameErrorMessage(
              'A catalogue category with the same name already exists within the parent catalogue category.'
            );
          }
        });
    }
  }, [
    addCatalogueCategory,
    catalogueCategoryName,
    formFields,
    handleClose,
    isLeaf,
    nameFields,
    parentId,
    typeFields,
  ]);

  const handleEditCatalogueCategory = React.useCallback(() => {
    let catalogueCategory: EditCatalogueCategory;
    if (selectedCatalogueCategory) {
      catalogueCategory = {
        id: selectedCatalogueCategory.id,
        name: catalogueCategoryName,
      };

      editCatalogueCategory(catalogueCategory)
        .then((response) => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 422) {
            setNameError(true);
            setNameErrorMessage('Please enter a name.');
          } else if (error.response?.status === 409) {
            setNameError(true);
            setNameErrorMessage(
              'A catalogue category with the same name already exists within the parent catalogue category.'
            );
          }
        });
    }
  }, [
    catalogueCategoryName,
    editCatalogueCategory,
    handleClose,
    selectedCatalogueCategory,
  ]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
          }}
          fullWidth
        />
        <FormControl
          sx={{ margin: '8px' }}
          disabled={type === 'edit' ? true : false}
        >
          <FormLabel id="controlled-radio-buttons-group">
            Catalogue Directory Content
          </FormLabel>
          <RadioGroup
            aria-labelledby="controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={isLeaf}
            onChange={(event, value) => {
              onChangeLeaf(value === 'true' ? true : false);
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
      </DialogActions>
    </Dialog>
  );
}

export default CatalogueCategoryDialog;
