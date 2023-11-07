import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import React from 'react';

import { AddManufacturer, ManufacturerDetail } from '../app.types';
import { useAddManufacturer } from '../api/manufacturer';
import { AxiosError } from 'axios';

export interface AddManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  onChangeManufacturerDetails: (manufacturer: ManufacturerDetail) => void;
  manufacturer: ManufacturerDetail;
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

function AddManufacturerDialog(props: AddManufacturerDialogProps) {
  const { open, onClose, manufacturer, onChangeManufacturerDetails } = props;

  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const [URlerror, setURLError] = React.useState(false);
  const [URLErrorMessage, setURLErrorMessage] = React.useState<
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
  const [addresspostcodeError, setAddresspostcodeError] = React.useState(false);
  const [AddresspostcodeErrorMessage, setAddresspostcodeErrorMessage] =
    React.useState<string | undefined>(undefined);

  const { mutateAsync: addManufacturer } = useAddManufacturer();

  const handleClose = React.useCallback(() => {
    onChangeManufacturerDetails({
      name: '',
      url: '',
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
    setURLError(false);
    setURLErrorMessage(undefined);
    setAddressBuildingNumberError(false);
    setAddressBuildingNumberErrorMessage(undefined);
    setAddressStreetNameError(false);
    setaddressStreetNameErrorMessage(undefined);
    setAddresspostcodeError(false);
    setAddresspostcodeErrorMessage(undefined);
    onClose();
  }, [onClose, onChangeManufacturerDetails]);

  const handleManufacturer = React.useCallback(() => {
    let hasErrors = false;

    //check url is valid
    if (manufacturer.url) {
      if (!isValidUrl(manufacturer.url)) {
        hasErrors = true;
        setURLError(true);
        setURLErrorMessage('Please enter a valid URL');
      }
    }

    console.log(manufacturer.address);

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
      setAddresspostcodeError(true);
      setAddresspostcodeErrorMessage('Please enter a post code or zip code.');
    }

    if (hasErrors) {
      return;
    }

    const manufacturerToAdd: AddManufacturer = {
      name: manufacturer.name,
      url: manufacturer.url,
      address: {
        building_number: manufacturer.address.building_number,
        street_name: manufacturer.address.street_name,
        town: manufacturer.address.town,
        county: manufacturer.address.county,
        postcode: manufacturer.address.postcode,
      },
      telephone: manufacturer.telephone,
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
        }
      });
  }, [manufacturer, addManufacturer, handleClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Manufacturer</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={2}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required={true}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturer.name}
              onChange={(event) => {
                onChangeManufacturerDetails({
                  ...manufacturer,
                  name: event.target.value,
                });
                setNameError(false);
                setNameErrorMessage(undefined);
              }}
              error={nameError}
              helperText={nameError && nameErrorMessage}
              fullWidth
            ></TextField>
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
                setURLError(false);
                setURLErrorMessage(undefined);
              }}
              error={URlerror}
              helperText={URlerror && URLErrorMessage}
              fullWidth
            />
          </Grid>
          <Typography>Address</Typography>
          <Grid item>
            <TextField
              label="Building number"
              required={true}
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
              required={true}
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
              }}
              error={addressStreetNameError}
              helperText={
                addressStreetNameError && addressStreetNameErrorMessage
              }
              fullWidth
            />
          </Grid>
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
            }}
            fullWidth
          />
          <Grid item></Grid>
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
            }}
            fullWidth
          />
          <Grid item>
            <TextField
              label="Post/Zip code"
              required={true}
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
                setAddresspostcodeError(false);
                setAddresspostcodeErrorMessage(undefined);
              }}
              error={addresspostcodeError}
              helperText={addresspostcodeError && AddresspostcodeErrorMessage}
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
            onClick={handleManufacturer}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddManufacturerDialog;
