import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';

import {
  AllowedValuesList,
  CatalogueCategoryPostProperty,
  CatalogueCategoryProperty,
} from '../../api/api.types';
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  AllowedValuesListErrorsType,
  CatalogueItemPropertiesErrorsType,
  FormFields,
} from '../../app.types';
import { generateUniqueId } from '../../utils';
import CataloguePropertyForm from './cataloguePropertyForm.component';

export interface CataloguePropertiesFormProps {
  formFields: FormFields[];
  onChangeFormFields?: (
    formFields: AddCatalogueCategoryPropertyWithPlacementIds[]
  ) => void;
  catalogueItemPropertiesErrors?: CatalogueItemPropertiesErrorsType[];
  onChangeCatalogueItemPropertiesErrors?: (
    catalogueItemPropertiesErrors: CatalogueItemPropertiesErrorsType[]
  ) => void;
  allowedValuesListErrors?: AllowedValuesListErrorsType[];
  onChangeAllowedValuesListErrors?: (
    allowedValuesListErrors: AllowedValuesListErrorsType[]
  ) => void;
  isDisabled: boolean;
  resetFormError?: () => void;
  onChangeEditCatalogueItemField?: (
    catalogueItemField: CatalogueCategoryProperty
  ) => void;
  selectedCatalogueItemField?: CatalogueCategoryProperty;
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
    isDisabled,
    onChangeEditCatalogueItemField,
    selectedCatalogueItemField,
  } = props;

  const handleAddField = () => {
    onChangeFormFields &&
      onChangeFormFields([
        ...formFields,
        {
          name: '',
          type: '',
          unit_id: undefined,
          mandatory: false,
          allowed_values: undefined,
          cip_placement_id: generateUniqueId('cip_placement_id_'),
        },
      ]);
    resetFormError && resetFormError();
  };

  const handleDeleteField = (cip_placement_id: string) => {
    if (
      allowedValuesListErrors &&
      onChangeAllowedValuesListErrors &&
      onChangeFormFields &&
      resetFormError &&
      onChangeCatalogueItemPropertiesErrors &&
      catalogueItemPropertiesErrors &&
      formFields
    ) {
      const updatedFormFields: AddCatalogueCategoryPropertyWithPlacementIds[] =
        [...formFields];

      // Find the index of the item with the given cip_placement_id
      const index = updatedFormFields.findIndex(
        (field) => field.cip_placement_id === cip_placement_id
      );

      if (index === -1) {
        return;
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
      onChangeCatalogueItemPropertiesErrors(
        updatedCatalogueItemPropertiesErrors
      );
      resetFormError();
    }
  };

  const handleChange = (
    cip_placement_id: string,
    field: keyof CatalogueCategoryPostProperty,
    value: string | boolean | null
  ) => {
    if (
      allowedValuesListErrors &&
      onChangeAllowedValuesListErrors &&
      onChangeFormFields &&
      resetFormError &&
      onChangeCatalogueItemPropertiesErrors &&
      catalogueItemPropertiesErrors &&
      formFields
    ) {
      const updatedFormFields: AddCatalogueCategoryPropertyWithPlacementIds[] =
        [...formFields];

      const fieldIndex = updatedFormFields.findIndex(
        (field) => field.cip_placement_id === cip_placement_id
      );
      if (fieldIndex === -1) {
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
          delete updatedFormFields[fieldIndex].unit_id;
          delete updatedFormFields[fieldIndex].allowed_values;
        }
      } else if (field === 'name') {
        const updatedCatalogueItemPropertiesErrors =
          catalogueItemPropertiesErrors
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
      } else if (field === 'allowed_values') {
        if (value !== 'list') {
          delete updatedFormFields[fieldIndex].allowed_values;
          const updatedCatalogueItemPropertiesErrors =
            catalogueItemPropertiesErrors.filter((item) => {
              return !(
                item.cip_placement_id === cip_placement_id &&
                item.errors &&
                item.errors.fieldName === 'allowed_values'
              );
            });
          onChangeCatalogueItemPropertiesErrors(
            updatedCatalogueItemPropertiesErrors
          );
        } else {
          updatedFormFields[fieldIndex] = {
            ...updatedFormFields[fieldIndex],
            allowed_values: { type: 'list', values: [] },
          };
        }
      } else {
        (updatedFormFields[fieldIndex][field] as boolean | string | null) =
          value;
      }
      if (field === 'type') {
        const updatedAllowedValuesListErrors = allowedValuesListErrors.filter(
          (item) => item.cip_placement_id !== cip_placement_id
        );

        onChangeAllowedValuesListErrors(updatedAllowedValuesListErrors);
      }

      onChangeFormFields(updatedFormFields);

      resetFormError();
    }
  };
  const handleAddListValue = (cip_placement_id: string) => {
    if (
      onChangeFormFields &&
      formFields &&
      catalogueItemPropertiesErrors &&
      onChangeCatalogueItemPropertiesErrors
    ) {
      const updatedFormFields: AddCatalogueCategoryPropertyWithPlacementIds[] =
        [...formFields];

      // Find the index of the item with the given cip_placement_id
      const index = updatedFormFields.findIndex(
        (field) => field.cip_placement_id === cip_placement_id
      );

      if (index === -1) {
        return;
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
            item.errors.fieldName === 'allowed_values'
          );
        });
      onChangeCatalogueItemPropertiesErrors(
        updatedCatalogueItemPropertiesErrors
      );
    }
  };

  const handleChangeListValues = (
    cip_placement_id: string,
    av_placement_id: string,
    value: string
  ) => {
    if (
      formFields &&
      onChangeFormFields &&
      allowedValuesListErrors &&
      onChangeAllowedValuesListErrors
    ) {
      // Find the index of the field with the provided cip_placement_id
      const fieldIndex = formFields.findIndex(
        (field) => field.cip_placement_id === cip_placement_id
      );

      if (fieldIndex === -1) {
        return;
      }

      const updatedFormFields: AddCatalogueCategoryPropertyWithPlacementIds[] =
        [...formFields];
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
    }
  };

  const handleDeleteListValue = (
    cip_placement_id: string,
    av_placement_id: string
  ) => {
    if (
      formFields &&
      onChangeFormFields &&
      allowedValuesListErrors &&
      onChangeAllowedValuesListErrors
    ) {
      // Find the index of the field with the provided cip_placement_id
      const fieldIndex = formFields.findIndex(
        (field) => field.cip_placement_id === cip_placement_id
      );

      if (fieldIndex === -1) {
        return;
      }

      const updatedFormFields: AddCatalogueCategoryPropertyWithPlacementIds[] =
        [...formFields];
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

  const catalogueItemPropertyMessage = React.useCallback(
    (cip_placement_id: string, field: keyof CatalogueCategoryPostProperty) => {
      const errors = catalogueItemPropertiesErrors?.filter((item) => {
        return (
          item.cip_placement_id === cip_placement_id &&
          item.errors &&
          item.errors.fieldName === field
        );
      });

      if (errors && errors.length >= 1) {
        return { ...errors[0], cip_placement: undefined } as Omit<
          CatalogueItemPropertiesErrorsType,
          'cip_placement_id'
        >;
      }
    },
    [catalogueItemPropertiesErrors]
  );

  const allowedValuesListErrorMessage = React.useCallback(
    (cip_placement_id: string, av_placement_id: string) => {
      const atIndex =
        allowedValuesListErrors?.find(
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

  const hasAllowedValuesList = React.useCallback(() => {
    return (
      formFields.filter(
        (formField) => formField.allowed_values?.type === 'list'
      ).length !== 0
    );
  }, [formFields]);

  return (
    <div>
      {formFields.map((formField) => {
        const { cip_placement_id, ...formFieldWithoutCIP } = formField;

        return (
          <Box
            sx={{ display: 'flex', alignItems: 'center' }}
            key={cip_placement_id}
          >
            {onChangeEditCatalogueItemField && 'id' in formFieldWithoutCIP && (
              <FormControl>
                <RadioGroup
                  aria-label={`${formField.name} radio button group`}
                  value={
                    selectedCatalogueItemField &&
                    selectedCatalogueItemField.id === formFieldWithoutCIP.id
                      ? 'selected'
                      : 'not-selected'
                  }
                  onChange={() => {
                    onChangeEditCatalogueItemField(formFieldWithoutCIP);
                  }}
                >
                  <FormControlLabel
                    value="selected"
                    control={<Radio />}
                    aria-label={`${formField.name} radio button`}
                    label="" // Empty label
                  />
                </RadioGroup>
              </FormControl>
            )}
            <CataloguePropertyForm
              type={isDisabled ? 'disabled' : 'normal'}
              catalogueItemField={formFieldWithoutCIP}
              handleChange={({ field, value }) =>
                handleChange(cip_placement_id, field, value)
              }
              handleDeleteField={() => handleDeleteField(cip_placement_id)}
              handleChangeListValues={(av_placement_id, value) =>
                handleChangeListValues(cip_placement_id, av_placement_id, value)
              }
              handleAddListValue={() => handleAddListValue(cip_placement_id)}
              handleDeleteListValue={(av_placement_id) =>
                handleDeleteListValue(cip_placement_id, av_placement_id)
              }
              catalogueItemPropertyMessage={(field) =>
                catalogueItemPropertyMessage(cip_placement_id, field)
              }
              allowedValuesListErrorMessage={(av_placement_id) =>
                allowedValuesListErrorMessage(cip_placement_id, av_placement_id)
              }
              hasAllowedValuesList={hasAllowedValuesList}
              isList={true}
              cip_placement_id={cip_placement_id}
            />
          </Box>
        );
      })}
      {!isDisabled && (
        <IconButton
          sx={{ margin: '8px' }}
          onClick={handleAddField}
          aria-label={'Add catalogue category field entry'}
        >
          <AddIcon />
        </IconButton>
      )}
    </div>
  );
}

export default CataloguePropertiesForm;
