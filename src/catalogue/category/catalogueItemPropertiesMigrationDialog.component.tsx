import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  AddCatalogueCategoryWithPlacementIds,
  AllowedValuesList,
  AllowedValuesListErrorsType,
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueCategoryFormDataWithPlacementIds,
  CatalogueItemPropertiesErrorsType,
} from '../../app.types';
import CataloguePropertiesForm from './cataloguePropertiesForm.component';
import { generateUniqueId } from '../../utils';
import CataloguePropertyForm from './cataloguePropertyForm.component';

const getEmptyCatalogueItemField =
  (): CatalogueCategoryFormDataWithPlacementIds => {
    return {
      cip_placement_id: '',
      name: '',
      type: '',
      mandatory: false,
    } as CatalogueCategoryFormDataWithPlacementIds;
  };
export interface CatalogueItemPropertiesMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCatalogueCategory: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
}

function CatalogueItemPropertiesMigrationDialog(
  props: CatalogueItemPropertiesMigrationDialogProps
) {
  const {
    open,
    onClose,
    selectedCatalogueCategory,
    resetSelectedCatalogueCategory,
  } = props;

  const [formError, setFormError] = React.useState(false);
  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  // State to manage list item errors
  const [allowedValuesListErrors, setAllowedValuesListErrors] = React.useState<
    AllowedValuesListErrorsType[]
  >([]);

  const [catalogueItemPropertiesErrors, setCatalogueItemPropertiesErrors] =
    React.useState<CatalogueItemPropertiesErrorsType[]>([]);

  const handleClose = React.useCallback(() => {
    setActiveStep(0);
    setAllowedValuesListErrors([]);
    setCatalogueItemPropertiesErrors([]);
    setFormError(false);
    setFormErrorMessage(undefined);
    onClose();
    resetSelectedCatalogueCategory();
  }, [onClose, resetSelectedCatalogueCategory]);

  const updatedCatalogueItemProperties =
    selectedCatalogueCategory.catalogue_item_properties?.map((item) => {
      // Transform allowed_values to an array of objects with id and value keys
      const allowedValuesWithId = item.allowed_values?.values.map((value) => ({
        av_placement_id: generateUniqueId('av_placement_id_'), // Allowed values (av)
        value: value,
      })) || [
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
    }) || undefined;

  const updatedSelectedCatalogueCategory: AddCatalogueCategoryWithPlacementIds =
    {
      ...selectedCatalogueCategory,
      catalogue_item_properties: updatedCatalogueItemProperties,
    };

  // Stepper
  const STEPS = [
    "Click 'edit' on the respective property to edit it, or click the add icon to add a new property",
    'Modify catalogue item property',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [steps, setSteps] = React.useState<string[]>([STEPS[0]]);

  const [catalogueItemField, setCatalogueItemField] = React.useState<
    CatalogueCategoryFormDataWithPlacementIds | undefined
  >(undefined);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepFailed = React.useCallback((step: number) => {
    switch (step) {
      case 0:
        return false;
      case 1:
        return false;
    }
  }, []);

  const handleChange = (
    cip_placement_id: string,
    field: keyof CatalogueCategoryFormData,
    value: string | boolean | number | null
  ) => {
    if (catalogueItemField?.cip_placement_id !== cip_placement_id) return;

    let updatedCatalogueItemField = { ...catalogueItemField };

    if (
      field === 'type' &&
      (value === 'boolean' || value === 'number' || value === 'string')
    ) {
      updatedCatalogueItemField.type = value;
    } else if (field === 'name' && typeof value == 'string') {
      updatedCatalogueItemField.name = value;
    } else if (field === 'allowed_values') {
      if (value !== 'list') {
        delete updatedCatalogueItemField.allowed_values;
      } else {
        updatedCatalogueItemField = {
          ...updatedCatalogueItemField,
          allowed_values: { type: 'list', values: [] },
        };
      }
    } else {
      (updatedCatalogueItemField[field] as boolean | string | number | null) =
        value;
    }

    setCatalogueItemField(updatedCatalogueItemField);
  };

  const handleAddListValue = (cip_placement_id: string) => {
    if (catalogueItemField?.cip_placement_id !== cip_placement_id) return;
    let updatedCatalogueItemField = { ...catalogueItemField };

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

    updatedCatalogueItemField = {
      ...updatedCatalogueItemField,
      allowed_values: updatedAllowedValues,
    };

    setCatalogueItemField(updatedCatalogueItemField);
  };

  const handleChangeListValues = (
    cip_placement_id: string,
    av_placement_id: string,
    value: string
  ) => {
    if (catalogueItemField?.cip_placement_id !== cip_placement_id) return;
    let updatedCatalogueItemField = { ...catalogueItemField };

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

        updatedCatalogueItemField = {
          ...updatedCatalogueItemField,
          allowed_values: updatedAllowedValues,
        };

        setCatalogueItemField(updatedCatalogueItemField);
      }
    }
  };

  const handleDeleteListValue = (
    cip_placement_id: string,
    av_placement_id: string
  ) => {
    if (catalogueItemField?.cip_placement_id !== cip_placement_id) return;
    let updatedCatalogueItemField = { ...catalogueItemField };

    if (updatedCatalogueItemField.allowed_values) {
      // Remove the value with the provided av_placement_id from the allowed_values array
      const updatedAllowedValues: AllowedValuesList = {
        type: 'list',
        values: updatedCatalogueItemField.allowed_values.values.filter(
          (val) => val.av_placement_id !== av_placement_id
        ),
      };

      updatedCatalogueItemField = {
        ...updatedCatalogueItemField,
        allowed_values: updatedAllowedValues,
      };

      setCatalogueItemField(updatedCatalogueItemField);
    }
  };

  const catalogueItemPropertyMessage = React.useCallback(
    (
      cip_placement_id: string,
      column: 'name' | 'type' | 'unit' | 'mandatory' | 'list' | 'default'
    ) => {
      const errors = catalogueItemPropertiesErrors?.filter((item) => {
        return (
          item.cip_placement_id === cip_placement_id &&
          item.errors &&
          item.errors.fieldName === column
        );
      });

      if (errors && errors.length >= 1) {
        return errors[0];
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

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            {updatedSelectedCatalogueCategory.catalogue_item_properties && (
              <CataloguePropertiesForm
                type="edit properties"
                formFields={
                  updatedSelectedCatalogueCategory.catalogue_item_properties
                }
                onChangeAddCatalogueItemField={() => {
                  handleNext();
                  setCatalogueItemField(getEmptyCatalogueItemField());
                  setSteps(STEPS);
                }}
                onChangeEditCatalogueItemField={(catalogueItemField) => {
                  handleNext();
                  setCatalogueItemField(catalogueItemField);
                  setSteps(STEPS);
                }}
              />
            )}
          </Grid>
        );
      case 1:
        return (
          <Grid item xs={12}>
            {catalogueItemField && (
              <CataloguePropertyForm
                type="property migration"
                isList={false}
                index={0}
                catalogueItemField={catalogueItemField}
                handleChange={handleChange}
                handleAddListValue={handleAddListValue}
                handleChangeListValues={handleChangeListValues}
                handleDeleteListValue={handleDeleteListValue}
                catalogueItemPropertyMessage={catalogueItemPropertyMessage}
                allowedValuesListErrorMessage={allowedValuesListErrorMessage}
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
                  {index === 1 && 'Invalid catalogue item properties'}
                  {index === 0 && 'Invalid details'}
                </Typography>
              );
              labelProps.error = true;
            }
            return (
              <Step sx={{ cursor: 'pointer' }} key={label}>
                <StepLabel {...labelProps} onClick={() => setActiveStep(index)}>
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

        {activeStep === STEPS.length - 1 && (
          <Button
            disabled={false}
            // onClick={

            // }
            sx={{ mr: 3 }}
          >
            Finish
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
        {formError && (
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
