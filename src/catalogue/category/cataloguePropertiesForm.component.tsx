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

  const handleDeleteField = (cip_placement_id: string) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];

    // Find the index of the item with the given cip_placement_id
    const index = updatedFormFields.findIndex(
      (field) => field.cip_placement_id === cip_placement_id
    );

    if (index === -1) {
      // Item with given cip_placement_id not found
      return; // or handle the error accordingly
    }

    updatedFormFields.splice(index, 1);

    // When a catalogue item property is deleted, remove the list errors associated with its cip_placement_id
    const updatedAllowedValuesListErrors = allowedValuesListErrors.filter(
      (item) => item.cip_placement_id !== cip_placement_id
    );

    const updatedCatalogueItemPropertiesErrors = catalogueItemPropertiesErrors
      .filter((item) => item.cip_placement_id !== cip_placement_id)
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
    cip_placement_id: string,
    field: keyof CatalogueCategoryFormData,
    value: string | boolean | null
  ) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];

    const fieldIndex = updatedFormFields.findIndex(
      (field) => field.cip_placement_id === cip_placement_id
    );
    if (fieldIndex === -1) {
      // Handle the case where the field with the given cip_placement_id is not found
      return;
    }

    if (
      field === 'type' &&
      (value === 'boolean' || value === 'number' || value === 'string')
    ) {
      updatedFormFields[fieldIndex].type = value;

      const updatedCatalogueItemPropertiesErrors =
        catalogueItemPropertiesErrors.filter((item) => {
          return !(
            item.cip_placement_id === cip_placement_id &&
            item.errors &&
            item.errors.fieldName === 'type'
          );
        });
      onChangeCatalogueItemPropertiesErrors(
        updatedCatalogueItemPropertiesErrors
      );
      updatedFormFields[fieldIndex][field] = value;
      if (value === 'boolean') {
        delete updatedFormFields[fieldIndex].unit;
        delete updatedFormFields[fieldIndex].allowed_values;
      }
    } else if (field === 'name') {
      const updatedCatalogueItemPropertiesErrors = catalogueItemPropertiesErrors
        .filter((item) => {
          return !(
            item.cip_placement_id === cip_placement_id &&
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

      updatedFormFields[fieldIndex].name = value as string;
    } else {
      (updatedFormFields[fieldIndex][field] as boolean | string | null) = value;
    }
    if (field === 'type') {
      const updatedAllowedValuesListErrors = allowedValuesListErrors.filter(
        (item) => item.cip_placement_id !== cip_placement_id
      );

      onChangeAllowedValuesListErrors(updatedAllowedValuesListErrors);
    }

    onChangeFormFields(updatedFormFields);

    resetFormError();
  };
  const handleAddListValue = (cip_placement_id: string) => {
    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];

    // Find the index of the item with the given cip_placement_id
    const index = updatedFormFields.findIndex(
      (field) => field.cip_placement_id === cip_placement_id
    );

    if (index === -1) {
      // Item with given cip_placement_id not found
      return; // or handle the error accordingly
    }

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
          item.cip_placement_id === cip_placement_id &&
          item.errors &&
          item.errors.fieldName === 'list'
        );
      });
    onChangeCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
  };

  const handleChangeListValues = (
    cip_placement_id: string,
    av_placement_id: string,
    value: string
  ) => {
    // Find the index of the field with the provided cip_placement_id
    const fieldIndex = formFields.findIndex(
      (field) => field.cip_placement_id === cip_placement_id
    );

    if (fieldIndex === -1) {
      // If the field with the provided cip_placement_id doesn't exist, return or handle the error
      return; // Or handle the error accordingly
    }

    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];
    const currentField = updatedFormFields[fieldIndex];

    if (currentField.allowed_values) {
      // Find the index of the value within the allowed_values array with the provided av_placement_id
      const valueIndex = currentField.allowed_values.values.findIndex(
        (val) => val.av_placement_id === av_placement_id
      );

      if (valueIndex !== -1) {
        const updatedAllowedValues: AllowedValuesList = {
          type: 'list',
          values: currentField.allowed_values.values.map((val, i) =>
            i === valueIndex ? { ...val, value } : val
          ),
        };

        updatedFormFields[fieldIndex] = {
          ...currentField,
          allowed_values: updatedAllowedValues,
        };

        onChangeFormFields(updatedFormFields);

        // Remove the error when the value is changed
        const updatedAllowedValuesListErrors = allowedValuesListErrors.map(
          (error) => {
            if (error.cip_placement_id === cip_placement_id) {
              return {
                ...error,
                errors: (error.errors || [])
                  .filter((item) => item.av_placement_id !== av_placement_id)
                  .filter((item) => item.errorMessage !== 'Duplicate value'),
              };
            }
            return error;
          }
        );

        onChangeAllowedValuesListErrors(
          updatedAllowedValuesListErrors.filter(
            (item) => (item.errors?.length ?? 0) > 0
          )
        );
      }
    }
  };

  const handleDeleteListValue = (
    cip_placement_id: string,
    av_placement_id: string
  ) => {
    // Find the index of the field with the provided cip_placement_id
    const fieldIndex = formFields.findIndex(
      (field) => field.cip_placement_id === cip_placement_id
    );

    if (fieldIndex === -1) {
      // If the field with the provided cip_placement_id doesn't exist, return or handle the error
      return; // Or handle the error accordingly
    }

    const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
      ...formFields,
    ];
    const currentField = updatedFormFields[fieldIndex];

    if (currentField.allowed_values) {
      // Remove the value with the provided av_placement_id from the allowed_values array
      const updatedAllowedValues: AllowedValuesList = {
        type: 'list',
        values: currentField.allowed_values.values.filter(
          (val) => val.av_placement_id !== av_placement_id
        ),
      };

      updatedFormFields[fieldIndex] = {
        ...currentField,
        allowed_values: updatedAllowedValues,
      };

      onChangeFormFields(updatedFormFields);

      // Remove the error when the value is deleted
      const updatedAllowedValuesListErrors = allowedValuesListErrors.map(
        (error) => {
          if (error.cip_placement_id === cip_placement_id) {
            return {
              ...error,
              errors: (error.errors || []).filter(
                (item) => item.av_placement_id !== av_placement_id
              ),
            };
          }
          return error;
        }
      );

      onChangeAllowedValuesListErrors(
        updatedAllowedValuesListErrors.filter(
          (item) => (item.errors?.length ?? 0) > 0
        )
      );
    }
  };

  const catalogueItemPropertyMessage = React.useCallback(
    (
      cip_placement_id: string,
      column: 'name' | 'type' | 'unit' | 'mandatory' | 'list'
    ) => {
      const errors = catalogueItemPropertiesErrors.filter((item) => {
        return (
          item.cip_placement_id === cip_placement_id &&
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
    (cip_placement_id: string, av_placement_id: string) => {
      const atIndex =
        allowedValuesListErrors.find(
          (item) => item.cip_placement_id === cip_placement_id
        )?.errors ?? [];
      if (atIndex.length >= 1) {
        const filteredItems = atIndex.filter((item) => {
          return item.av_placement_id === av_placement_id;
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
        <Stack
          direction="row"
          key={field.cip_placement_id}
          spacing={1}
          padding={1}
        >
          <TextField
            label="Property Name"
            id={`catalogue-category-form-data-name-${field.cip_placement_id}`}
            variant="outlined"
            required={true}
            value={field.name}
            onChange={(e) =>
              handleChange(field.cip_placement_id, 'name', e.target.value)
            }
            error={
              !!catalogueItemPropertyMessage(field.cip_placement_id, 'name')
            }
            helperText={
              catalogueItemPropertyMessage(field.cip_placement_id, 'name')
                ?.errors?.errorMessage
            }
            sx={{ minWidth: '150px' }}
          />
          <FormControl sx={{ width: '150px', minWidth: '150px' }}>
            <InputLabel
              error={
                !!catalogueItemPropertyMessage(field.cip_placement_id, 'type')
              }
              required={true}
              id={`catalogue-properties-form-select-type-label-${field.cip_placement_id}`}
            >
              Select Type
            </InputLabel>
            <Select
              value={field.type === 'string' ? 'text' : field.type}
              onChange={(e) => {
                handleChange(
                  field.cip_placement_id,
                  'type',
                  e.target.value === 'text' ? 'string' : e.target.value
                );
              }}
              error={
                !!catalogueItemPropertyMessage(field.cip_placement_id, 'type')
              }
              label="Select Type"
              labelId={`catalogue-properties-form-select-type-label-${field.cip_placement_id}`}
              required={true}
            >
              <MenuItem value="boolean">Boolean</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
            {catalogueItemPropertyMessage(field.cip_placement_id, 'type') && (
              <FormHelperText error>
                {
                  catalogueItemPropertyMessage(field.cip_placement_id, 'type')
                    ?.errors?.errorMessage
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
              id={`catalogue-properties-form-select-allowed-values-label-${field.cip_placement_id}`}
            >
              Select Allowed values
            </InputLabel>
            <Select
              value={field.allowed_values?.type ?? 'any'}
              onChange={(e) => {
                const updatedFormFields: CatalogueCategoryFormDataWithIDs[] = [
                  ...formFields,
                ];
                const fieldIndex = updatedFormFields.findIndex(
                  (formField) =>
                    formField.cip_placement_id === field.cip_placement_id
                );

                if (fieldIndex !== -1) {
                  if (e.target.value !== 'list') {
                    delete updatedFormFields[fieldIndex].allowed_values;
                  } else {
                    updatedFormFields[fieldIndex] = {
                      ...updatedFormFields[fieldIndex],
                      allowed_values: { type: 'list', values: [] },
                    };
                  }

                  onChangeFormFields(updatedFormFields);
                }
              }}
              label="Select Allowed values"
              labelId={`catalogue-properties-form-select-allowed-values-label-${field.cip_placement_id}`}
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
                        field.cip_placement_id,
                        listValue.av_placement_id,
                        e.target.value as string
                      )
                    }
                    error={
                      !!allowedValuesListErrorMessage(
                        field.cip_placement_id,
                        listValue.av_placement_id
                      )
                    }
                    helperText={allowedValuesListErrorMessage(
                      field.cip_placement_id,
                      listValue.av_placement_id
                    )}
                  />

                  <IconButton
                    aria-label={`Delete list item ${valueIndex}`}
                    onClick={() =>
                      handleDeleteListValue(
                        field.cip_placement_id,
                        listValue.av_placement_id
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}

              <IconButton
                aria-label={`Add list item ${index}`}
                onClick={() => handleAddListValue(field.cip_placement_id)}
              >
                <AddIcon />
              </IconButton>
              {catalogueItemPropertyMessage(field.cip_placement_id, 'list') && (
                <FormHelperText error>
                  {
                    catalogueItemPropertyMessage(field.cip_placement_id, 'list')
                      ?.errors?.errorMessage
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
                handleChange(
                  field.cip_placement_id,
                  'unit',
                  newValue?.value || null
                );
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
              id={`catalogue-properties-form-select-mandatory-label-${field.cip_placement_id}`}
            >
              Select is mandatory?
            </InputLabel>
            <Select
              value={field.mandatory ? 'yes' : 'no'}
              onChange={(e) =>
                handleChange(
                  field.cip_placement_id,
                  'mandatory',
                  e.target.value === 'yes'
                )
              }
              label="Select is mandatory?"
              labelId={`catalogue-properties-form-select-mandatory-label-${field.cip_placement_id}`}
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
              onClick={() => handleDeleteField(field.cip_placement_id)}
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
