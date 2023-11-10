import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import React from 'react';

import {
  AddManufacturer,
  EditManufacturer,
  ErrorParsing,
  Manufacturer,
} from '../app.types';
import {
  useAddManufacturer,
  useEditManufacturer,
  useManufacturer,
} from '../api/manufacturer';
import { AxiosError } from 'axios';

export interface ManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  onChangeManufacturerDetails: (manufacturer: Manufacturer) => void;
  manufacturer: Manufacturer;
  selectedManufacturer?: Manufacturer;
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

function ManufacturerDialog(props: ManufacturerDialogProps) {
  const {
    open,
    onClose,
    manufacturer,
    onChangeManufacturerDetails,
    type,
    selectedManufacturer,
  } = props;

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const [urlError, seturlError] = React.useState(false);
  const [urlErrorMessage, seturlErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const [addressBuildingNumberError, setAddressBuildingNumberError] =
    React.useState(false);
  const [
    addressBuildingNumberErrorMessage,
    setAddressBuildingNumberErrorMessage,
  ] = React.useState<string | undefined>(undefined);
  const [addressStreetNameError, setAddressStreetNameError] =
    React.useState(false);
  const [addressStreetNameErrorMessage, setaddressStreetNameErrorMessage] =
    React.useState<string | undefined>(undefined);
  const [addressPostcodeError, setaddressPostcodeError] = React.useState(false);
  const [addressPostcodeErrorMessage, setaddressPostcodeErrorMessage] =
    React.useState<string | undefined>(undefined);

  const [formError, setFormError] = React.useState(false);
  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const [catchAllError, setCatchAllError] = React.useState(false);

  const { mutateAsync: addManufacturer } = useAddManufacturer();
  const { mutateAsync: editManufacturer } = useEditManufacturer();
  const { data: selectedManufacturerData } = useManufacturer(
    selectedManufacturer?.id
  );

  const handleClose = React.useCallback(() => {
    onChangeManufacturerDetails({
      name: '',
      url: undefined,
      address: {
        building_number: '',
        street_name: '',
        town: '',
        county: '',
        postcode: '',
      },
      telephone: '',
    });
    setNameError(false);
    setNameErrorMessage(undefined);
    seturlError(false);
    seturlErrorMessage(undefined);
    setAddressBuildingNumberError(false);
    setAddressBuildingNumberErrorMessage(undefined);
    setAddressStreetNameError(false);
    setaddressStreetNameErrorMessage(undefined);
    setaddressPostcodeError(false);
    setaddressPostcodeErrorMessage(undefined);
    setFormError(false);
    setFormErrorMessage(undefined);
    onClose();
  }, [onClose, onChangeManufacturerDetails]);

  const handleErrors = React.useCallback((): boolean => {
    let hasErrors = false;

    //check url is valid
    if (manufacturer.url) {
      if (!isValidUrl(manufacturer.url)) {
        hasErrors = true;
        seturlError(true);
        seturlErrorMessage('Please enter a valid URL');
      }
    }

    //check name
    if (!manufacturer.name || manufacturer.name?.trim().length === 0) {
      hasErrors = true;
      setNameError(true);
      setNameErrorMessage('Please enter a name.');
    }
    //check building number
    if (
      !manufacturer.address?.building_number ||
      manufacturer.address.building_number.trim().length === 0
    ) {
      hasErrors = true;
      setAddressBuildingNumberError(true);
      setAddressBuildingNumberErrorMessage('Please enter a building number.');
    }
    //check street name
    if (
      !manufacturer.address?.street_name ||
      manufacturer.address.street_name?.trim().length === 0
    ) {
      hasErrors = true;
      setAddressStreetNameError(true);
      setaddressStreetNameErrorMessage('Please enter a street name.');
    }
    //check post code
    if (
      !manufacturer.address?.postcode ||
      manufacturer.address.postcode?.trim().length === 0
    ) {
      hasErrors = true;
      setaddressPostcodeError(true);
      setaddressPostcodeErrorMessage('Please enter a post code or zip code.');
    }

    return hasErrors;
  }, [
    manufacturer.address.building_number,
    manufacturer.address.postcode,
    manufacturer.address.street_name,
    manufacturer.name,
    manufacturer.url,
  ]);

  const handleAddManufacturer = React.useCallback(() => {
    const hasErrors = handleErrors();

    if (hasErrors) {
      return;
    }

    const manufacturerToAdd: AddManufacturer = {
      name: manufacturer.name,
      url: manufacturer.url ?? undefined,
      address: {
        building_number: manufacturer.address.building_number,
        street_name: manufacturer.address.street_name,
        town: manufacturer.address.town ?? undefined,
        county: manufacturer.address.county ?? undefined,
        postcode: manufacturer.address.postcode,
      },
      telephone: manufacturer.telephone ?? undefined,
    };

    addManufacturer(manufacturerToAdd)
      .then((response) => handleClose())
      .catch((error: AxiosError) => {
        console.log(error.response?.status, manufacturer.name);

        if (error.response?.status === 409) {
          setNameError(true);
          setNameErrorMessage(
            'A manufacturer with the same name already exists.'
          );
          return;
        }
        setCatchAllError(true);
      });
  }, [handleErrors, manufacturer, addManufacturer, handleClose]);

  const handleEditManufacturer = React.useCallback(() => {
    if (selectedManufacturer && selectedManufacturerData) {
      const hasErrors = handleErrors();

      if (hasErrors) {
        return;
      }

      const isNameUpdated = manufacturer.name !== selectedManufacturer.name;
      const isURLUpdated =
        manufacturer.url !== selectedManufacturer.url &&
        manufacturer.url !== undefined;
      const isBuildingNumberUpdated =
        manufacturer.address?.building_number !==
        selectedManufacturer.address.building_number;
      const isStreetNameUpdated =
        manufacturer.address?.street_name !==
        selectedManufacturer.address.street_name;
      const isTownUpdated =
        manufacturer.address?.town !== selectedManufacturer.address.town;
      const isCountyUpdated =
        manufacturer.address?.county !== selectedManufacturer.address.county;
      const ispostcodeUpdated =
        manufacturer.address?.postcode !==
        selectedManufacturer.address.postcode;
      const isTelephoneUpdated =
        manufacturer.telephone !== selectedManufacturer.telephone;

      let ManufacturerToEdit: EditManufacturer = {
        id: selectedManufacturer?.id,
      };

      if (isNameUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          name: manufacturer.name,
        };
      }
      if (isURLUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          url: manufacturer.url,
        };
      }
      if (isBuildingNumberUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...manufacturer.address,
            building_number: manufacturer.address?.building_number,
          },
        };
      }
      if (isStreetNameUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...ManufacturerToEdit.address,
            street_name: manufacturer.address?.street_name,
          },
        };
      }
      if (isTownUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...manufacturer.address,
            town: manufacturer.address?.town,
          },
        };
      }
      if (isCountyUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...manufacturer.address,
            county: manufacturer.address?.county,
          },
        };
      }
      if (ispostcodeUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...manufacturer.address,
            postcode: manufacturer.address?.postcode,
          },
        };
      }
      if (isTelephoneUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          telephone: manufacturer.telephone,
        };
      }

      if (
        (selectedManufacturer.id && isNameUpdated) ||
        isBuildingNumberUpdated ||
        isStreetNameUpdated ||
        isTownUpdated ||
        isCountyUpdated ||
        ispostcodeUpdated ||
        isTelephoneUpdated
      ) {
        editManufacturer(ManufacturerToEdit)
          .then((response) => handleClose())
          .catch((error: AxiosError) => {
            const response = error.response?.data as ErrorParsing;
            console.log(error);
            if (response && error.response?.status === 409) {
              setNameError(true);
              setNameErrorMessage(
                'A manufacturer with the same name has been found. Please enter a different name'
              );
              return;
            }
            setCatchAllError(true);
          });
      } else {
        setFormError(true);
        setFormErrorMessage(
          "There have been no changes made. Please change a field's value or press Cancel to exit"
        );
      }
    }
  }, [
    editManufacturer,
    handleClose,
    handleErrors,
    manufacturer,
    selectedManufacturer,
    selectedManufacturerData,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{`${
        type === 'create' ? 'Add' : 'Edit'
      } Manufacturer`}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={2}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required={type === 'create' ? true : false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.name}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  name: event.target.value,
                });
                setNameError(false);
                setNameErrorMessage(undefined);
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              error={nameError}
              helperText={nameError && nameErrorMessage}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="URL"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.url}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  url: event.target.value,
                });
                seturlError(false);
                seturlErrorMessage(undefined);
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              error={urlError}
              helperText={urlError && urlErrorMessage}
              fullWidth
            />
          </Grid>
          <Grid item>
            <Typography>Address</Typography>
            <TextField
              label="Building number"
              required={type === 'create' ? true : false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.address.building_number}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  address: {
                    ...manufacturer.address,
                    building_number: event.target.value,
                  },
                });
                setAddressBuildingNumberError(false);
                setAddressBuildingNumberErrorMessage(undefined);
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              error={addressBuildingNumberError}
              helperText={
                addressBuildingNumberError && addressBuildingNumberErrorMessage
              }
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Street name"
              required={type === 'create' ? true : false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.address.street_name}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  address: {
                    ...manufacturer.address,
                    street_name: event.target.value,
                  },
                });
                setAddressStreetNameError(false);
                setaddressStreetNameErrorMessage(undefined);
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              error={addressStreetNameError}
              helperText={
                addressStreetNameError && addressStreetNameErrorMessage
              }
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Town"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.address.town}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  address: {
                    ...manufacturer.address,
                    town: event.target.value,
                  },
                });
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="County"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.address.county}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  address: {
                    ...manufacturer.address,
                    county: event.target.value,
                  },
                });
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Post/Zip code"
              required={type === 'create' ? true : false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.address.postcode}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  address: {
                    ...manufacturer.address,
                    postcode: event.target.value,
                  },
                });
                setaddressPostcodeError(false);
                setaddressPostcodeErrorMessage(undefined);
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              error={addressPostcodeError}
              helperText={addressPostcodeError && addressPostcodeErrorMessage}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Telephone number"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.telephone}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  telephone: event.target.value,
                });
                setFormError(false);
                setFormErrorMessage(undefined);
              }}
              fullWidth
            />
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
              type === 'create' ? handleAddManufacturer : handleEditManufacturer
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

export default ManufacturerDialog;
