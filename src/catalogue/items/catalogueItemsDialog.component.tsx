import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
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
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import {
  useAddCatalogueItem,
  useEditCatalogueItem,
} from '../../api/catalogueItems';
import {
  AddCatalogueItem,
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueDetailsErrorMessages,
  CatalogueItem,
  CatalogueItemDetailsPlaceholder,
  EditCatalogueItem,
  ErrorParsing,
  Manufacturer,
} from '../../app.types';
import { matchCatalogueItemProperties } from '../catalogue.component';
import { Autocomplete } from '@mui/material';
import { useManufacturers } from '../../api/manufacturers';
import ManufacturerDialog from '../../manufacturer/manufacturerDialog.component';
import handleIMS_APIError from '../../handleIMS_APIError';
import {
  addValueToFrontOfList,
  sortDataList,
  trimStringValues,
} from '../../utils';

export interface CatalogueItemsDialogProps {
  open: boolean;
  onClose: () => void;
  parentInfo: CatalogueCategory | undefined;
  selectedCatalogueItem?: CatalogueItem;
  type: 'edit' | 'create' | 'save as';
}

function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
      parsedUrl.hostname.includes('.') // Checks for the typical top-level domain
    );
  } catch (_error) {
    return false;
  }
}

const isValidNumber = (input: string): boolean => {
  const numberValue = Number(input);
  return !isNaN(numberValue) && input.trim() !== '';
};

