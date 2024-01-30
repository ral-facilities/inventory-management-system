import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AllowedValuesList, CatalogueCategoryFormData } from '../../app.types';

export interface CataloguePropertiesFormProps {
  formFields: CatalogueCategoryFormData[];
  onChangeFormFields: (formFields: CatalogueCategoryFormData[]) => void;
  catalogueItemPropertiesErrors: {
    index: number;
    valueIndex: {
      index: 'name' | 'type' | 'unit' | 'mandatory' | 'list';
      errorMessage: string;
    } | null;
  }[];
  onChangeCatalogueItemPropertiesErrors: (
    catalogueItemPropertiesErrors: {
      index: number;
      valueIndex: {
        index: 'name' | 'type' | 'unit' | 'mandatory' | 'list';
        errorMessage: string;
      } | null;
    }[]
  ) => void;
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
    onChangeListItemErrors,
    onChangeCatalogueItemPropertiesErrors,
    catalogueItemPropertiesErrors,
    listItemErrors,
    resetFormError,
  } = props;

  const handleAddField = () => {
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
    resetFormError();
  };

  const handleDeleteField = (index: number) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    updatedFormFields.splice(index, 1);

    const updatedListItemErrors = listItemErrors.filter(
      (item) => item.index !== index
    );

    const updatedCatalogueItemPropertiesErrors = catalogueItemPropertiesErrors
      .filter((item) => item.index !== index)
      .filter(
        (item) =>
          item.valueIndex?.errorMessage !==
          'Duplicate property name. Please change the name or remove the property'
      );

    onChangeListItemErrors(updatedListItemErrors);
    onChangeFormFields(updatedFormFields);
    onChangeCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
    resetFormError();
  };

  const handleChange = (
    index: number,
    field: keyof CatalogueCategoryFormData,
    value: string | boolean | null
  ) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];

    if (
      field === 'type' &&
      (value === 'boolean' || value === 'number' || value === 'string')
    ) {
      updatedFormFields[index].type = value;

      const updatedCatalogueItemPropertiesErrors =
        catalogueItemPropertiesErrors.filter((item) => {
          // Check if the index is not equal to the specified index and if the valueIndex index is not "type"
          return !(
            item.index === index &&
            item.valueIndex &&
            item.valueIndex.index === 'type'
          );
        });
      onChangeCatalogueItemPropertiesErrors(
        updatedCatalogueItemPropertiesErrors
      );
      updatedFormFields[index][field] = value;
      if (value === 'boolean') {
        delete updatedFormFields[index].unit;
        delete updatedFormFields[index].allowed_values;
      }
    } else if (field === 'name') {
      const updatedCatalogueItemPropertiesErrors = catalogueItemPropertiesErrors
        .filter((item) => {
          // Check if the index is not equal to the specified index and if the valueIndex index is not "type"
          return !(
            item.index === index &&
            item.valueIndex &&
            item.valueIndex.index === 'name'
          );
        })
        .filter(
          (item) =>
            item.valueIndex?.errorMessage !==
            'Duplicate property name. Please change the name or remove the property'
        );

      onChangeCatalogueItemPropertiesErrors(
        updatedCatalogueItemPropertiesErrors
      );

      updatedFormFields[index].name = value as string;
    } else {
      (updatedFormFields[index][field] as boolean | string | null) = value;
    }

    const updatedListItemErrors = listItemErrors.filter(
      (item) => item.index !== index
    );

    onChangeListItemErrors(updatedListItemErrors);

    onChangeFormFields(updatedFormFields);

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

    const updatedCatalogueItemPropertiesErrors =
      catalogueItemPropertiesErrors.filter((item) => {
        // Check if the index is not equal to the specified index and if the valueIndex index is not "type"
        return !(
          item.index === index &&
          item.valueIndex &&
          item.valueIndex.index === 'list'
        );
      });
    onChangeCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
  };

  const handleChangeListValues = (
    index: number,
    valueIndex: number,
    value: string
  ) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    const currentField = updatedFormFields[index];
    if (currentField.allowed_values) {
      const updatedAllowedValues: AllowedValuesList = {
        type: 'list',
        values: currentField.allowed_values.values.map((val, i) =>
          i === valueIndex ? value : val
        ),
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

      updatedListItemErrors[errorIndex] = {
        index: index,
        valueIndex: (updatedListItemErrors[errorIndex]?.valueIndex ?? [])
          .filter((item) => item.index !== valueIndex)
          .filter((item) => item.errorMessage !== 'Duplicate value'),
      };

      onChangeListItemErrors(
        updatedListItemErrors.filter(
          (item) => (item.valueIndex?.length ?? 0) > 0
        )
      );
    }
  };

  const handleDeleteListValue = (index: number, valueIndex: number) => {
    const updatedFormFields: CatalogueCategoryFormData[] = [...formFields];
    const currentField = updatedFormFields[index];

    if (currentField.allowed_values) {
      const updatedAllowedValues: AllowedValuesList = {
        type: 'list',
        values: currentField.allowed_values.values.filter(
          (_, i) => i !== valueIndex
        ),
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

      updatedListItemErrors[errorIndex] = {
        index: index,
        valueIndex: (updatedListItemErrors[errorIndex]?.valueIndex ?? [])
          .filter((item) => item.index !== valueIndex)
          .filter((item) => item.errorMessage !== 'Duplicate value'),
      };

      onChangeListItemErrors(
        updatedListItemErrors.filter(
          (item) => (item.valueIndex?.length ?? 0) > 0
        )
      );
    }
  };

  const isError = React.useCallback(
    (
      index: number,
      column: 'name' | 'type' | 'unit' | 'mandatory' | 'list'
    ) => {
      return (
        catalogueItemPropertiesErrors.filter((item) => {
          return (
            item.index === index &&
            item.valueIndex &&
            item.valueIndex.index === column
          );
        }).length >= 1
      );
    },
    [catalogueItemPropertiesErrors]
  );

  const errorMessage = React.useCallback(
    (
      index: number,
      column: 'name' | 'type' | 'unit' | 'mandatory' | 'list'
    ) => {
      const errors = catalogueItemPropertiesErrors.filter((item) => {
        return (
          item.index === index &&
          item.valueIndex &&
          item.valueIndex.index === column
        );
      });

      if (errors.length >= 1) {
        return errors[0];
      }
    },
    [catalogueItemPropertiesErrors]
  );

  const isListError = React.useCallback(
    (index: number, listIndex: number) => {
      const atIndex = listItemErrors.find(
        (item) => item.index === index
      )?.valueIndex;
      return (
        (atIndex?.filter((item) => {
          return item.index === listIndex;
        }).length ?? 0) >= 1
      );
    },
    [listItemErrors]
  );

  const listErrorMessage = React.useCallback(
    (index: number, listIndex: number) => {
      const atIndex =
        listItemErrors.find((item) => item.index === index)?.valueIndex ?? [];
      if (atIndex.length >= 1) {
        const filteredItems = atIndex.filter((item) => {
          return item.index === listIndex;
        });
        if (filteredItems.length > 0) {
          return filteredItems[0].errorMessage;
        }
      }
      return '';
    },
    [listItemErrors]
  );

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
            error={isError(index, 'name')}
            helperText={errorMessage(index, 'name')?.valueIndex?.errorMessage}
            sx={{ minWidth: '150px' }}
          />
          <FormControl sx={{ width: '150px', minWidth: '150px' }}>
            <InputLabel
              error={isError(index, 'type')}
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
              error={isError(index, 'type')}
              label="Select Type"
              labelId={`catalogue-properties-form-select-type-label-${index}`}
              required={true}
            >
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
            {isError(index, 'type') && (
              <FormHelperText error>
                {errorMessage(index, 'type')?.valueIndex?.errorMessage}
              </FormHelperText>
            )}
          </FormControl>

          <FormControl
            disabled={field.type === 'boolean'}
            sx={{ width: '200px', minWidth: '200px' }}
          >
            <InputLabel
              required={true}
              id={`catalogue-properties-form-select-allowed-values-label-${index}`}
            >
              Select Allowed values
            </InputLabel>
            <Select
              value={field.allowed_values?.type ?? 'any'}
              onChange={(e) => {
                const updatedFormFields: CatalogueCategoryFormData[] = [
                  ...formFields,
                ];
                const currentField = updatedFormFields[index];
                if (e.target.value !== 'list') {
                  delete updatedFormFields[index].allowed_values;
                } else {
                  updatedFormFields[index] = {
                    ...currentField,
                    allowed_values: { type: 'list', values: [] },
                  };
                }

                onChangeFormFields(updatedFormFields);
              }}
              label="Select Allowed values"
              labelId={`catalogue-properties-form-select-allowed-values-label-${index}`}
              required={true}
            >
              <MenuItem value="any">Any</MenuItem>
              <MenuItem value="list">List</MenuItem>
            </Select>
          </FormControl>

          {field.allowed_values?.type === 'list' && (
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
                    label={`List Item`}
                    aria-label={`List Item ${valueIndex}`}
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
                    error={isListError(index, valueIndex)}
                    helperText={listErrorMessage(index, valueIndex)}
                  />

                  <IconButton
                    aria-label={`Delete list item ${valueIndex}`}
                    onClick={() => handleDeleteListValue(index, valueIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}

              <IconButton
                aria-label={`Add list item ${index}`}
                onClick={() => handleAddListValue(index)}
              >
                <AddIcon />
              </IconButton>
              {isError(index, 'list') && (
                <FormHelperText error>
                  {errorMessage(index, 'list')?.valueIndex?.errorMessage}
                </FormHelperText>
              )}
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
          <IconButton
            aria-label={'Delete catalogue category field entry'}
            onClick={() => handleDeleteField(index)}
          >
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
