import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  useAddCatalogueCategoryProperty,
  useEditCatalogueCategoryProperty,
} from '../../api/catalogueCategories';
import {
  AddCatalogueCategoryWithPlacementIds,
  AllowedValues,
  AllowedValuesList,
  AllowedValuesListErrorsType,
  CatalogueCategory,
  CatalogueCategoryPropertyMigration,
  CatalogueItemPropertiesErrorsType,
} from '../../app.types';
import { generateUniqueId } from '../../utils';
import { convertListToNumbers } from './catalogueCategoryDialog.component';
import CataloguePropertiesForm from './cataloguePropertiesForm.component';
import CataloguePropertyForm from './cataloguePropertyForm.component';

const getEmptyCatalogueItemField = (): CatalogueCategoryPropertyMigration => {
  return {
    name: '',
    type: '',
    mandatory: false,
  } as CatalogueCategoryPropertyMigration;
};
export interface CatalogueItemPropertiesMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCatalogueCategory: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
}

// Stepper
const STEPS_ADD = [
  'Please Select Edit or Add',
  'Current properties',
  'Add catalogue item property',
];

const STEPS_EDIT = [
  'Please Select Edit or Add',
  'Please select one property to edit',
  'Edit catalogue item property',
];

function CatalogueItemPropertiesMigrationDialog(
  props: CatalogueItemPropertiesMigrationDialogProps
) {
  const {
    open,
    onClose,
    selectedCatalogueCategory,
    resetSelectedCatalogueCategory,
  } = props;

  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  // State to manage list item errors
  const [allowedValuesListErrors, setAllowedValuesListErrors] = React.useState<
    Omit<AllowedValuesListErrorsType, 'cip_placement_id'>[]
  >([]);

  const [catalogueItemPropertiesErrors, setCatalogueItemPropertiesErrors] =
    React.useState<
      Omit<CatalogueItemPropertiesErrorsType, 'cip_placement_id'>[]
    >([]);

  const handleClose = React.useCallback(() => {
    setActiveStep(0);
    setAllowedValuesListErrors([]);
    setCatalogueItemPropertiesErrors([]);
    setFormErrorMessage(undefined);
    onClose();
    resetSelectedCatalogueCategory();
  }, [onClose, resetSelectedCatalogueCategory]);

  const updatedCatalogueItemProperties = React.useMemo(
    () =>
      selectedCatalogueCategory.catalogue_item_properties?.map((item) => {
        // Transform allowed_values to an array of objects with id and value keys
        const allowedValuesWithId = item.allowed_values?.values.map(
          (value) => ({
            av_placement_id: generateUniqueId('av_placement_id_'), // Allowed values (av)
            value: value,
          })
        ) || [
          {
            av_placement_id: generateUniqueId('av_placement_id_'),
            value: '',
          },
        ]; // Default case if allowed_values is undefined or empty

        let modifiedCatalogueCategory = {
          ...item,
          cip_placement_id: generateUniqueId('cip_placement_id_'),
        };

        if (item.allowed_values) {
          modifiedCatalogueCategory = {
            ...modifiedCatalogueCategory,
            allowed_values: {
              type: item.allowed_values?.type,
              values: allowedValuesWithId,
            },
          };
        }

        return modifiedCatalogueCategory;
      }) || undefined,
    [selectedCatalogueCategory.catalogue_item_properties]
  );

  const updatedSelectedCatalogueCategory: AddCatalogueCategoryWithPlacementIds =
    JSON.parse(JSON.stringify(selectedCatalogueCategory));

  updatedSelectedCatalogueCategory.catalogue_item_properties =
    updatedCatalogueItemProperties;

  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [steps, setSteps] = React.useState<string[]>([STEPS_ADD[0]]);

  const [catalogueItemField, setCatalogueItemField] = React.useState<
    CatalogueCategoryPropertyMigration | undefined
  >(undefined);

  const [propertyMigrationType, setPropertyMigrationType] = React.useState<
    'edit' | 'add' | null
  >(null);
  const { mutate: addCatalogueCategoryProperty } =
    useAddCatalogueCategoryProperty();

  const { mutate: editCatalogueCategoryProperty } =
    useEditCatalogueCategoryProperty();
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return false;
        case 1:
          return false;

        case 2:
          return (
            catalogueItemPropertiesErrors.length !== 0 ||
            allowedValuesListErrors.length !== 0
          );
      }
    },
    [allowedValuesListErrors.length, catalogueItemPropertiesErrors.length]
  );

  const handleChange = (
    field: keyof CatalogueCategoryPropertyMigration,
    value: string | boolean | number | null
  ) => {
    const updatedCatalogueItemField: CatalogueCategoryPropertyMigration =
      JSON.parse(JSON.stringify(catalogueItemField));

    let updatedCatalogueItemPropertiesErrors: Omit<
      CatalogueItemPropertiesErrorsType,
      'cip_placement_id'
    >[] = JSON.parse(JSON.stringify(catalogueItemPropertiesErrors));

    if (
      field === 'type' &&
      (value === 'boolean' || value === 'number' || value === 'string')
    ) {
      updatedCatalogueItemField.type = value;
      updatedCatalogueItemPropertiesErrors =
        catalogueItemPropertiesErrors.filter((item) => {
          return !(item.errors && item.errors.fieldName === 'type');
        });
    } else if (field === 'name' && typeof value == 'string') {
      updatedCatalogueItemField.name = value;
      updatedCatalogueItemPropertiesErrors =
        catalogueItemPropertiesErrors.filter((item) => {
          return !(item.errors && item.errors.fieldName === 'name');
        });
    } else if (field === 'allowed_values') {
      if (value !== 'list') {
        updatedCatalogueItemPropertiesErrors =
          catalogueItemPropertiesErrors.filter((item) => {
            return !(item.errors && item.errors.fieldName === 'allowed_values');
          });
        delete updatedCatalogueItemField.allowed_values;
      } else {
        updatedCatalogueItemField.allowed_values = { type: 'list', values: [] };
      }
    } else if (field === 'default_value') {
      updatedCatalogueItemField.default_value = value as
        | boolean
        | string
        | number
        | undefined;
      updatedCatalogueItemPropertiesErrors =
        catalogueItemPropertiesErrors.filter((item) => {
          return !(item.errors && item.errors.fieldName === 'default_value');
        });
    } else {
      (updatedCatalogueItemField[field] as boolean | string | number | null) =
        value;
    }

    setCatalogueItemField(updatedCatalogueItemField);
    setCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
    setFormErrorMessage(undefined);
  };

  const handleAddListValue = () => {
    const updatedCatalogueItemField: CatalogueCategoryPropertyMigration =
      JSON.parse(JSON.stringify(catalogueItemField));

    let updatedCatalogueItemPropertiesErrors: Omit<
      CatalogueItemPropertiesErrorsType,
      'cip_placement_id'
    >[] = JSON.parse(JSON.stringify(catalogueItemPropertiesErrors));

    const updatedAllowedValues: AllowedValuesList = {
      type: 'list',
      values: [
        ...(updatedCatalogueItemField.allowed_values?.values || []),
        {
          av_placement_id: generateUniqueId('av_placement_id_'),
          value: '',
        },
      ],
    };

    updatedCatalogueItemField.allowed_values = updatedAllowedValues;
    setCatalogueItemField(updatedCatalogueItemField);
    setFormErrorMessage(undefined);
    updatedCatalogueItemPropertiesErrors = catalogueItemPropertiesErrors.filter(
      (item) => {
        return !(item.errors && item.errors.fieldName === 'allowed_values');
      }
    );

    setCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
  };

  const handleChangeListValues = (av_placement_id: string, value: string) => {
    const updatedCatalogueItemField: CatalogueCategoryPropertyMigration =
      JSON.parse(JSON.stringify(catalogueItemField));

    let updatedCatalogueItemPropertiesErrors: Omit<
      CatalogueItemPropertiesErrorsType,
      'cip_placement_id'
    >[] = JSON.parse(JSON.stringify(catalogueItemPropertiesErrors));

    if (updatedCatalogueItemField.allowed_values) {
      // Find the index of the value within the allowed_values array with the provided av_placement_id
      const valueIndex =
        updatedCatalogueItemField.allowed_values.values.findIndex(
          (val) => val.av_placement_id === av_placement_id
        );

      if (valueIndex !== -1) {
        const updatedAllowedValues: AllowedValuesList = {
          type: 'list',
          values: updatedCatalogueItemField.allowed_values.values.map(
            (val, i) => (i === valueIndex ? { ...val, value } : val)
          ),
        };

        updatedCatalogueItemField.allowed_values = updatedAllowedValues;

        if (
          String(
            catalogueItemField?.allowed_values?.values[valueIndex].value
          ) === String(catalogueItemField?.default_value)
        ) {
          updatedCatalogueItemPropertiesErrors =
            catalogueItemPropertiesErrors.filter((item) => {
              return !(
                item.errors && item.errors.fieldName === 'default_value'
              );
            });

          setCatalogueItemPropertiesErrors(
            updatedCatalogueItemPropertiesErrors
          );

          updatedCatalogueItemField.default_value = undefined;
        }

        setCatalogueItemField(updatedCatalogueItemField);

        setFormErrorMessage(undefined);

        // Remove the error when the value is changed
        const updatedAllowedValuesListErrors = allowedValuesListErrors.map(
          (error) => {
            return {
              ...error,
              errors: (error.errors || [])
                .filter((item) => item.av_placement_id !== av_placement_id)
                .filter((item) => item.errorMessage !== 'Duplicate value'),
            };
          }
        );

        setAllowedValuesListErrors(
          updatedAllowedValuesListErrors.filter(
            (item) => (item.errors?.length ?? 0) > 0
          )
        );
      }
    }
  };

  const handleDeleteListValue = (av_placement_id: string) => {
    const updatedCatalogueItemField: CatalogueCategoryPropertyMigration =
      JSON.parse(JSON.stringify(catalogueItemField));

    let updatedCatalogueItemPropertiesErrors: Omit<
      CatalogueItemPropertiesErrorsType,
      'cip_placement_id'
    >[] = JSON.parse(JSON.stringify(catalogueItemPropertiesErrors));

    if (updatedCatalogueItemField.allowed_values) {
      // Find the index of the value within the allowed_values array with the provided av_placement_id
      const valueIndex =
        updatedCatalogueItemField.allowed_values.values.findIndex(
          (val) => val.av_placement_id === av_placement_id
        );
      // Remove the value with the provided av_placement_id from the allowed_values array
      const updatedAllowedValues: AllowedValuesList = {
        type: 'list',
        values: updatedCatalogueItemField.allowed_values.values.filter(
          (val) => val.av_placement_id !== av_placement_id
        ),
      };

      updatedCatalogueItemField.allowed_values = updatedAllowedValues;
      if (
        String(catalogueItemField?.allowed_values?.values[valueIndex].value) ===
        String(catalogueItemField?.default_value)
      ) {
        updatedCatalogueItemPropertiesErrors =
          catalogueItemPropertiesErrors.filter((item) => {
            return !(item.errors && item.errors.fieldName === 'default_value');
          });

        setCatalogueItemPropertiesErrors(updatedCatalogueItemPropertiesErrors);
        updatedCatalogueItemField.default_value = undefined;
      }

      setCatalogueItemField(updatedCatalogueItemField);
      setFormErrorMessage(undefined);

      // Remove the error when the value is deleted
      const updatedAllowedValuesListErrors = allowedValuesListErrors.map(
        (error) => {
          return {
            ...error,
            errors: (error.errors || [])
              .filter((item) => item.av_placement_id !== av_placement_id)
              .filter((item) => item.errorMessage !== 'Duplicate value'),
          };
        }
      );

      setAllowedValuesListErrors(
        updatedAllowedValuesListErrors.filter(
          (item) => (item.errors?.length ?? 0) > 0
        )
      );
    }
  };

  const catalogueItemPropertyMessage = React.useCallback(
    (field: keyof CatalogueCategoryPropertyMigration) => {
      const errors = catalogueItemPropertiesErrors?.filter((item) => {
        return item.errors && item.errors.fieldName === field;
      });

      if (errors && errors.length >= 1) {
        return errors[0];
      }
    },
    [catalogueItemPropertiesErrors]
  );

  const allowedValuesListErrorMessage = React.useCallback(
    (av_placement_id: string) => {
      if (allowedValuesListErrors.length >= 1) {
        const filteredItems = allowedValuesListErrors[0]?.errors?.filter(
          (item) => {
            return item.av_placement_id === av_placement_id;
          }
        );
        if (filteredItems && filteredItems.length > 0) {
          return filteredItems[0].errorMessage;
        }
      }
      return '';
    },
    [allowedValuesListErrors]
  );

  const onChangeEditCatalogueItemField = (
    catalogueItemField: CatalogueCategoryPropertyMigration
  ) => {
    setCatalogueItemField(catalogueItemField);
    setSteps(STEPS_EDIT);
  };

  const validateAllowedValuesList = (
    property: CatalogueCategoryPropertyMigration
  ): boolean => {
    let hasErrors = false;

    if (property.allowed_values?.type === 'list') {
      const trimmedLowerCaseValues = property.allowed_values.values.map(
        (val) => ({
          av_placement_id: val.av_placement_id,
          value: String(val.value).trim().toLowerCase(),
        })
      );
      const duplicateIds: string[] = [];
      const invalidNumberIds: string[] = [];
      const missingValueIds: string[] = [];

      trimmedLowerCaseValues.forEach((value, i) => {
        for (let j = i + 1; j < trimmedLowerCaseValues.length; j++) {
          if (value.value === trimmedLowerCaseValues[j].value && value.value) {
            duplicateIds.push(
              value.av_placement_id,
              trimmedLowerCaseValues[j].av_placement_id
            );
          }
        }

        if (!value.value) {
          missingValueIds.push(value.av_placement_id);
        } else if (
          property.type === 'number' &&
          (isNaN(+value.value) || !value.value)
        ) {
          invalidNumberIds.push(value.av_placement_id);
        }
      });

      if (
        // If there are more than 2 instances of the same duplicate value, it adds the ID multiple times.
        // The set removes the repeated IDs.
        Array.from(new Set(duplicateIds)).length > 0 ||
        invalidNumberIds.length > 0 ||
        missingValueIds.length > 0
      ) {
        // Update listItemErrors state with the error IDs
        // The useState below is order-dependent since the duplicate error could occur simultaneously with the errors above.
        // The error above should be displayed first.

        setAllowedValuesListErrors((prev) => [
          ...prev,
          {
            errors: [
              ...(prev[0]?.errors || []),
              ...invalidNumberIds.map((id) => ({
                av_placement_id: id,
                errorMessage: 'Please enter a valid number',
              })),
              ...missingValueIds.map((id) => ({
                av_placement_id: id,
                errorMessage: 'Please enter a value',
              })),
              ...Array.from(new Set(duplicateIds)).map((id) => ({
                av_placement_id: id,
                errorMessage: 'Duplicate value',
              })),
            ],
          },
        ]);

        hasErrors = true;
      }
    }

    return hasErrors;
  };

  const validateProperty = React.useCallback(() => {
    let hasErrors = false;

    const propertyNames =
      selectedCatalogueCategory.catalogue_item_properties?.map((property) =>
        property.name.trim().toLowerCase()
      );

    const selectedProperty =
      selectedCatalogueCategory.catalogue_item_properties?.find(
        (property) => property.id === catalogueItemField?.id
      );

    if (catalogueItemField) {
      if (!catalogueItemField.name.trim()) {
        setCatalogueItemPropertiesErrors((prev) => [
          ...prev,
          {
            errors: {
              fieldName: 'name',
              errorMessage: 'Please enter a property name',
            },
          },
        ]);
        hasErrors = true;
      }

      if (
        propertyNames?.includes(catalogueItemField.name.trim().toLowerCase()) &&
        selectedProperty?.name.trim().toLowerCase() !==
          catalogueItemField.name.trim().toLowerCase()
      ) {
        setCatalogueItemPropertiesErrors((prev) => [
          ...prev,
          {
            errors: {
              fieldName: 'name',
              errorMessage: 'Duplicate property name. Please change the name',
            },
          },
        ]);
        hasErrors = true;
      }

      if (!catalogueItemField.type.trim()) {
        setCatalogueItemPropertiesErrors((prev) => [
          ...prev,
          {
            errors: {
              fieldName: 'type',
              errorMessage: 'Please select a type',
            },
          },
        ]);

        hasErrors = true;
      }

      if (catalogueItemField.allowed_values?.values.length === 0) {
        setCatalogueItemPropertiesErrors((prev) => [
          ...prev,
          {
            errors: {
              fieldName: 'allowed_values',
              errorMessage: 'Please create a valid list item',
            },
          },
        ]);

        hasErrors = true;
      }

      if (
        !catalogueItemField.default_value &&
        catalogueItemField.mandatory &&
        propertyMigrationType === 'add'
      ) {
        setCatalogueItemPropertiesErrors((prev) => [
          ...prev,
          {
            errors: {
              fieldName: 'default_value',
              errorMessage: 'Please enter a default value',
            },
          },
        ]);

        hasErrors = true;
      }

      if (
        catalogueItemField.default_value &&
        catalogueItemField.type === 'number' &&
        isNaN(+catalogueItemField.default_value) &&
        propertyMigrationType === 'add'
      ) {
        setCatalogueItemPropertiesErrors((prev) => [
          ...prev,
          {
            errors: {
              fieldName: 'default_value',
              errorMessage: 'Please enter a valid number',
            },
          },
        ]);

        hasErrors = true;
      }

      const hasAllowedValuesListErrors =
        validateAllowedValuesList(catalogueItemField);

      if (hasAllowedValuesListErrors) {
        hasErrors = true;
      }
    }
    return hasErrors;
  }, [
    catalogueItemField,
    propertyMigrationType,
    selectedCatalogueCategory.catalogue_item_properties,
  ]);
  const handleAddProperty = React.useCallback(() => {
    if (catalogueItemField && propertyMigrationType === 'add') {
      const hasErrors = validateProperty();

      const property: CatalogueCategoryPropertyMigration = {
        id: catalogueItemField.id,
        name: catalogueItemField.name,
        type: catalogueItemField.type,
        mandatory: catalogueItemField.mandatory,
      };

      if (hasErrors) {
        return;
      }

      const allowedValuesList = catalogueItemField?.allowed_values?.values.map(
        (val) => val.value
      );

      const convertedValues = convertListToNumbers(allowedValuesList || []);
      if (catalogueItemField.allowed_values) {
        property.allowed_values = {
          type: 'list',
          values:
            catalogueItemField?.type === 'number'
              ? convertedValues
              : allowedValuesList ?? [],
        };
      }

      if (catalogueItemField.default_value) {
        if (catalogueItemField.type === 'number') {
          property.default_value = Number(catalogueItemField.default_value);
        } else if (catalogueItemField.type === 'boolean') {
          property.default_value = catalogueItemField.default_value === 'true';
        } else {
          property.default_value = catalogueItemField.default_value;
        }
      }

      if (catalogueItemField.unit_id) {
        property.unit_id = catalogueItemField.unit_id;
      }

      addCatalogueCategoryProperty({
        catalogueCategory: selectedCatalogueCategory,
        property: property,
      });
      handleClose();
    }
  }, [
    addCatalogueCategoryProperty,
    catalogueItemField,
    handleClose,
    propertyMigrationType,
    selectedCatalogueCategory,
    validateProperty,
  ]);

  const handleEditProperty = React.useCallback(() => {
    if (
      catalogueItemField &&
      catalogueItemField.id &&
      propertyMigrationType === 'edit'
    ) {
      const hasErrors = validateProperty();

      if (hasErrors) {
        return;
      }

      const initialPropertyDetails =
        selectedCatalogueCategory.catalogue_item_properties?.find(
          (property) => property.id === catalogueItemField.id
        );

      const property: Partial<CatalogueCategoryPropertyMigration> = {
        id: catalogueItemField.id,
      };

      const isNameUpdated =
        catalogueItemField.name !== initialPropertyDetails?.name;

      isNameUpdated && (property.name = catalogueItemField.name);

      let isAllowedValuesUpdated = false;

      if (catalogueItemField.allowed_values) {
        const allowedValuesList = catalogueItemField.allowed_values.values.map(
          (val) => val.value
        );
        const convertedValues = convertListToNumbers(allowedValuesList || []);
        const allowedValues: AllowedValues = {
          type: 'list',
          values:
            catalogueItemField.type === 'number'
              ? convertedValues
              : allowedValuesList ?? [],
        };

        isAllowedValuesUpdated =
          JSON.stringify(initialPropertyDetails?.allowed_values?.values) !==
          JSON.stringify(allowedValues.values);

        isAllowedValuesUpdated && (property.allowed_values = allowedValues);
      }

      if (isNameUpdated || isAllowedValuesUpdated) {
        editCatalogueCategoryProperty({
          catalogueCategory: selectedCatalogueCategory,
          property: property,
        });
        handleClose();
      } else
        setFormErrorMessage('Please edit a form entry before clicking save');
    }
  }, [
    catalogueItemField,
    editCatalogueCategoryProperty,
    handleClose,
    propertyMigrationType,
    selectedCatalogueCategory,
    validateProperty,
  ]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <FormControl sx={{ textAlign: 'center', margin: 1 }} fullWidth>
              <InputLabel id={'select-edit-or-add'}>
                Select Edit to edit an existing property or select Add to add a
                new property
              </InputLabel>
              <Select
                labelId={'select-edit-or-add'}
                value={propertyMigrationType ?? ''}
                onChange={(e) => {
                  setPropertyMigrationType(
                    e.target.value === 'edit' ? 'edit' : 'add'
                  );

                  setSteps(
                    e.target.value === 'edit'
                      ? [STEPS_EDIT[0], STEPS_EDIT[1]]
                      : STEPS_ADD
                  );
                  setCatalogueItemField(
                    e.target.value === 'edit'
                      ? undefined
                      : getEmptyCatalogueItemField()
                  );
                  setAllowedValuesListErrors([]);
                  setCatalogueItemPropertiesErrors([]);
                }}
                label="Select Edit to edit an existing property or select Add to add a new property"
              >
                <MenuItem value={'edit'}>Edit</MenuItem>
                <MenuItem value={'add'}>Add</MenuItem>
              </Select>
            </FormControl>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                width: '100%',
                margin: 1,
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <WarningIcon
                sx={{
                  marginRight: 2,
                  fontSize: '50px',
                  color: 'warning.main',
                }}
              />
              <Typography variant="body1">
                This action will modify all existing catalogue items and items
                within this catalogue category. Please proceed with caution.
              </Typography>
            </Paper>
          </Box>
        );
      case 1:
        return (
          <Grid item container my={2} xs={12}>
            {updatedSelectedCatalogueCategory.catalogue_item_properties && (
              <CataloguePropertiesForm
                isDisabled={true}
                formFields={
                  updatedSelectedCatalogueCategory.catalogue_item_properties
                }
                onChangeEditCatalogueItemField={
                  propertyMigrationType === 'edit'
                    ? onChangeEditCatalogueItemField
                    : undefined
                }
                selectedCatalogueItemField={
                  propertyMigrationType === 'edit'
                    ? catalogueItemField
                    : undefined
                }
              />
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid item xs={12}>
            {catalogueItemField && (
              <CataloguePropertyForm
                type={
                  propertyMigrationType === 'edit'
                    ? 'edit migration'
                    : 'add migration'
                }
                isList={false}
                catalogueItemField={catalogueItemField}
                handleChange={handleChange}
                handleAddListValue={handleAddListValue}
                handleChangeListValues={handleChangeListValues}
                handleDeleteListValue={handleDeleteListValue}
                catalogueItemPropertyMessage={catalogueItemPropertyMessage}
                allowedValuesListErrorMessage={allowedValuesListErrorMessage}
                currentCatalogueItemField={
                  propertyMigrationType === 'edit'
                    ? updatedCatalogueItemProperties?.find(
                        (property) => property.id === catalogueItemField.id
                      )
                    : undefined
                }
              />
            )}
          </Grid>
        );
    }
  };
  return (
    <Dialog
      PaperProps={{ sx: { height: '850px' } }}
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Edit Catalogue Item properties</DialogTitle>
      <DialogContent>
        <Stepper
          nonLinear
          activeStep={activeStep}
          orientation="horizontal"
          sx={{ marginTop: 2 }}
        >
          {steps.map((label, index) => {
            const labelProps: {
              optional?: React.ReactNode;
              error?: boolean;
            } = {};

            if (isStepFailed(index)) {
              labelProps.optional = (
                <Typography variant="caption" color="error">
                  {index === 2 && 'Invalid catalogue item property'}
                </Typography>
              );
              labelProps.error = true;
            }
            return (
              <Step sx={{ cursor: 'pointer' }} key={label}>
                <StepLabel
                  {...labelProps}
                  onClick={() => {
                    setActiveStep(index);
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Box sx={{ marginTop: 2 }}>{renderStepContent(activeStep)}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ mr: 'auto' }}>
          Cancel
        </Button>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>

        {activeStep === STEPS_ADD.length - 1 ? (
          <Button
            disabled={
              catalogueItemPropertiesErrors.length !== 0 ||
              allowedValuesListErrors.length !== 0
            }
            onClick={
              propertyMigrationType === 'add'
                ? handleAddProperty
                : handleEditProperty
            }
            sx={{ mr: 3 }}
          >
            Finish
          </Button>
        ) : (
          <Button
            disabled={
              (activeStep === 0 && propertyMigrationType === null) ||
              (activeStep === 1 &&
                propertyMigrationType === 'edit' &&
                !catalogueItemField)
            }
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </DialogActions>
      <Box
        sx={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {formErrorMessage && (
          <FormHelperText
            sx={{ marginBottom: '16px', textAlign: 'center' }}
            error
          >
            {formErrorMessage}
          </FormHelperText>
        )}
      </Box>
    </Dialog>
  );
}
CatalogueItemPropertiesMigrationDialog.displayName =
  'CatalogueItemPropertiesMigrationDialog';

export default CatalogueItemPropertiesMigrationDialog;
