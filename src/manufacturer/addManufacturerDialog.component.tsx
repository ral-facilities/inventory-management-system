import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

import React from 'react';

import { AddManufacturer } from '../app.types';
import { useAddManufacturer } from '../api/manufacturer';
import { AxiosError } from 'axios';

export interface AddManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  refetchData: () => void;
}
function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function AddManufacturerDialog(props: AddManufacturerDialogProps) {
  const { open, onClose, refetchData } = props;

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

  const [addressPostCodeError, setAddressPostCodeError] = React.useState(false);
  const [AddressPostCodeErrorMessage, setAddressPostCodeErrorMessage] =
    React.useState<string | undefined>(undefined);

  const { mutateAsync: addManufacturer } = useAddManufacturer();

  const [manufacturerName, setManufacturerName] = React.useState<
    string | undefined
  >(undefined);
  const [manufacturerURL, setManufacturerURL] = React.useState<
    string | undefined | null
  >(undefined);

  const [
    manufacturerAddressBuildingNumber,
    setManufacturerAddressBuildingNumber,
  ] = React.useState<string | undefined>(undefined);
  const [manufacturerAddressStreetName, setManufacturerAddressStreetName] =
    React.useState<string | undefined>(undefined);
  const [manufacturerAddressTown, setManufacturerAddressTown] = React.useState<
    string | undefined | null
  >(undefined);
  const [manufacturerAddressCounty, setManufacturerAddressCounty] =
    React.useState<string | undefined | null>(undefined);
  const [manufacturerAddressPostCode, setManufacturerAddressPostCode] =
    React.useState<string | undefined>(undefined);

  const [manufacturerTelephone, setManufacturerTelephone] = React.useState<
    string | undefined | null
  >(undefined);

  const handleClose = React.useCallback(() => {
    onClose();
    setNameError(false);
    setNameErrorMessage(undefined);
    setManufacturerName(undefined);
    setManufacturerURL(undefined);
    setManufacturerAddressBuildingNumber(undefined);
    setManufacturerAddressStreetName(undefined);
    setManufacturerAddressTown(undefined);
    setManufacturerAddressCounty(undefined);
    setManufacturerAddressPostCode(undefined);
    setManufacturerTelephone(undefined);
    refetchData();
  }, [onClose, refetchData]);

  const handleManufacturer = React.useCallback(() => {
    let hasErrors = false;
    let manufacturer: AddManufacturer;
    manufacturer = {
      name: manufacturerName,
      url: manufacturerURL ? manufacturerURL : null,
      address: {
        building_number: manufacturerAddressBuildingNumber,
        street_name: manufacturerAddressStreetName,
        town: manufacturerAddressTown ? manufacturerAddressTown : null,
        county: manufacturerAddressCounty ? manufacturerAddressCounty : null,
        postCode: manufacturerAddressPostCode,
      },
      telephone: manufacturerTelephone ? manufacturerTelephone : null,
    };
    //check url is valid
    if (manufacturer.url) {
      if (!isValidUrl(manufacturer.url)) {
        hasErrors = true;
        setURLError(true);
        setURLErrorMessage('Please enter a valid URL');
      }
    }

    if (!manufacturerName || manufacturerName?.trim().length === 0) {
      hasErrors = true;
      setNameError(true);
      setNameErrorMessage('Please enter a name.');
    }

    if (
      !manufacturerAddressBuildingNumber ||
      manufacturerAddressBuildingNumber.trim().length === 0
    ) {
      hasErrors = true;
      setAddressBuildingNumberError(true);
      setAddressBuildingNumberErrorMessage('Please enter a building number.');
    }
    if (
      !manufacturerAddressStreetName ||
      manufacturerAddressStreetName?.trim().length === 0
    ) {
      hasErrors = true;
      setAddressStreetNameError(true);
      setaddressStreetNameErrorMessage('Please enter a street name.');
    }
    if (
      !manufacturerAddressPostCode ||
      manufacturerAddressPostCode?.trim().length === 0
    ) {
      hasErrors = true;
      setAddressPostCodeError(true);
      setAddressPostCodeErrorMessage('Please enter a post code or zip code.');
    }

    if (hasErrors) {
      return;
    }

    addManufacturer(manufacturer)
      .then((response) => handleClose())
      .catch((error: AxiosError) => {
        console.log(error.response?.status, manufacturerName);

        if (error.response?.status === 409) {
          setNameError(true);
          setNameErrorMessage(
            'A manufacturer with the same name already exists.'
          );
        }
      });
  }, [
    manufacturerName,
    manufacturerURL,
    manufacturerAddressBuildingNumber,
    manufacturerAddressStreetName,
    manufacturerAddressTown,
    manufacturerAddressCounty,
    manufacturerAddressPostCode,
    manufacturerTelephone,
    addManufacturer,
    handleClose,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Manufacturer</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          required={true}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerName}
          error={nameError}
          helperText={nameError && nameErrorMessage}
          onChange={(event) => {
            setManufacturerName(event.target.value ? event.target.value : '');
            setNameError(false);
            setNameErrorMessage(undefined);
          }}
          fullWidth
        />
        <TextField
          label="URL"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerURL}
          error={URlerror}
          helperText={URlerror && URLErrorMessage}
          onChange={(event) => {
            setManufacturerURL(event.target.value ? event.target.value : '');
            setURLError(false);
            setURLErrorMessage(undefined);
          }}
          fullWidth
        />
        <Typography>Address</Typography>
        <TextField
          label="Building number"
          required={true}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressBuildingNumber}
          error={addressBuildingNumberError}
          helperText={
            addressBuildingNumberError && addressBuildingNumberErrorMessage
          }
          onChange={(event) => {
            setManufacturerAddressBuildingNumber(
              event.target.value ? event.target.value : ''
            );
            setAddressBuildingNumberError(false);
            setAddressBuildingNumberErrorMessage(undefined);
          }}
          fullWidth
        />
        <TextField
          label="Street name"
          required={true}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressStreetName}
          error={addressStreetNameError}
          helperText={addressStreetNameError && addressStreetNameErrorMessage}
          onChange={(event) => {
            setManufacturerAddressStreetName(
              event.target.value ? event.target.value : ''
            );
            setAddressStreetNameError(false);
            setaddressStreetNameErrorMessage(undefined);
          }}
          fullWidth
        />
        <TextField
          label="Town"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressTown}
          onChange={(event) => {
            setManufacturerAddressTown(
              event.target.value ? event.target.value : ''
            );
          }}
          fullWidth
        />
        <TextField
          label="County"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressCounty}
          onChange={(event) => {
            setManufacturerAddressCounty(
              event.target.value ? event.target.value : ''
            );
          }}
          fullWidth
        />
        <TextField
          label="Post/Zip code"
          required={true}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressPostCode}
          error={addressPostCodeError}
          helperText={addressPostCodeError && AddressPostCodeErrorMessage}
          onChange={(event) => {
            setManufacturerAddressPostCode(
              event.target.value ? event.target.value : ''
            );
            setAddressPostCodeError(false);
            setAddressPostCodeErrorMessage(undefined);
          }}
          fullWidth
        />
        <TextField
          label="Telephone number"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerTelephone}
          onChange={(event) => {
            setManufacturerTelephone(
              event.target.value ? event.target.value : ''
            );
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
