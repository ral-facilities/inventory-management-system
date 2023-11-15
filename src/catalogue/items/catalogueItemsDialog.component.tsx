import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import {
  useAddCatalogueItem,
  useCatalogueItem,
  useEditCatalogueItem,
} from '../../api/catalogueItem';
import {
  AddCatalogueItem,
  CatalogueCategoryFormData,
  CatalogueDetailsErrorMessages,
  CatalogueItem,
  CatalogueItemDetailsPlaceholder,
  CatalogueItemManufacturer,
  CatalogueItemProperty,
  EditCatalogueItem,
  ErrorParsing,
} from '../../app.types';

export interface CatalogueItemsDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  catalogueItemDetails: CatalogueItemDetailsPlaceholder;
  onChangeCatalogueItemDetails: (
    catalogueItemDetails: CatalogueItemDetailsPlaceholder
  ) => void;
  catalogueItemManufacturer: CatalogueItemManufacturer;
  onChangeCatalogueItemManufacturer: (
    catalogueItemManufacturer: CatalogueItemManufacturer
  ) => void;
  catalogueItemPropertiesForm: CatalogueCategoryFormData[];
  propertyValues: (string | number | boolean | null)[];
  onChangePropertyValues: (
    propertyValues: (string | number | boolean | null)[]
  ) => void;
  selectedCatalogueItem?: CatalogueItem;
  type: 'edit' | 'create';
}

function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
      parsedUrl.hostname.includes('.') // Checks for the typical top-level domain
    );
  } catch (error) {
    return false;
  }
}

const isValidNumber = (input: string): boolean => {
  const numberValue = Number(input);
  return !isNaN(numberValue) && input.trim() !== '';
};

