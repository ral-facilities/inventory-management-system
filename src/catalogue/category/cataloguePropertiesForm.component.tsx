import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  FormHelperText,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AllowedValuesList, CatalogueCategoryFormData } from '../../app.types';

export interface CataloguePropertiesFormProps {
  formFields: CatalogueCategoryFormData[];
  onChangeFormFields: (formFields: CatalogueCategoryFormData[]) => void;
  nameFields: string[];
  onChangeNameFields: (nameFields: string[]) => void;
  typeFields: string[];
  onChangeTypeFields: (typeFields: string[]) => void;
  errorFields: number[];
  onChangeErrorFields: (errorFields: number[]) => void;
  propertyNameError: string[];
  onChangePropertyNameError: (propertyNameError: string[]) => void;
  listItemErrors: {
    index: number | null;
    valueIndex: { index: number; errorMessage: string }[] | null;
  }[];
  onChangeListItemErrors: (
    listItemErrors: {
      index: number | null;
      valueIndex: { index: number; errorMessage: string }[] | null;
    }[]
  ) => void;
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
    propertyNameError,
    onChangePropertyNameError,
    onChangeListItemErrors,
    listItemErrors,
    resetFormError,
  } = props;

  const handleAddField = () => {
    onChangeErrorFields([]);
    onChangeFormFields([
      ...formFields,
      {
        name: '',
        type: '',
        unit: '',
        mandatory: false,
        allowed_values: undefined,
      },
    ]);
    onChangeNameFields([...nameFields, '']);
    onChangeTypeFields([...typeFields, '']);
    resetFormError();
  };

  const [allowedValues, setAllowedValues] = React.useState<
    (string | undefined)[]
  >(formFields.map(() => undefined));
  const handleDeleteField = (index: number) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    updatedFormFields.splice(index, 1);

    const updatedNameFields: string[] = [...nameFields];
    updatedNameFields.splice(index, 1);

    const updatedTypeFields: string[] = [...typeFields];
    updatedTypeFields.splice(index, 1);

    const updatedListItemErrors = listItemErrors.filter(
      (item) => item.index !== index
    );

    onChangeListItemErrors(updatedListItemErrors);

    onChangeFormFields(updatedFormFields);
    onChangeNameFields(updatedNameFields);
    onChangeTypeFields(updatedTypeFields);
    onChangePropertyNameError([]);
    resetFormError();
  };

  const handleChange = (
    index: number,
    field: keyof CatalogueCategoryFormData,
    value: string | boolean | null
  ) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    const updatedNameFields: string[] = [...nameFields];
    const updatedTypeFields: string[] = [...typeFields];

    if (
      field === 'type' &&
      (value === 'boolean' || value === 'number' || value === 'string')
    ) {
      updatedFormFields[index][field] = value;
      if (value === 'boolean') {
        delete updatedFormFields[index].unit;
        delete updatedFormFields[index].allowed_values;

        setAllowedValues((prev) => {
          const updatedAllowedValues = [...prev];
          updatedAllowedValues[index] = undefined;
          return updatedAllowedValues;
        });
      }
      updatedTypeFields[index] = value;
    } else {
      (updatedFormFields[index][field] as boolean | string | null) = value;
      if (field === 'name') {
        updatedNameFields[index] = value as string;
      }
    }
    const updatedListItemErrors = listItemErrors.filter(
      (item) => item.index !== index
    );

    onChangeListItemErrors(updatedListItemErrors);
    onChangeFormFields(updatedFormFields);
    onChangeNameFields(updatedNameFields);
    onChangeTypeFields(updatedTypeFields);
    onChangeErrorFields([]);
    onChangePropertyNameError([]);

    resetFormError();
  };

  const handleAddListValue = (index: number) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    const currentField = updatedFormFields[index];

    const updatedAllowedValues: AllowedValuesList = {
      type: 'list',
      values: [...(currentField.allowed_values?.values || []), ''],
    };

    updatedFormFields[index] = {
      ...currentField,
      allowed_values: updatedAllowedValues,
    };

    onChangeFormFields(updatedFormFields);
  };

  const handleChangeListValues = (
    index: number,
    valueIndex: number,
    value: string
  ) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    const currentField = updatedFormFields[index];

    const updatedAllowedValues: AllowedValuesList = {
      type: 'list',
      values:
        currentField.allowed_values?.values.map((val, i) =>
          i === valueIndex ? value : val
        ) || [],
    };

    updatedFormFields[index] = {
      ...currentField,
      allowed_values: updatedAllowedValues,
    };

    onChangeFormFields(updatedFormFields);

    // Remove the error when the value is changed

    const updatedListItemErrors = [...listItemErrors];
    const errorIndex = updatedListItemErrors.findIndex(
      (error) => error.index === index
    );

    if (errorIndex !== -1) {
      updatedListItemErrors[errorIndex] = {
        index: index,
        valueIndex: (
          updatedListItemErrors[errorIndex]?.valueIndex || []
        ).filter((item) => item.errorMessage !== 'Duplicate value'),
      };

      updatedListItemErrors[index] = {
        index: index,
        valueIndex: (updatedListItemErrors[index]?.valueIndex ?? []).filter(
          (item) => item.index !== valueIndex
        ),
      };
      onChangeListItemErrors(updatedListItemErrors);
    }
  };

  const handleDeleteListValue = (index: number, valueIndex: number) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    const currentField = updatedFormFields[index];

    const updatedAllowedValues: AllowedValuesList = {
      type: 'list',
      values:
        currentField.allowed_values?.values.filter(
          (_, i) => i !== valueIndex
        ) || [],
    };

    updatedFormFields[index] = {
      ...currentField,
      allowed_values: updatedAllowedValues,
    };

    onChangeFormFields(updatedFormFields);

    // Remove the error when the value is deleted
    const updatedListItemErrors = [...listItemErrors];
    const errorIndex = updatedListItemErrors.findIndex(
      (error) => error.index === index
    );

    if (errorIndex !== -1) {
      updatedListItemErrors[errorIndex] = {
        index: index,
        valueIndex: (
          updatedListItemErrors[errorIndex]?.valueIndex || []
        ).filter((item) => item.errorMessage !== 'Duplicate value'),
      };
    }

    updatedListItemErrors[index] = {
      index: index,
      valueIndex: (updatedListItemErrors[index]?.valueIndex ?? []).filter(
        (item) => item.index !== valueIndex
      ),
    };
    onChangeListItemErrors(updatedListItemErrors);
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
            onChange={(e) => handleChange(index, 'name', e.target.value)}
            error={
              (errorFields.includes(index) && !nameFields[index].trim()) ||
              (propertyNameError.length !== 0 &&
                propertyNameError.find((name) => {
                  return name === field.name.toLowerCase().trim();
                }) === field.name.toLowerCase().trim())
            }
            helperText={
              errorFields.includes(index) && !nameFields[index].trim()
                ? 'Property Name is required'
                : propertyNameError.length !== 0 &&
                    propertyNameError.find((name) => {
                      return name === field.name.toLowerCase().trim();
                    }) === field.name.toLowerCase().trim()
                  ? 'Duplicate property name. Please change the name or remove the property'
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
            disabled={field.type === 'boolean'}
            sx={{ width: '200px', minWidth: '200px' }}
          >
            <InputLabel
              error={errorFields.includes(index) && !typeFields[index].trim()}
              required={true}
              id={`catalogue-properties-form-select-allowed-values-label-${index}`}
            >
              Select Allowed values
            </InputLabel>
            <Select
              value={allowedValues[index] ?? 'any'}
              onChange={(e) => {
                if (e.target.value !== 'list') {
                  const updatedFormFields: CatalogueCategoryFormData[] = [
                    ...formFields,
                  ];
                  const currentField = updatedFormFields[index];

                  updatedFormFields[index] = {
                    ...currentField,
                    allowed_values: undefined,
                  };

                  onChangeFormFields(updatedFormFields);
                }

                setAllowedValues((prev) => {
                  const updatedAllowedValues = [...prev];
                  updatedAllowedValues[index] =
                    e.target.value === 'list' ? 'list' : undefined;
                  return updatedAllowedValues;
                });
              }}
              error={errorFields.includes(index) && !typeFields[index].trim()}
              label="Select Allowed values"
              labelId={`catalogue-properties-form-select-allowed-values-label-${index}`}
              required={true}
            >
              {' '}
              <MenuItem value="any">Any</MenuItem>
              <MenuItem value="list">List</MenuItem>
            </Select>
            {errorFields.includes(index) && !typeFields[index].trim() && (
              <FormHelperText error>
                Select Data Type is required
              </FormHelperText>
            )}
          </FormControl>

          {allowedValues[index] === 'list' && (
            <Stack
              direction="column"
              sx={{
                width: '200px',
                minWidth: '200px',
                alignItems: 'center',
              }}
            >
              {field.allowed_values?.values.map((listValue, valueIndex) => (
                <Stack
                  key={valueIndex}
                  direction="row"
                  sx={{ alignItems: 'center' }}
                  spacing={1}
                >
                  <TextField
                    label="List Item"
                    variant="outlined"
                    sx={{ pb: 1 }}
                    value={listValue as string}
                    onChange={(e) =>
                      field.allowed_values &&
                      handleChangeListValues(
                        index,
                        valueIndex,
                        e.target.value as string
                      )
                    }
                    error={
                      !!listItemErrors[index]?.valueIndex?.find(
                        (item) => item.index === valueIndex
                      )
                    }
                    helperText={
                      listItemErrors[index]?.valueIndex?.find(
                        (item) => item.index === valueIndex
                      )?.errorMessage || ''
                    }
                  />

                  <IconButton
                    onClick={() => handleDeleteListValue(index, valueIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}

              <IconButton onClick={() => handleAddListValue(index)}>
                <AddIcon />
              </IconButton>
            </Stack>
          )}
          <FormControl
            sx={{ minWidth: '150px' }}
            disabled={field.type === 'boolean'}
          >
            <TextField
              label="Select Unit"
              variant="outlined"
              value={field.unit ?? ''}
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
              value={field.mandatory ? 'yes' : 'no'}
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
          <IconButton onClick={() => handleDeleteField(index)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <IconButton
        sx={{ margin: '8px' }}
        onClick={handleAddField}
        aria-label={'Add catalogue category field entry'}
      >
        <AddIcon />
      </IconButton>
    </div>
  );
}

export default CataloguePropertiesForm;
