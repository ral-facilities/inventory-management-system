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
  CatalogueItemDetails,
  CatalogueItemManufacturer,
  CatalogueItemProperty,
} from '../../app.types';
import { useAddCatalogueItem } from '../../api/catalogueItem';
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
  } = props;

  const [propertyValues, setPropertyValues] = React.useState(
    catalogueItemProperties?.map((property) => property.value) || []
  );
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState<
    string | undefined
  >();

  const [propertyErrors, setPropertyErrors] = React.useState(
    new Array(catalogueItemPropertiesForm.length).fill(false)
  );

  const handleClose = React.useCallback(() => {
    onChangeCatalogueItemDetails({ name: undefined, description: '' });
    onChangeCatalogueItemManufacturer({
      manufacturer: undefined,
      manufacturerNumber: undefined,
      manufacturerUrl: undefined,
    });
    onChangeCatalogueItemProperties(null);
    setPropertyValues([]);
    setPropertyErrors(
      new Array(catalogueItemPropertiesForm.length).fill(false)
    );
    setNameError(false);
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
      if (newValue === null) {
        updatedProperty.value = null;
      } else {
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

  // console.log(catalogueItemProperties);

  const handleAddCatalogueItem = React.useCallback(() => {
    let hasErrors = false;

    // Check name
    if (
      catalogueItemDetails.name === undefined ||
      catalogueItemDetails.name === ''
    ) {
      setNameError(true);
      setNameErrorMessage('Please enter name');
      hasErrors = true;
    } else {
      setNameError(false);
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
          property.type === 'number' &&
          isNaN(Number(propertyValues[index]))
        ) {
          updatedPropertyErrors[index] = true;
          hasErrors = true;
        }

        if (!propertyValues[index]) {
          return null; // Use null instead of undefined to indicate a property to be removed
        }

        let typedValue: string | number | boolean | null =
          propertyValues[index]; // Assume it's a string by default

        if (property.type === 'boolean') {
          typedValue =
            propertyValues[index] === 'true'
              ? true
              : propertyValues[index] === 'false'
              ? false
              : '';
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
      description: catalogueItemDetails.description,
      properties: filteredProperties,
    };

    addCatalogueItem(catalogueItem)
      .then((response) => handleClose())
      .catch((error: AxiosError) => {
        console.log(error);
        if (error.response?.status === 409) {
          setNameError(true);
          setNameErrorMessage(
            'A catalogue item with the same name already exists within the parent catalogue category.'
          );
        }
      });
  }, [
    addCatalogueItem,
    catalogueItemDetails.description,
    catalogueItemDetails.name,
    catalogueItemPropertiesForm,
    handleClose,
    parentId,
    propertyErrors,
    propertyValues,
  ]);
  // console.log(propertyErrors);
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Catalogue Item</DialogTitle>
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
            onChangeCatalogueItemDetails({
              ...catalogueItemDetails,
              description: event.target.value ? event.target.value : '',
            });
          }}
          fullWidth
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
                      >
                        {property.name}
                      </InputLabel>
                      <Select
                        value={propertyValues[index] || null}
                        required={property.mandatory ?? false}
                        error={propertyErrors[index]}
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
                        <MenuItem value="">Undefined</MenuItem>
                        <MenuItem value="true">True</MenuItem>
                        <MenuItem value="false">False</MenuItem>
                      </Select>
                      {propertyErrors[index] && (
                        <FormHelperText error>
                          Please select either True or False.
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
          value={catalogueItemManufacturer.manufacturer}
          onChange={(event) => {
            onChangeCatalogueItemManufacturer({
              ...catalogueItemManufacturer,
              manufacturer: event.target.value,
            });
          }}
          fullWidth
        />

        <TextField
          label="Manufacturer Number"
          required={true}
          sx={{ marginLeft: '4px', marginTop: '16px' }}
          value={catalogueItemManufacturer.manufacturerNumber}
          onChange={(event) => {
            onChangeCatalogueItemManufacturer({
              ...catalogueItemManufacturer,
              manufacturerNumber: event.target.value,
            });
          }}
          fullWidth
        />

        <TextField
          label="Manufacturer Url"
          required={true}
          sx={{ marginLeft: '4px', marginTop: '16px' }}
          value={catalogueItemManufacturer.manufacturerUrl}
          onChange={(event) => {
            onChangeCatalogueItemManufacturer({
              ...catalogueItemManufacturer,
              manufacturerUrl: event.target.value,
            });
          }}
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
            onClick={handleAddCatalogueItem}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default CatalogueItemsDialog;
