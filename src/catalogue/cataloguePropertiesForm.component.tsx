import React from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { CatalogueCategoryFormData } from '../app.types';

export interface CataloguePropertiesFormProps {
  formFields: CatalogueCategoryFormData[];
  onChangeFormFields: (formFields: CatalogueCategoryFormData[]) => void;
  nameFields: string[];
  onChangeNameFields: (nameFields: string[]) => void;
  typeFields: string[];
  onChangeTypeFields: (typeFields: string[]) => void;
  errorFields: number[];
  onChangeErrorFields: (errorFields: number[]) => void;
  resetFormError: () => void;
}

function CataloguePropertiesForm(props: CataloguePropertiesFormProps) {
  const {
    formFields,
    onChangeFormFields,
    nameFields,
    onChangeNameFields,
    typeFields,
    onChangeTypeFields,
    errorFields,
    onChangeErrorFields,
    resetFormError,
  } = props;

  const handleAddField = () => {
    onChangeErrorFields([]);
    onChangeFormFields([
      ...formFields,
      { name: '', type: '', unit: '', mandatory: false }, // Initialize mandatory as null for new fields
    ]);
    onChangeNameFields([...nameFields, '']);
    onChangeTypeFields([...typeFields, '']);
    resetFormError();
  };

  const handleDeleteField = (index: number) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    updatedFormFields.splice(index, 1);

    // Update nameFields and typeFields after deleting the field
    const updatedNameFields: string[] = [...nameFields];
    updatedNameFields.splice(index, 1);

    const updatedTypeFields: string[] = [...typeFields];
    updatedTypeFields.splice(index, 1);

    // Set the updated arrays and form fields
    onChangeFormFields(updatedFormFields);
    onChangeNameFields(updatedNameFields);
    onChangeTypeFields(updatedTypeFields);
    resetFormError();
  };

  const handleChange = (
    index: number,
    field: keyof CatalogueCategoryFormData,
    value: string | boolean | null // Allow null as a value
  ) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    const updatedNameFields: string[] = [...nameFields]; // Keep nameFields in sync
    const updatedTypeFields: string[] = [...typeFields]; // Keep typeFields in sync

    if (
      field === 'type' &&
      (value === 'boolean' || value === 'number' || value === 'string')
    ) {
      // For boolean type, remove the 'unit' field
      updatedFormFields[index][field] = value;
      if (value === 'boolean') {
        delete updatedFormFields[index].unit;
      }
      updatedTypeFields[index] = value; // Update typeFields
    } else {
      // Handle other fields if needed
      (updatedFormFields[index][field] as boolean | string | null) = value;
      if (field === 'name') {
        updatedNameFields[index] = value as string; // Update nameFields
      }
    }

    onChangeFormFields(updatedFormFields);
    onChangeNameFields(updatedNameFields);
    onChangeTypeFields(updatedTypeFields);
    resetFormError();
  };

  return (
    <div>
      {formFields.map((field, index) => (
        <Stack direction="row" key={index} spacing={1} padding={1}>
          <TextField
            label="Property Name"
            id={`catalogue-category-form-data-name-${index}`}
            variant="outlined"
            required={true}
            value={field.name}
            onChange={(e) => {
              handleChange(index, 'name', e.target.value);
            }}
            error={errorFields.includes(index) && !nameFields[index].trim()}
            helperText={
              errorFields.includes(index) && !nameFields[index].trim()
                ? 'Property Name is required'
                : ''
            }
            sx={{ minWidth: '150px' }}
          />
          <FormControl sx={{ width: '150px', minWidth: '150px' }}>
            <InputLabel
              error={errorFields.includes(index) && !typeFields[index].trim()}
              required={true}
              id={`catalogue-properties-form-select-type-label-${index}`}
            >
              Select Type
            </InputLabel>
            <Select
              value={field.type === 'string' ? 'text' : field.type}
              onChange={(e) => {
                handleChange(
                  index,
                  'type',
                  e.target.value === 'text' ? 'string' : e.target.value
                );
              }}
              error={errorFields.includes(index) && !typeFields[index].trim()}
              label="Select Type"
              labelId={`catalogue-properties-form-select-type-label-${index}`}
              required={true}
            >
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
            {errorFields.includes(index) && !typeFields[index].trim() && (
              <FormHelperText error>Select Type is required</FormHelperText>
            )}
          </FormControl>
          <FormControl
            sx={{ minWidth: '150px' }}
            disabled={field.type === 'boolean'}
          >
            <TextField
              label="Select Unit"
              variant="outlined"
              value={field.unit}
              onChange={(e) => handleChange(index, 'unit', e.target.value)}
              disabled={field.type === 'boolean'}
            />
          </FormControl>
          <FormControl sx={{ width: '150px', minWidth: '150px' }}>
            <InputLabel
              id={`catalogue-properties-form-select-mandatory-label-${index}`}
            >
              Select is mandatory?
            </InputLabel>
            <Select
              value={
                field.mandatory !== null ? (field.mandatory ? 'yes' : 'no') : ''
              }
              onChange={(e) =>
                handleChange(index, 'mandatory', e.target.value === 'yes')
              }
              label="Select is mandatory?"
              labelId={`catalogue-properties-form-select-mandatory-label-${index}`}
            >
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={() => handleDeleteField(index)}>
            <DeleteIcon />
          </Button>
        </Stack>
      ))}
      <Button sx={{ margin: '8px' }} onClick={handleAddField}>
        <AddIcon />
      </Button>
    </div>
  );
}

export default CataloguePropertiesForm;