function CatalogueItemsDialog(props: CatalogueItemsDialogProps) {
  const {
    open,
    onClose,
    parentId,
    catalogueItemDetails,
    onChangeCatalogueItemDetails,
    catalogueItemManufacturer,
    onChangeCatalogueItemManufacturer,
    catalogueItemPropertiesForm,
    propertyValues,
    onChangePropertyValues,
    selectedCatalogueItem,
    type,
  } = props;
  const [formError, setFormError] = React.useState(false);
  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const [catchAllError, setCatchAllError] = React.useState(false);

  const [manufacturerNameError, setManufacturerNameError] =
    React.useState(false);
  const [manufacturerWebUrlError, setManufacturerWebUrlError] =
    React.useState(false);
  const [manufacturerWebUrlErrorMessage, setManufacturerWebUrlErrorMessage] =
    React.useState<string>('');
  const [manufacturerAddressError, setManufacturerAddressError] =
    React.useState(false);
  const [propertyErrors, setPropertyErrors] = React.useState(
    new Array(catalogueItemPropertiesForm.length).fill(false)
  );

  // set the errors as the types into the input fields

  const [errorMessages, setErrorMessages] = React.useState<
    Partial<CatalogueDetailsErrorMessages>
  >({});

  const handleClose = React.useCallback(() => {
    onChangeCatalogueItemDetails({
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
      is_obsolete: 'false',
      obsolete_replacement_catalogue_item_id: null,
      obsolete_reason: null,
    });
    onChangeCatalogueItemManufacturer({
      name: '',
      address: '',
      url: '',
    });
    onChangePropertyValues([]);
    setPropertyErrors(
      new Array(catalogueItemPropertiesForm.length).fill(false)
    );
    setErrorMessages({});
    setFormError(false);
    setFormErrorMessage(undefined);
    setManufacturerAddressError(false);
    setManufacturerNameError(false);
    setManufacturerWebUrlError(false);
    onClose();
  }, [
    catalogueItemPropertiesForm.length,
    onChangeCatalogueItemDetails,
    onChangeCatalogueItemManufacturer,
    onChangePropertyValues,
    onClose,
  ]);

  const handlePropertyChange = (
    index: number,
    name: string,
    newValue: string | boolean | null
  ) => {
    setFormError(false);
    setFormErrorMessage(undefined);
    const updatedPropertyValues = [...propertyValues];
    updatedPropertyValues[index] = newValue;
    onChangePropertyValues(updatedPropertyValues);

    const updatedProperties: CatalogueItemProperty[] = [];
    const propertyType = catalogueItemPropertiesForm[index]?.type || 'string';

    if (!updatedProperties[index]) {
      // Initialize the property if it doesn't exist
      updatedProperties[index] = { name: '', value: '' };
    }

    const updatedProperty = {
      ...updatedProperties[index],
      name: name,
    };

    if (propertyType === 'boolean') {
      updatedProperty.value =
        newValue === 'true' ? true : newValue === 'false' ? false : '';
    } else if (propertyType === 'number') {
      if (newValue !== null) {
        const parsedValue = Number(newValue);
        updatedProperty.value = isNaN(parsedValue) ? null : parsedValue;
      }
    } else {
      updatedProperty.value = newValue;
    }

    updatedProperties[index] = updatedProperty;

    // Clear the error state for the changed property
    const updatedPropertyErrors = [...propertyErrors];
    updatedPropertyErrors[index] = false;
    setPropertyErrors(updatedPropertyErrors);
  };

  const { mutateAsync: addCatalogueItem } = useAddCatalogueItem();
  const { mutateAsync: editCatalogueItem } = useEditCatalogueItem();
  const { data: selectedCatalogueItemData } = useCatalogueItem(
    selectedCatalogueItem?.id
  );

  const handleFormErrorStates = React.useCallback(() => {
    let hasErrors = false;

    if (
      !catalogueItemDetails.days_to_replace ||
      catalogueItemDetails.days_to_replace.trim() === ''
    ) {
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        days_to_replace: 'Please enter how many days it would take to replace',
      }));
      hasErrors = true;
    } else {
      if (!isValidNumber(catalogueItemDetails.days_to_replace)) {
        setErrorMessages((prevErrorMessages) => ({
          ...prevErrorMessages,
          days_to_replace: 'Please enter a valid number',
        }));
        hasErrors = true;
      }
    }

    // Check the catalogue item Name is defined
    if (!catalogueItemDetails.name || catalogueItemDetails.name.trim() === '') {
      setErrorMessages((prevErrorMessages) => ({
        ...prevErrorMessages,
        name: 'Please enter a name',
      }));
      hasErrors = true;
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
      hasErrors = true;
    } else {
      if (!isValidNumber(catalogueItemDetails.cost_gbp)) {
        setErrorMessages((prevErrorMessages) => ({
          ...prevErrorMessages,
          cost_gbp: 'Please enter a valid number',
        }));
        hasErrors = true;
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
        hasErrors = true;
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
        hasErrors = true;
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
        hasErrors = true;
      }
    }
    // Check Manufacturer Name

    if (
      catalogueItemManufacturer.name === undefined ||
      catalogueItemManufacturer.name.trim() === ''
    ) {
      setManufacturerNameError(true);
      hasErrors = true;
    }

    // Check Manufacturer URL
    if (
      !catalogueItemManufacturer.url.trim() ||
      !isValidUrl(catalogueItemManufacturer.url)
    ) {
      setManufacturerWebUrlError(true);
      setManufacturerWebUrlErrorMessage(
        !catalogueItemManufacturer.url.trim()
          ? 'Please enter a Manufacturer URL'
          : 'Please enter a valid Manufacturer URL. Only "http://" and "https://" links with typical top-level domain are accepted'
      );
      hasErrors = true;
    }

    // Check Manufacturer Address
    if (
      catalogueItemManufacturer.address === undefined ||
      catalogueItemManufacturer.address.trim() === ''
    ) {
      setManufacturerAddressError(true);
      hasErrors = true;
    }
    // Check properties
    const updatedPropertyErrors = [...propertyErrors];

    const updatedProperties = catalogueItemPropertiesForm.map(
      (property, index) => {
        if (property.mandatory && !propertyValues[index]) {
          updatedPropertyErrors[index] = true;
          hasErrors = true;
        } else {
          updatedPropertyErrors[index] = false;
        }

        if (
          propertyValues[index] !== undefined &&
          property.type === 'number' &&
          isNaN(Number(propertyValues[index]))
        ) {
          updatedPropertyErrors[index] = true;
          hasErrors = true;
        }

        if (!propertyValues[index]) {
          if (property.type === 'boolean') {
            if (
              propertyValues[index] === '' ||
              propertyValues[index] === undefined
            ) {
              return null;
            }
          } else {
            return null;
          }
        }

        let typedValue: string | number | boolean | null =
          propertyValues[index]; // Assume it's a string by default

        // Check if the type of the 'property' is boolean
        if (property.type === 'boolean') {
          // If the type is boolean, then check the type of 'propertyValues[index]'
          typedValue =
            typeof propertyValues[index] !== 'boolean'
              ? // If 'propertyValues[index]' is not a boolean, convert it based on string values 'true' or 'false',
                // otherwise, assign 'propertyValues[index]' directly to 'typedValue'
                propertyValues[index] === 'true'
                ? true
                : false
              : // If 'propertyValues[index]' is already a boolean, assign it directly to 'typedValue'
                propertyValues[index];
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

    return { hasErrors, updatedProperties };
  }, [
    catalogueItemDetails,
    catalogueItemManufacturer,
    propertyErrors,
    catalogueItemPropertiesForm,
    propertyValues,
  ]);
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
    }),
    [catalogueItemDetails, parentId]
  );
  const handleAddCatalogueItem = React.useCallback(() => {
    const { hasErrors, updatedProperties } = handleFormErrorStates();
    if (hasErrors) {
      return; // Do not proceed with saving if there are errors
    }

    const filteredProperties = updatedProperties.filter(
      (property) => property !== null
    ) as CatalogueItemProperty[];

    const catalogueItem: AddCatalogueItem = {
      ...details,
      properties: filteredProperties,
      manufacturer: catalogueItemManufacturer,
    };

    addCatalogueItem(catalogueItem)
      .then((response) => handleClose())
      .catch((error: AxiosError) => {
        console.log(error);
        setCatchAllError(true);
      });
  }, [
    addCatalogueItem,
    catalogueItemManufacturer,
    handleClose,
    details,
    handleFormErrorStates,
  ]);

  const handleEditCatalogueItem = React.useCallback(() => {
    if (selectedCatalogueItem && selectedCatalogueItemData) {
      const { hasErrors, updatedProperties } = handleFormErrorStates();

      if (hasErrors) {
        return; // Do not proceed with saving if there are errors
      }

      const filteredProperties = updatedProperties.filter(
        (property) => property !== null
      ) as CatalogueItemProperty[];

      const isNameUpdated = details.name !== selectedCatalogueItemData.name;

      const isDescriptionUpdated =
        details.description !== selectedCatalogueItemData.description;

      const isCostGbpUpdated =
        details.cost_gbp !== selectedCatalogueItemData.cost_gbp;

      const isCostToReworkGbpUpdated =
        details.cost_to_rework_gbp !==
        selectedCatalogueItemData.cost_to_rework_gbp;

      const isDaysToReplaceUpdated =
        details.days_to_replace !== selectedCatalogueItemData.days_to_replace;

      const isDaysToReworkUpdated =
        details.days_to_rework !== selectedCatalogueItemData.days_to_rework;

      const isDrawingNumberUpdated =
        details.drawing_number !== selectedCatalogueItemData.drawing_number;

      const isDrawingLinkUpdated =
        details.drawing_link !== selectedCatalogueItemData.drawing_link;

      const isModelNumberUpdated =
        details.item_model_number !==
        selectedCatalogueItemData.item_model_number;

      const isCatalogueItemPropertiesUpdated =
        JSON.stringify(filteredProperties) !==
        JSON.stringify(
          selectedCatalogueItemData.properties.map(
            ({ unit, ...rest }) => rest
          ) ?? null
        );

      const isManufacturerUpdated =
        JSON.stringify(catalogueItemManufacturer) !==
        JSON.stringify(selectedCatalogueItemData.manufacturer);
      let catalogueItem: EditCatalogueItem = {
        id: selectedCatalogueItem.id,
      };

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
        (catalogueItem.properties = filteredProperties);
      isManufacturerUpdated &&
        (catalogueItem.manufacturer = catalogueItemManufacturer);

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
          isManufacturerUpdated)
      ) {
        editCatalogueItem(catalogueItem)
          .then((response) => handleClose())
          .catch((error: AxiosError) => {
            const response = error.response?.data as ErrorParsing;
            console.log(error);
            if (response && error.response?.status === 409) {
              if (response.detail.includes('children elements')) {
                setFormError(true);
                setFormErrorMessage(response.detail);
              }
              return;
            }
            setCatchAllError(true);
          });
      } else {
        setFormError(true);
        setFormErrorMessage('Please edit a form entry before clicking save');
      }
    }
  }, [
    catalogueItemManufacturer,
    editCatalogueItem,
    handleClose,
    handleFormErrorStates,
    selectedCatalogueItem,
    selectedCatalogueItemData,
    details,
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

    onChangeCatalogueItemDetails(updatedDetails);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{`${
        type === 'create' ? 'Add' : 'Edit'
      } Catalogue Item`}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <Typography variant="h6">Details</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  size="small"
                  required={true}
                  value={catalogueItemDetails.name}
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
                  value={catalogueItemDetails.description}
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
                  value={catalogueItemDetails.cost_gbp}
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
                  value={catalogueItemDetails.cost_to_rework_gbp}
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
                  value={catalogueItemDetails.days_to_replace}
                  onChange={(event) => {
                    handleCatalogueDetails(
                      'days_to_replace',
                      event.target.value
                    );
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
                  value={catalogueItemDetails.days_to_rework}
                  onChange={(event) => {
                    handleCatalogueDetails(
                      'days_to_rework',
                      event.target.value
                    );
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
                  value={catalogueItemDetails.drawing_number}
                  onChange={(event) => {
                    handleCatalogueDetails(
                      'drawing_number',
                      event.target.value
                    );
                  }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Drawing link"
                  size="small"
                  value={catalogueItemDetails.drawing_link}
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
                  value={catalogueItemDetails.item_model_number}
                  onChange={(event) => {
                    handleCatalogueDetails(
                      'item_model_number',
                      event.target.value
                    );
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Manufacturer</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Manufacturer Name"
                  required={true}
                  size="small"
                  value={catalogueItemManufacturer.name}
                  onChange={(event) => {
                    onChangeCatalogueItemManufacturer({
                      ...catalogueItemManufacturer,
                      name: event.target.value,
                    });
                    setFormError(false);
                    setFormErrorMessage(undefined);
                    setManufacturerNameError(false);
                  }}
                  error={manufacturerNameError}
                  helperText={
                    manufacturerNameError
                      ? 'Please enter a Manufacturer Name'
                      : ''
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Manufacturer URL"
                  required={true}
                  size="small"
                  value={catalogueItemManufacturer.url}
                  onChange={(event) => {
                    onChangeCatalogueItemManufacturer({
                      ...catalogueItemManufacturer,
                      url: event.target.value,
                    });
                    setFormError(false);
                    setFormErrorMessage(undefined);
                    setManufacturerWebUrlError(false);
                    setManufacturerWebUrlErrorMessage('');
                  }}
                  error={manufacturerWebUrlError} // Set error state based on the nameError state
                  helperText={
                    manufacturerWebUrlError
                      ? manufacturerWebUrlErrorMessage
                      : ''
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Manufacturer Address"
                  required={true}
                  size="small"
                  value={catalogueItemManufacturer.address}
                  onChange={(event) => {
                    onChangeCatalogueItemManufacturer({
                      ...catalogueItemManufacturer,
                      address: event.target.value,
                    });
                    setFormError(false);
                    setFormErrorMessage(undefined);
                    setManufacturerAddressError(false);
                  }}
                  error={manufacturerAddressError} // Set error state based on the nameError state
                  helperText={
                    manufacturerAddressError
                      ? 'Please enter a Manufacturer Address'
                      : ''
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={6}>
            {catalogueItemPropertiesForm.length >= 1 && (
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="h6">Properties</Typography>
                </Grid>
                {catalogueItemPropertiesForm.map(
                  (property: CatalogueCategoryFormData, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={11} sx={{ display: 'flex' }}>
                          {property.type === 'boolean' ? (
                            <FormControl fullWidth>
                              <InputLabel
                                required={property.mandatory ?? false}
                                error={propertyErrors[index]}
                                id={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                size="small"
                                sx={{ alignItems: 'center' }}
                              >
                                {property.name}
                              </InputLabel>
                              <Select
                                value={(propertyValues[index] as string) ?? ''}
                                required={property.mandatory ?? false}
                                size="small"
                                error={propertyErrors[index]}
                                labelId={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                onChange={(event) =>
                                  handlePropertyChange(
                                    index,
                                    property.name,
                                    event.target.value as string
                                  )
                                }
                                label={property.name}
                                sx={{ alignItems: 'center' }}
                                fullWidth
                              >
                                <MenuItem value="">None</MenuItem>
                                <MenuItem value="true">True</MenuItem>
                                <MenuItem value="false">False</MenuItem>
                              </Select>
                              {propertyErrors[index] && (
                                <FormHelperText error>
                                  Please select either True or False
                                </FormHelperText>
                              )}
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
                                  property.name,
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
                                      'This field is mandatory'
                                    : property.type === 'number' &&
                                      isNaN(Number(propertyValues[index])) &&
                                      'Please enter a valid number' // If 'property' is of type 'number' and 'propertyValues[index]' is not a valid number, return an invalid number error message
                                  : // If 'propertyErrors[index]' is falsy, return an empty string (no error)
                                    ''
                              }
                            />
                          )}
                        </Grid>
                        <Grid item xs={1} sx={{ display: 'flex' }}>
                          <Tooltip
                            sx={{ alignItems: 'center' }}
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
            )}
          </Grid>
        </Grid>
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
              type === 'create'
                ? handleAddCatalogueItem
                : handleEditCatalogueItem
            }
          >
            Save
          </Button>
        </Box>
        {formError && (
          <FormHelperText sx={{ marginBottom: '16px' }} error>
            {formErrorMessage}
          </FormHelperText>
        )}
        {catchAllError && (
          <FormHelperText sx={{ marginBottom: '16px' }} error>
            {'Please refresh and try again'}
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CatalogueItemsDialog;
