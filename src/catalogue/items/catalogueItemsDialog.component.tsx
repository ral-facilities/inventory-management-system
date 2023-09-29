import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React from 'react';
import {
  AddCatalogueItem,
  CatalogueCategoryFormData,
  CatalogueItem,
  CatalogueItemDetails,
  CatalogueItemManufacturer,
  CatalogueItemProperty,
  EditCatalogueItem,
  ErrorParsing,
} from '../../app.types';
import {
  useAddCatalogueItem,
  useCatalogueItem,
  useEditCatalogueItem,
} from '../../api/catalogueItem';
import { AxiosError } from 'axios';

export interface CatalogueItemsDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  catalogueItemDetails: CatalogueItemDetails;
  onChangeCatalogueItemDetails: (
    catalogueItemName: CatalogueItemDetails
  ) => void;
  catalogueItemManufacturer: CatalogueItemManufacturer;
  onChangeCatalogueItemManufacturer: (
    catalogueItemManufacturer: CatalogueItemManufacturer
  ) => void;
  catalogueItemPropertiesForm: CatalogueCategoryFormData[];
  catalogueItemProperties: CatalogueItemProperty[] | null;
  onChangeCatalogueItemProperties: (
    catalogueItemProperties: CatalogueItemProperty[] | null
  ) => void;
  selectedCatalogueItem?: CatalogueItem;
  type: 'edit' | 'create';
}

function matchCatalogueItemProperties(
  form: CatalogueCategoryFormData[],
  items: CatalogueItemProperty[]
): (string | number | boolean | null)[] {
  const result: (string | number | boolean | null)[] = [];

  for (const property of form) {
    const matchingItem = items.find((item) => item.name === property.name);
    if (matchingItem) {
      // Type check and assign the value
      if (property.type === 'number') {
        result.push(matchingItem.value ? Number(matchingItem.value) : null);
      } else if (property.type === 'boolean') {
        result.push(
          typeof matchingItem.value === 'boolean'
            ? String(Boolean(matchingItem.value))
            : ''
        );
      } else {
        result.push(matchingItem.value ? String(matchingItem.value) : null);
      }
    } else {
      // If there is no matching item, push null
      result.push(null);
    }
  }

  return result;
}