function CatalogueItemsDialog(props: CatalogueItemsDialogProps) {
  const { open, onClose, parentInfo, selectedCatalogueItem, type } = props;
  const parentId = parentInfo?.id ?? null;
  const parentCatalogueItemPropertiesInfo = React.useMemo(
    () => parentInfo?.catalogue_item_properties ?? [],
    [parentInfo]
  );

  const [catalogueItemDetails, setCatalogueItemDetails] =
    React.useState<CatalogueItemDetailsPlaceholder>({
      catalogue_category_id: null,
      name: '',
      description: null,
      cost_gbp: null,
      cost_to_rework_gbp: null,
      days_to_replace: null,
      days_to_rework: null,
      drawing_number: null,
      drawing_link: null,
      item_model_number: null,
      is_obsolete: null,
      obsolete_replacement_catalogue_item_id: null,
      obsolete_reason: null,
      manufacturer_id: null,
      notes: null,
    });

  const [propertyValues, setPropertyValues] = React.useState<(string | null)[]>(
    []
  );

  const [formError, setFormError] = React.useState(false);
  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const [propertyErrors, setPropertyErrors] = React.useState(
    new Array(parentCatalogueItemPropertiesInfo.length).fill(false)
  );
  // set the errors as the types into the input fields

  const [errorMessages, setErrorMessages] = React.useState<
    Partial<CatalogueDetailsErrorMessages>
  >({});

  const handleClose = React.useCallback(() => {
    setCatalogueItemDetails({
      catalogue_category_id: null,
      name: null,
      description: null,
      cost_gbp: null,
      cost_to_rework_gbp: null,
      days_to_replace: null,
      days_to_rework: null,
      drawing_number: null,
      drawing_link: null,
      item_model_number: null,
      is_obsolete: 'false',
      obsolete_replacement_catalogue_item_id: null,
      obsolete_reason: null,
      manufacturer_id: null,
      notes: null,
    });

    setActiveStep(0);
    setPropertyValues([]);
    setPropertyErrors(
      new Array(parentCatalogueItemPropertiesInfo.length).fill(false)
    );
    setErrorMessages({});
    setFormError(false);
    setFormErrorMessage(undefined);
    onClose();
  }, [
    parentCatalogueItemPropertiesInfo.length,
    setCatalogueItemDetails,
    setPropertyValues,
    onClose,
  ]);

  React.useEffect(() => {
    if (selectedCatalogueItem) {
      setCatalogueItemDetails({
        catalogue_category_id: selectedCatalogueItem.catalogue_category_id,
        name: selectedCatalogueItem.name,
        description: selectedCatalogueItem.description,
        cost_gbp: String(selectedCatalogueItem.cost_gbp),
        cost_to_rework_gbp: selectedCatalogueItem.cost_to_rework_gbp
          ? String(selectedCatalogueItem.cost_to_rework_gbp)
          : null,
        days_to_replace: String(selectedCatalogueItem.days_to_replace),
        days_to_rework: selectedCatalogueItem.days_to_rework
          ? String(selectedCatalogueItem.days_to_rework)
          : null,
        drawing_number: selectedCatalogueItem.drawing_number,
        drawing_link: selectedCatalogueItem.drawing_link,
        item_model_number: selectedCatalogueItem.item_model_number,
        is_obsolete: String(selectedCatalogueItem.is_obsolete),
        obsolete_replacement_catalogue_item_id:
          selectedCatalogueItem.obsolete_replacement_catalogue_item_id,
        obsolete_reason: selectedCatalogueItem.obsolete_reason,
        manufacturer_id: selectedCatalogueItem.manufacturer_id,
        notes: selectedCatalogueItem.notes,
      });
      setPropertyValues(
        matchCatalogueItemProperties(
          parentCatalogueItemPropertiesInfo,
          selectedCatalogueItem.properties ?? []
        )
      );
    }
  }, [parentCatalogueItemPropertiesInfo, selectedCatalogueItem, open]);

  const handlePropertyChange = (index: number, value: string | null) => {
    const updatedPropertyValues = [...propertyValues];
    if (value === null || (typeof value === 'string' && value.trim() === '')) {
      updatedPropertyValues[index] = null;
    } else {
      updatedPropertyValues[index] = value;
    }
    setPropertyValues(updatedPropertyValues);
    // Clear the error state for the changed property
    const updatedPropertyErrors = [...propertyErrors];
    updatedPropertyErrors[index] = false;
    setPropertyErrors(updatedPropertyErrors);
    setFormError(false);
    setFormErrorMessage(undefined);
  };

  const { mutateAsync: addCatalogueItem, isPending: isAddPending } =
    useAddCatalogueItem();
  const { mutateAsync: editCatalogueItem, isPending: isEditPending } =
    useEditCatalogueItem();

  const { data: manufacturerList } = useManufacturers();
  const selectedCatalogueItemManufacturer =
    manufacturerList?.find(
      (manufacturer) =>
        manufacturer.id === selectedCatalogueItem?.manufacturer_id
    ) || null;
  const [selectedManufacturer, setSelectedManufacturer] =
    React.useState<Manufacturer | null>(null);

  const [inputValue, setInputValue] = React.useState<string | null>(
    selectedManufacturer?.name ?? null
  );

  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const handleDetailsFormErrorStates = React.useCallback(() => {
    let hasDetailsErrors = false;

    if (
      !catalogueItemDetails.days_to_replace ||
      catalogueItemDetails.days_to_replace.trim() === ''
    ) {
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        days_to_replace: 'Please enter how many days it would take to replace',
      }));
      hasDetailsErrors = true;
    } else {
      if (!isValidNumber(catalogueItemDetails.days_to_replace)) {
        setErrorMessages((prevErrorMessages) => ({
          ...prevErrorMessages,
          days_to_replace: 'Please enter a valid number',
        }));
        hasDetailsErrors = true;
      }
    }

    // Check the catalogue item Name is defined
    if (!catalogueItemDetails.name || catalogueItemDetails.name.trim() === '') {
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        name: 'Please enter a name',
      }));
      hasDetailsErrors = true;
    }
    // Check the catalogue item cost is not falsy and is a valid number

    if (
      !catalogueItemDetails.cost_gbp ||
      catalogueItemDetails.cost_gbp.trim() === ''
    ) {
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        cost_gbp: 'Please enter a cost',
      }));
      hasDetailsErrors = true;
    } else {
      if (!isValidNumber(catalogueItemDetails.cost_gbp)) {
        setErrorMessages((prevErrorMessages) => ({
          ...prevErrorMessages,
          cost_gbp: 'Please enter a valid number',
        }));
        hasDetailsErrors = true;
      }
    }

    // Check the catalogue item cost to rework is a valid number

    if (
      catalogueItemDetails.cost_to_rework_gbp !== null &&
      catalogueItemDetails.cost_to_rework_gbp !== ''
    ) {
      if (!isValidNumber(catalogueItemDetails.cost_to_rework_gbp)) {
        setErrorMessages((prevErrorMessages) => ({
          ...prevErrorMessages,
          cost_to_rework_gbp: 'Please enter a valid number',
        }));
        hasDetailsErrors = true;
      }
    }

    // Check the catalogue item days to rework is a valid number

    if (
      catalogueItemDetails.days_to_rework !== null &&
      catalogueItemDetails.days_to_rework !== ''
    ) {
      if (!isValidNumber(catalogueItemDetails.days_to_rework)) {
        setErrorMessages((prevErrorMessages) => ({
          ...prevErrorMessages,
          days_to_rework: 'Please enter a valid number',
        }));
        hasDetailsErrors = true;
      }
    }

    // Check the catalogue item drawing Link is valid

    if (
      catalogueItemDetails.drawing_link !== null &&
      !isValidUrl(catalogueItemDetails.drawing_link)
    ) {
      if (catalogueItemDetails.drawing_link.trim()) {
        setErrorMessages((prevErrorMessages) => ({
          ...prevErrorMessages,
          drawing_link:
            'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted',
        }));
        hasDetailsErrors = true;
      }
    }
    // Check Manufacturer
    if (
      selectedManufacturer === null &&
      catalogueItemDetails.manufacturer_id === null
    ) {
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        manufacturer_id:
          'Please choose a manufacturer, or add a new manufacturer',
      }));
      hasDetailsErrors = true;
    }

    return { hasDetailsErrors };
  }, [catalogueItemDetails, selectedManufacturer]);

  const handlePropertiesFormErrorStates = React.useCallback(() => {
    let hasPropertiesErrors = false;

    // Check properties
    const updatedPropertyErrors = [...propertyErrors];

    const updatedProperties = parentCatalogueItemPropertiesInfo.map(
      (property, index) => {
        if (property.mandatory && !propertyValues[index]) {
          updatedPropertyErrors[index] = true;
          hasPropertiesErrors = true;
        } else {
          updatedPropertyErrors[index] = false;
        }

        if (
          propertyValues[index] &&
          property.type === 'number' &&
          isNaN(Number(propertyValues[index]))
        ) {
          updatedPropertyErrors[index] = true;
          hasPropertiesErrors = true;
        }

        if (!propertyValues[index])
          return {
            name: property.name,
            value: null,
          };

        let typedValue: string | number | boolean | null =
          propertyValues[index]; // Assume it's a string by default

        // Check if the type of the 'property' is boolean
        if (property.type === 'boolean') {
          // If the type is boolean, then check the type of 'propertyValues[index]'
          typedValue = propertyValues[index] === 'true' ? true : false;
        } else if (property.type === 'number') {
          typedValue = Number(propertyValues[index]);
        }

        return {
          name: property.name,
          value: typedValue,
        };
      }
    );

    setPropertyErrors(updatedPropertyErrors);

    return { hasPropertiesErrors, updatedProperties };
  }, [propertyErrors, parentCatalogueItemPropertiesInfo, propertyValues]);
  const details = React.useMemo(
    () => ({
      catalogue_category_id: parentId ?? '',
      name: catalogueItemDetails.name ?? '',
      cost_gbp: catalogueItemDetails.cost_gbp
        ? Number(catalogueItemDetails.cost_gbp)
        : 0,
      cost_to_rework_gbp:
        catalogueItemDetails.cost_to_rework_gbp === null
          ? null
          : Number(catalogueItemDetails.cost_to_rework_gbp),
      days_to_replace: catalogueItemDetails.days_to_replace
        ? Number(catalogueItemDetails.days_to_replace)
        : 0,
      days_to_rework:
        catalogueItemDetails.days_to_rework === null
          ? null
          : Number(catalogueItemDetails.days_to_rework),
      description: catalogueItemDetails.description,
      item_model_number: catalogueItemDetails.item_model_number,
      is_obsolete: false,
      obsolete_reason: catalogueItemDetails.obsolete_reason,
      obsolete_replacement_catalogue_item_id:
        catalogueItemDetails.obsolete_replacement_catalogue_item_id,
      drawing_link: catalogueItemDetails.drawing_link,
      drawing_number: catalogueItemDetails.drawing_number,
      manufacturer_id: catalogueItemDetails.manufacturer_id ?? '',
      notes: catalogueItemDetails.notes,
    }),
    [catalogueItemDetails, parentId]
  );
  const handleAddCatalogueItem = React.useCallback(() => {
    const { updatedProperties, hasPropertiesErrors } =
      handlePropertiesFormErrorStates();
    const { hasDetailsErrors } = handleDetailsFormErrorStates();

    if (hasPropertiesErrors || hasDetailsErrors) return;

    const catalogueItem: AddCatalogueItem = {
      ...details,
      properties: updatedProperties,
      name: details.name,
    };

    addCatalogueItem(trimStringValues(catalogueItem))
      .then(() => handleClose())
      .catch((error: AxiosError) => {
        handleIMS_APIError(error);
      });
  }, [
    handlePropertiesFormErrorStates,
    handleDetailsFormErrorStates,
    details,
    addCatalogueItem,
    handleClose,
  ]);

  const handleEditCatalogueItem = React.useCallback(() => {
    if (selectedCatalogueItem) {
      const { updatedProperties, hasPropertiesErrors } =
        handlePropertiesFormErrorStates();
      const { hasDetailsErrors } = handleDetailsFormErrorStates();

      if (hasPropertiesErrors || hasDetailsErrors) return;

      const isNameUpdated = details.name !== selectedCatalogueItem.name;

      const isDescriptionUpdated =
        details.description !== selectedCatalogueItem.description;

      const isCostGbpUpdated =
        details.cost_gbp !== selectedCatalogueItem.cost_gbp;

      const isCostToReworkGbpUpdated =
        details.cost_to_rework_gbp !== selectedCatalogueItem.cost_to_rework_gbp;

      const isDaysToReplaceUpdated =
        details.days_to_replace !== selectedCatalogueItem.days_to_replace;

      const isDaysToReworkUpdated =
        details.days_to_rework !== selectedCatalogueItem.days_to_rework;

      const isDrawingNumberUpdated =
        details.drawing_number !== selectedCatalogueItem.drawing_number;

      const isDrawingLinkUpdated =
        details.drawing_link !== selectedCatalogueItem.drawing_link;

      const isModelNumberUpdated =
        details.item_model_number !== selectedCatalogueItem.item_model_number;

      const isCatalogueItemPropertiesUpdated =
        JSON.stringify(updatedProperties) !==
        JSON.stringify(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          selectedCatalogueItem.properties.map(({ unit, ...rest }) => rest)
        );

      const isManufacturerUpdated =
        JSON.stringify(details.manufacturer_id) !==
        JSON.stringify(selectedCatalogueItem.manufacturer_id);
      const catalogueItem: EditCatalogueItem = {
        id: selectedCatalogueItem.id,
      };

      const isNotesUpdated = details.notes !== selectedCatalogueItem.notes;

      isNameUpdated && (catalogueItem.name = details.name);
      isDescriptionUpdated && (catalogueItem.description = details.description);
      isCostGbpUpdated && (catalogueItem.cost_gbp = details.cost_gbp);
      isCostToReworkGbpUpdated &&
        (catalogueItem.cost_to_rework_gbp = details.cost_to_rework_gbp);
      isDaysToReplaceUpdated &&
        (catalogueItem.days_to_replace = details.days_to_replace);
      isDaysToReworkUpdated &&
        (catalogueItem.days_to_rework = details.days_to_rework);
      isDrawingNumberUpdated &&
        (catalogueItem.drawing_number = details.drawing_number);
      isDrawingLinkUpdated &&
        (catalogueItem.drawing_link = details.drawing_link);
      isModelNumberUpdated &&
        (catalogueItem.item_model_number = details.item_model_number);
      isCatalogueItemPropertiesUpdated &&
        (catalogueItem.properties = updatedProperties);
      isManufacturerUpdated &&
        (catalogueItem.manufacturer_id = details.manufacturer_id);
      isNotesUpdated && (catalogueItem.notes = details.notes);

      if (
        catalogueItem.id &&
        (isNameUpdated ||
          isDescriptionUpdated ||
          isCostGbpUpdated ||
          isCostToReworkGbpUpdated ||
          isDaysToReplaceUpdated ||
          isDaysToReworkUpdated ||
          isDrawingNumberUpdated ||
          isDrawingLinkUpdated ||
          isModelNumberUpdated ||
          isCatalogueItemPropertiesUpdated ||
          isManufacturerUpdated ||
          isNotesUpdated)
      ) {
        editCatalogueItem(trimStringValues(catalogueItem))
          .then(() => handleClose())
          .catch((error: AxiosError) => {
            const response = error.response?.data as ErrorParsing;

            if (response && error.response?.status === 409) {
              if (response.detail.includes('child elements')) {
                setFormError(true);
                setFormErrorMessage(response.detail);
              }
              return;
            }
            handleIMS_APIError(error);
          });
      } else {
        setFormError(true);
        setFormErrorMessage('Please edit a form entry before clicking save');
      }
    }
  }, [
    selectedCatalogueItem,
    handlePropertiesFormErrorStates,
    handleDetailsFormErrorStates,
    details,
    editCatalogueItem,
    handleClose,
  ]);

  const handleCatalogueDetails = (
    field: keyof CatalogueDetailsErrorMessages,
    value: string | null
  ) => {
    const updatedDetails = { ...catalogueItemDetails };

    setErrorMessages({ ...errorMessages, [field]: undefined });
    setFormError(false);
    setFormErrorMessage(undefined);

    if (value?.trim() === '') {
      updatedDetails[field] = null;
    } else {
      updatedDetails[field] = value as string;
    }

    setCatalogueItemDetails(updatedDetails);
  };

  // Stepper
  const STEPS = [
    (type === 'edit' ? 'Edit' : 'Add') + ' catalogue item details',
    (type === 'edit' ? 'Edit' : 'Add') + ' catalogue item properties',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handleNext = (activeStep: number) => {
    if (activeStep === 0) {
      const { hasDetailsErrors } = handleDetailsFormErrorStates();
      if (hasDetailsErrors) return; // Do not proceed with next if there are errors
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return JSON.stringify(errorMessages) !== '{}';
        case 1:
          return propertyErrors.some((value) => value === true);
      }
    },
    [errorMessages, propertyErrors]
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                size="small"
                required={true}
                value={catalogueItemDetails.name ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('name', event.target.value);
                }}
                fullWidth
                error={errorMessages.name !== undefined}
                helperText={
                  errorMessages.name !== undefined ? errorMessages.name : ''
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                size="small"
                value={catalogueItemDetails.description ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('description', event.target.value);
                }}
                fullWidth
                multiline
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cost (£)"
                size="small"
                required={true}
                value={catalogueItemDetails.cost_gbp ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('cost_gbp', event.target.value);
                }}
                error={errorMessages.cost_gbp !== undefined}
                helperText={
                  errorMessages.cost_gbp !== undefined
                    ? errorMessages.cost_gbp
                    : ''
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Cost to rework (£)"
                size="small"
                value={catalogueItemDetails.cost_to_rework_gbp ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails(
                    'cost_to_rework_gbp',
                    event.target.value
                  );
                }}
                error={errorMessages.cost_to_rework_gbp !== undefined}
                helperText={
                  errorMessages.cost_to_rework_gbp !== undefined
                    ? errorMessages.cost_to_rework_gbp
                    : ''
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Time to replace (days)"
                size="small"
                required={true}
                value={catalogueItemDetails.days_to_replace ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('days_to_replace', event.target.value);
                }}
                error={errorMessages.days_to_replace !== undefined}
                helperText={
                  errorMessages.days_to_replace !== undefined
                    ? errorMessages.days_to_replace
                    : ''
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Time to rework (days)"
                size="small"
                value={catalogueItemDetails.days_to_rework ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('days_to_rework', event.target.value);
                }}
                error={errorMessages.days_to_rework !== undefined}
                helperText={
                  errorMessages.days_to_rework !== undefined
                    ? errorMessages.days_to_rework
                    : ''
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Drawing number"
                size="small"
                value={catalogueItemDetails.drawing_number ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('drawing_number', event.target.value);
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Drawing link"
                size="small"
                value={catalogueItemDetails.drawing_link ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('drawing_link', event.target.value);
                }}
                error={errorMessages.drawing_link !== undefined}
                helperText={
                  errorMessages.drawing_link !== undefined
                    ? errorMessages.drawing_link
                    : ''
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Model number"
                size="small"
                value={catalogueItemDetails.item_model_number ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails(
                    'item_model_number',
                    event.target.value
                  );
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} style={{ display: 'flex' }}>
              <Grid item xs={11}>
                <Autocomplete
                  value={
                    //logic means that current manufacturer renders in edit dialog, but behaves the same as add dialog (so can be changed/cleared)
                    selectedCatalogueItemManufacturer &&
                    selectedManufacturer === null &&
                    inputValue !== ''
                      ? selectedCatalogueItemManufacturer
                      : selectedManufacturer
                  }
                  inputValue={inputValue ?? ''}
                  onInputChange={(_event, newInputValue) =>
                    setInputValue(newInputValue)
                  }
                  onChange={(_event, newManufacturer: Manufacturer | null) => {
                    setSelectedManufacturer(newManufacturer ?? null);
                    setInputValue(newManufacturer?.name ?? '');
                    handleCatalogueDetails(
                      'manufacturer_id',
                      newManufacturer?.id ?? null
                    );
                  }}
                  id="manufacturer-autocomplete"
                  options={sortDataList(manufacturerList ?? [], 'name')}
                  size="small"
                  isOptionEqualToValue={(option, value) =>
                    option.name === value.name
                  }
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required={true}
                      label="Manufacturer"
                      error={errorMessages.manufacturer_id !== undefined}
                      helperText={
                        errorMessages.manufacturer_id !== undefined
                          ? errorMessages.manufacturer_id
                          : ''
                      }
                    />
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  sx={{ mx: '4px', my: '2px' }}
                  onClick={() => setAddManufacturerDialogOpen(true)}
                  aria-label="add manufacturer"
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>
            <ManufacturerDialog
              open={addManufacturerDialogOpen}
              onClose={() => setAddManufacturerDialogOpen(false)}
              type="create"
            />

            <Grid item xs={12}>
              <TextField
                label="Notes"
                size="small"
                multiline
                minRows={5}
                value={catalogueItemDetails.notes ?? ''}
                onChange={(event) => {
                  handleCatalogueDetails('notes', event.target.value);
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid item xs={12}>
            {parentCatalogueItemPropertiesInfo.length >= 1 ? (
              <Grid container spacing={1.5}>
                {parentCatalogueItemPropertiesInfo.map(
                  (property: CatalogueCategoryFormData, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={11} sx={{ display: 'flex' }}>
                          {property.type === 'boolean' ? (
                            <FormControl fullWidth>
                              <Autocomplete
                                id={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                value={(propertyValues[index] as string) ?? ''}
                                size="small"
                                onChange={(_event, value) => {
                                  handlePropertyChange(
                                    index,
                                    (value == 'None'
                                      ? ''
                                      : value?.toLowerCase()) as string
                                  );
                                }}
                                sx={{ alignItems: 'center' }}
                                fullWidth
                                options={['None', 'True', 'False']}
                                isOptionEqualToValue={(option, value) =>
                                  option.toLowerCase() == value || value == ''
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    required={property.mandatory ?? false}
                                    label={property.name}
                                    error={propertyErrors[index]}
                                    helperText={
                                      propertyErrors[index] &&
                                      'Please select either True or False'
                                    }
                                  />
                                )}
                              />
                            </FormControl>
                          ) : property.allowed_values ? (
                            <FormControl fullWidth>
                              <Autocomplete
                                id={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                value={(propertyValues[index] as string) ?? ''}
                                size="small"
                                onChange={(_event, value) => {
                                  handlePropertyChange(
                                    index,
                                    value == 'None' ? '' : value
                                  );
                                }}
                                sx={{ alignItems: 'center' }}
                                fullWidth
                                options={addValueToFrontOfList(
                                  property.allowed_values.values,
                                  'None'
                                )}
                                getOptionLabel={(option) => option.toString()}
                                isOptionEqualToValue={(option, value) =>
                                  option.toString() === value.toString() ||
                                  value === ''
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    required={property.mandatory ?? false}
                                    label={property.name}
                                    error={propertyErrors[index]}
                                    helperText={
                                      propertyErrors[index] &&
                                      'Please enter a valid value as this field is mandatory'
                                    }
                                  />
                                )}
                              />
                            </FormControl>
                          ) : (
                            <TextField
                              label={`${property.name} ${
                                property.unit ? `(${property.unit})` : ''
                              }`}
                              size="small"
                              required={property.mandatory ?? false}
                              value={propertyValues[index] || ''}
                              onChange={(event) =>
                                handlePropertyChange(
                                  index,
                                  event.target.value ? event.target.value : null
                                )
                              }
                              fullWidth
                              error={propertyErrors[index]}
                              helperText={
                                // Check if 'propertyErrors[index]' exists and evaluate its value
                                propertyErrors[index]
                                  ? // If 'propertyErrors[index]' is truthy, perform the following checks:
                                    property.mandatory && !propertyValues[index]
                                    ? // If 'property' is mandatory and 'propertyValues[index]' is empty, return a mandatory field error message
                                      'Please enter a valid value as this field is mandatory'
                                    : property.type === 'number' &&
                                      isNaN(Number(propertyValues[index])) &&
                                      'Please enter a valid number' // If 'property' is of type 'number' and 'propertyValues[index]' is not a valid number, return an invalid number error message
                                  : // If 'propertyErrors[index]' is falsy, return an empty string (no error)
                                    ''
                              }
                            />
                          )}
                        </Grid>
                        <Grid
                          item
                          xs={1}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <Tooltip
                            title={
                              <div>
                                <Typography>Name: {property.name}</Typography>
                                <Typography>Unit: {property.unit}</Typography>
                                <Typography>
                                  Type:{' '}
                                  {property.type === 'string'
                                    ? 'text'
                                    : property.type}
                                </Typography>
                              </div>
                            }
                            placement="right"
                            enterTouchDelay={0}
                          >
                            <IconButton size="small">
                              <InfoOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                  )
                )}
              </Grid>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 3,
                }}
              >
                <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  No catalogue item properties
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                  Please click the Finish button
                </Typography>
              </Box>
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
      <DialogTitle>{`${
        type === 'edit' ? 'Edit' : 'Add'
      } Catalogue Item`}</DialogTitle>
      <DialogContent>
        <Stepper
          nonLinear
          activeStep={activeStep}
          orientation="horizontal"
          sx={{ marginTop: 2 }}
        >
          {STEPS.map((label, index) => {
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

        {activeStep === STEPS.length - 1 ? (
          <Button
            disabled={
              isEditPending ||
              isAddPending ||
              JSON.stringify(errorMessages) !== '{}' ||
              formError ||
              propertyErrors.some((value) => {
                return value === true;
              })
            }
            onClick={
              type === 'edit' ? handleEditCatalogueItem : handleAddCatalogueItem
            }
            sx={{ mr: 3 }}
          >
            Finish
          </Button>
        ) : (
          <Button
            disabled={JSON.stringify(errorMessages) !== '{}' || formError}
            onClick={() => handleNext(activeStep)}
            sx={{ mr: 3 }}
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

export default CatalogueItemsDialog;
