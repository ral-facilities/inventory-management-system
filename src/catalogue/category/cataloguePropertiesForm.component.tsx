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
  Box,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  AllowedValuesList,
  CatalogueCategoryFormData,
  CatalogueItemPropertiesErrorsType,
  AllowedValuesListErrorsType,
  Unit,
  CatalogueCategoryFormDataWithIDs,
} from '../../app.types';
import { useUnits } from '../../api/units';
import { generateUniqueId } from '../../utils';

export interface CataloguePropertiesFormProps {
  formFields: CatalogueCategoryFormDataWithIDs[];
  onChangeFormFields: (formFields: CatalogueCategoryFormDataWithIDs[]) => void;
  catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[];
  onChangeCatalogueItemPropertiesErrors: (
    catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[]
  ) => void;
  allowedValuesListErrors: AllowedValuesListErrorsType[];
  onChangeAllowedValuesListErrors: (
    allowedValuesListErrors: AllowedValuesListErrorsType[]
  ) => void;
  resetFormError: () => void;
}

function CataloguePropertiesForm(props: CataloguePropertiesFormProps) {
  const {
    formFields,
    onChangeFormFields,
    onChangeAllowedValuesListErrors,
    onChangeCatalogueItemPropertiesErrors,
    catalogueItemPropertiesErrors,
    allowedValuesListErrors,
    resetFormError,
  } = props;

  const { data: units } = useUnits();

  const handleAddField = () => {
    onChangeFormFields([
      ...formFields,
      {
        name: '',
        type: '',
        unit: undefined,
        mandatory: false,
        allowed_values: undefined,
        cip_placement_id: generateUniqueId('cip_placement_id_'),
      },
    ]);
    resetFormError();
  };

  const handleDeleteField = (index: number) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];
    updatedFormFields.splice(index, 1);

    // When a catalogue item property is deleted it removes the list errors
    const updatedAllowedValuesListErrors = allowedValuesListErrors.filter(
      (item) => item.index !== index
    );

    const updatedCatalogueItemPropertiesErrors = catalogueItemPropertiesErrors
      .filter((item) => item.index !== index)
      .filter(
        (item) =>
          item.errors?.errorMessage !==
          'Duplicate property name. Please change the name or remove the property'
      );

    onChangeAllowedValuesListErrors(updatedAllowedValuesListErrors);
    onChangeFormFields(updatedFormFields);
    onChangeCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
    resetFormError();
  };

  const handleChange = (
    index: number,
    field: keyof CatalogueCategoryFormData,
    value: string | boolean | null
  ) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];

    if (
      field === 'type' &&
      (value === 'boolean' || value === 'number' || value === 'string')
    ) {
      updatedFormFields[index].type = value;

      const updatedCatalogueItemPropertiesErrors =
        catalogueItemPropertiesErrors.filter((item) => {
          return !(
            item.index === index &&
            item.errors &&
            item.errors.fieldName === 'type'
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
          return !(
            item.index === index &&
            item.errors &&
            item.errors.fieldName === 'name'
          );
        })
        .filter(
          (item) =>
            item.errors?.errorMessage !==
            'Duplicate property name. Please change the name or remove the property'
        );

      onChangeCatalogueItemPropertiesErrors(
        updatedCatalogueItemPropertiesErrors
      );

      updatedFormFields[index].name = value as string;
    } else {
      (updatedFormFields[index][field] as boolean | string | null) = value;
    }
    if (field === 'type') {
      const updatedallowedValuesListErrors = allowedValuesListErrors.filter(
        (item) => item.index !== index
      );

      onChangeAllowedValuesListErrors(updatedallowedValuesListErrors);
    }

    onChangeFormFields(updatedFormFields);

    resetFormError();
  };

  const handleAddListValue = (index: number) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];
    const currentField = updatedFormFields[index];

    const updatedAllowedValues: AllowedValuesList = {
      type: 'list',
      values: [
        ...(currentField.allowed_values?.values || []),
        {
          av_placement_id: generateUniqueId('av_placement_id_'),
          value: '',
        },
      ],
    };

    updatedFormFields[index] = {
      ...currentField,
      allowed_values: updatedAllowedValues,
    };

    onChangeFormFields(updatedFormFields);

    const updatedCatalogueItemPropertiesErrors =
      catalogueItemPropertiesErrors.filter((item) => {
        return !(
          item.index === index &&
          item.errors &&
          item.errors.fieldName === 'list'
        );
      });
    onChangeCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
  };

  const handleChangeListValues = (
    index: number,
    valueIndex: number,
    value: string
  ) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];
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

      const updatedallowedValuesListErrors = [...allowedValuesListErrors];

      const errorIndex = updatedallowedValuesListErrors.findIndex(
        (error) => error.index === index
      );

      updatedallowedValuesListErrors[errorIndex] = {
        index: index,
        errors: (updatedallowedValuesListErrors[errorIndex]?.errors ?? [])
          .filter((item) => item.index !== valueIndex)
          .filter((item) => item.errorMessage !== 'Duplicate value'),
      };

      onChangeAllowedValuesListErrors(
        updatedallowedValuesListErrors.filter(
          (item) => (item.errors?.length ?? 0) > 0
        )
      );
    }
  };

  const handleDeleteListValue = (index: number, valueIndex: number) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];
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
      const updatedallowedValuesListErrors = [...allowedValuesListErrors];
      const errorIndex = updatedallowedValuesListErrors.findIndex(
        (error) => error.index === index
      );

      updatedallowedValuesListErrors[errorIndex] = {
        index: index,
        errors: (updatedallowedValuesListErrors[errorIndex]?.errors ?? [])
          .filter((item) => item.index !== valueIndex)
          .filter((item) => item.errorMessage !== 'Duplicate value'),
      };

      onChangeAllowedValuesListErrors(
        updatedallowedValuesListErrors.filter(
          (item) => (item.errors?.length ?? 0) > 0
        )
      );
    }
  };

  const catalogueItemPropertyMessage = React.useCallback(
    (
      index: number,
      column: 'name' | 'type' | 'unit' | 'mandatory' | 'list'
    ) => {
      const errors = catalogueItemPropertiesErrors.filter((item) => {
        return (
          item.index === index &&
          item.errors &&
          item.errors.fieldName === column
        );
      });

      if (errors.length >= 1) {
        return errors[0];
      }
    },
    [catalogueItemPropertiesErrors]
  );

  const allowedValuesListErrorMessage = React.useCallback(
    (index: number, listIndex: number) => {
      const atIndex =
        allowedValuesListErrors.find((item) => item.index === index)?.errors ??
        [];
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
    [allowedValuesListErrors]
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
            error={!!catalogueItemPropertyMessage(index, 'name')}
            helperText={
              catalogueItemPropertyMessage(index, 'name')?.errors?.errorMessage
            }
            sx={{ minWidth: '150px' }}
          />
          <FormControl sx={{ width: '150px', minWidth: '150px' }}>
            <InputLabel
              error={!!catalogueItemPropertyMessage(index, 'type')}
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
              error={!!catalogueItemPropertyMessage(index, 'type')}
              label="Select Type"
              labelId={`catalogue-properties-form-select-type-label-${index}`}
              required={true}
            >
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
            {catalogueItemPropertyMessage(index, 'type') && (
              <FormHelperText error>
                {
                  catalogueItemPropertyMessage(index, 'type')?.errors
                    ?.errorMessage
                }
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
                const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
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
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {field.allowed_values?.values.map((listValue, valueIndex) => (
                <Stack
                  key={valueIndex}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                  spacing={1}
                >
                  <TextField
                    label={`List Item`}
                    aria-label={`List Item ${valueIndex}`}
                    variant="outlined"
                    value={listValue.value as string}
                    onChange={(e) =>
                      field.allowed_values &&
                      handleChangeListValues(
                        index,
                        valueIndex,
                        e.target.value as string
                      )
                    }
                    error={!!allowedValuesListErrorMessage(index, valueIndex)}
                    helperText={allowedValuesListErrorMessage(
                      index,
                      valueIndex
                    )}
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
              {catalogueItemPropertyMessage(index, 'list') && (
                <FormHelperText error>
                  {
                    catalogueItemPropertyMessage(index, 'list')?.errors
                      ?.errorMessage
                  }
                </FormHelperText>
              )}
            </Stack>
          )}

          <FormControl
            sx={{ minWidth: '200px' }}
            disabled={field.type === 'boolean'}
          >
            <Autocomplete
              options={units ?? []}
              getOptionLabel={(option) => option.value}
              value={units?.find((unit) => unit.value === field.unit) || null}
              disabled={field.type === 'boolean'}
              onChange={(_event, newValue: Unit | null) => {
                handleChange(index, 'unit', newValue?.value || null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Unit"
                  variant="outlined"
                  disabled={field.type === 'boolean'}
                />
              )}
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

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconButton
              aria-label={'Delete catalogue category field entry'}
              onClick={() => handleDeleteField(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
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