function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

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
    catalogueItemProperties,
    onChangeCatalogueItemProperties,
    selectedCatalogueItem,
    type,
  } = props;

  const [propertyValues, setPropertyValues] = React.useState<
    (string | number | boolean | null)[]
  >(catalogueItemProperties?.map((property) => property.value) || []);

  React.useEffect(() => {
    if (type === 'edit') {
      setPropertyValues(
        matchCatalogueItemProperties(
          catalogueItemPropertiesForm,
          catalogueItemProperties ?? []
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState<
    string | undefined
  >();

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

  const handleClose = React.useCallback(() => {
    onChangeCatalogueItemDetails({ name: undefined, description: '' });
    onChangeCatalogueItemManufacturer({
      name: '',
      address: '',
      web_url: '',
    });
    setPropertyValues([]);
    setPropertyErrors(
      new Array(catalogueItemPropertiesForm.length).fill(false)
    );
    setNameError(false);
    setNameErrorMessage(undefined);
    onChangeCatalogueItemProperties([]);
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
    onChangeCatalogueItemProperties,
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
    setPropertyValues(updatedPropertyValues);

    const updatedProperties = catalogueItemProperties
      ? [...catalogueItemProperties]
      : [];
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

    onChangeCatalogueItemProperties(updatedProperties);

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

  const handleAddCatalogueItem = React.useCallback(() => {
    let hasErrors = false;

    // Check name
    if (
      catalogueItemDetails.name === undefined ||
      catalogueItemDetails.name.trim() === ''
    ) {
      setNameError(true);
      setNameErrorMessage('Please enter name');
      hasErrors = true;
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
      !catalogueItemManufacturer.web_url.trim() ||
      !isValidUrl(catalogueItemManufacturer.web_url)
    ) {
      setManufacturerWebUrlError(true);
      setManufacturerWebUrlErrorMessage(
        !catalogueItemManufacturer.web_url.trim()
          ? 'Please enter a Manufacturer URL'
          : 'Please enter a valid Manufacturer URL. Only "http://" and "https://" links are accepted'
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

        if (property.type === 'boolean') {
          typedValue =
            typeof propertyValues[index] !== 'boolean'
              ? propertyValues[index] === 'true'
                ? true
                : propertyValues[index] === 'false'
                ? false
                : ''
              : propertyValues[index];
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

    if (hasErrors) {
      return; // Do not proceed with saving if there are errors
    }

    const filteredProperties = updatedProperties.filter(
      (property) => property !== null
    ) as CatalogueItemProperty[];

    const catalogueItem: AddCatalogueItem = {
      catalogue_category_id: parentId ?? '',
      name: catalogueItemDetails.name ?? undefined,
      description: catalogueItemDetails.description ?? '',
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
    catalogueItemDetails,
    catalogueItemManufacturer,
    catalogueItemPropertiesForm,
    handleClose,
    parentId,
    propertyErrors,
    propertyValues,
  ]);

  const handleEditCatalogueItem = React.useCallback(() => {
    if (selectedCatalogueItem && selectedCatalogueItemData) {
      let hasErrors = false;

      if (
        catalogueItemDetails.name === undefined ||
        catalogueItemDetails.name.trim() === ''
      ) {
        setNameError(true);
        setNameErrorMessage('Please enter name');

        hasErrors = true;
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
        !catalogueItemManufacturer.web_url.trim() ||
        !isValidUrl(catalogueItemManufacturer.web_url)
      ) {
        setManufacturerWebUrlError(true);
        setManufacturerWebUrlErrorMessage(
          !catalogueItemManufacturer.web_url.trim()
            ? 'Please enter a Manufacturer URL'
            : 'Please enter a valid Manufacturer URL. Only "http://" and "https://" links are accepted'
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

          if (property.type === 'boolean') {
            typedValue =
              typeof propertyValues[index] !== 'boolean'
                ? propertyValues[index] === 'true'
                  ? true
                  : propertyValues[index] === 'false'
                  ? false
                  : ''
                : propertyValues[index];
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

      if (hasErrors) {
        return; // Do not proceed with saving if there are errors
      }

      const filteredProperties = updatedProperties.filter(
        (property) => property !== null
      ) as CatalogueItemProperty[];

      const isNameUpdated =
        catalogueItemDetails.name !== selectedCatalogueItemData.name;

      const isDescriptionUpdated =
        catalogueItemDetails.description !==
        selectedCatalogueItemData.description;

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

      if (isNameUpdated) {
        catalogueItem = { ...catalogueItem, name: catalogueItemDetails.name };
      }

      if (isDescriptionUpdated) {
        catalogueItem = {
          ...catalogueItem,
          description: catalogueItemDetails.description,
        };
      }

      if (isCatalogueItemPropertiesUpdated) {
        catalogueItem = { ...catalogueItem, properties: filteredProperties };
      }

      if (isManufacturerUpdated) {
        catalogueItem = {
          ...catalogueItem,
          manufacturer: catalogueItemManufacturer,
        };
      }

      if (
        catalogueItem.id &&
        (isNameUpdated ||
          isDescriptionUpdated ||
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
    catalogueItemDetails,
    catalogueItemManufacturer,
    catalogueItemPropertiesForm,
    editCatalogueItem,
    handleClose,
    propertyErrors,
    propertyValues,
    selectedCatalogueItem,
    selectedCatalogueItemData,
  ]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>{`${
        type === 'create' ? 'Add' : 'Edit'
      } Catalogue Item`}</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Details</Typography>
        <TextField
          label="Name"
          required={true}
          sx={{ marginLeft: '4px', marginTop: '16px' }}
          value={catalogueItemDetails.name}
          onChange={(event) => {
            const newName = event.target.value ? event.target.value : undefined;
            onChangeCatalogueItemDetails({
              ...catalogueItemDetails,
              name: newName,
            });
            setNameError(false); // Clear the error when user types in the name field
            setNameErrorMessage(undefined);
            setFormError(false);
            setFormErrorMessage(undefined);
          }}
          fullWidth
          error={nameError} // Set error state based on the nameError state
          helperText={nameError ? nameErrorMessage : ''}
        />

        <TextField
          label="Description"
          sx={{ marginLeft: '4px', marginTop: '16px' }} // Adjusted the width and margin
          value={catalogueItemDetails.description}
          onChange={(event) => {
            const newDescription = event.target.value ? event.target.value : '';
            onChangeCatalogueItemDetails({
              ...catalogueItemDetails,
              description: newDescription,
            });
            setFormError(false);
            setFormErrorMessage(undefined);
          }}
          fullWidth
          multiline
        />

        {catalogueItemPropertiesForm.length >= 1 && (
          <Box>
            <Typography sx={{ marginTop: '16px' }} variant="h6">
              Properties
            </Typography>
            {catalogueItemPropertiesForm.map(
              (property: CatalogueCategoryFormData, index: number) => (
                <Box
                  key={index}
                  sx={{
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {property.type === 'boolean' ? (
                    <FormControl
                      sx={{
                        width: '100%',
                        marginLeft: '4px',
                        marginTop: '8px',
                      }}
                    >
                      <InputLabel
                        required={property.mandatory ?? false}
                        error={propertyErrors[index]}
                        id={`catalogue-item-property-${property.name.replace(
                          /\s+/g,
                          '-'
                        )}`}
                      >
                        {property.name}
                      </InputLabel>
                      <Select
                        value={(propertyValues[index] as string) || ''}
                        required={property.mandatory ?? false}
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
                        sx={{
                          width: '100%', // Set the Select width to 100%
                        }}
                        label={property.name}
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
                      required={property.mandatory ?? false}
                      sx={{
                        marginLeft: '4px',
                        marginTop: '8px',
                        width: '100%',
                      }}
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
                        propertyErrors[index]
                          ? property.mandatory && !propertyValues[index]
                            ? 'This field is mandatory'
                            : property.type === 'number' &&
                              isNaN(Number(propertyValues[index]))
                            ? 'Please enter a valid number'
                            : ''
                          : ''
                      }
                    />
                  )}
                  <Tooltip
                    title={
                      <div>
                        <Typography>Name: {property.name}</Typography>
                        <Typography>Unit: {property.unit}</Typography>
                        <Typography>
                          Type:{' '}
                          {property.type === 'string' ? 'text' : property.type}
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
                </Box>
              )
            )}
          </Box>
        )}

        <Typography sx={{ marginTop: '16px' }} variant="h6">
          Manufacturer
        </Typography>
        <TextField
          label="Manufacturer Name"
          required={true}
          sx={{ marginLeft: '4px', marginTop: '16px' }}
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
            manufacturerNameError ? 'Please enter a Manufacturer Name' : ''
          }
          fullWidth
        />

        <TextField
          label="Manufacturer URL"
          required={true}
          sx={{ marginLeft: '4px', marginTop: '16px' }}
          value={catalogueItemManufacturer.web_url}
          onChange={(event) => {
            onChangeCatalogueItemManufacturer({
              ...catalogueItemManufacturer,
              web_url: event.target.value,
            });
            setFormError(false);
            setFormErrorMessage(undefined);
            setManufacturerWebUrlError(false);
            setManufacturerWebUrlErrorMessage('');
          }}
          error={manufacturerWebUrlError} // Set error state based on the nameError state
          helperText={
            manufacturerWebUrlError ? manufacturerWebUrlErrorMessage : ''
          }
          fullWidth
        />

        <TextField
          label="Manufacturer Address"
          required={true}
          sx={{ marginLeft: '4px', marginTop: '16px' }}
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
