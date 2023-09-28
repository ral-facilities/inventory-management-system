import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
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

  const [addressError, setAddressError] = React.useState(false);
  const [AddressErrorMessage, setAddressErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const { mutateAsync: addManufacturer } = useAddManufacturer();

  const [manufacturerName, setManufacturerName] = React.useState<
    string | undefined
  >(undefined);
  const [manufacturerURL, setManufacturerURL] = React.useState<
    string | undefined
  >(undefined);
  const [manufacturerAddress, setManufacturerAddress] = React.useState<
    string | undefined
  >(undefined);

  const handleClose = React.useCallback(() => {
    onClose();
    setNameError(false);
    setNameErrorMessage(undefined);
    setManufacturerName(undefined);
    setManufacturerURL(undefined);
    setManufacturerAddress(undefined);
    refetchData();
  }, [onClose, refetchData]);

  const handleManufacturer = React.useCallback(() => {
    let hasErrors = false;
    let manufacturer: AddManufacturer;
    manufacturer = {
      name: manufacturerName,
      url: manufacturerURL,
      address: manufacturerAddress,
    };
    //check url is valid
    if (!manufacturer.url?.trim() || !isValidUrl(manufacturer.url)) {
      hasErrors = true;
      setURLError(true);
      setURLErrorMessage(
        !manufacturer.url?.trim()
          ? 'Please enter a URL.'
          : 'Please enter a valid URL'
      );
    }

    if (!manufacturerName || manufacturerName?.trim().length === 0) {
      hasErrors = true;
      setNameError(true);
      setNameErrorMessage('Please enter a name.');
    }
    if (!manufacturerURL || manufacturerURL?.trim().length === 0) {
      hasErrors = true;
      setURLError(true);
      setURLErrorMessage('Please enter a URL.');
    }
    if (!manufacturerAddress || manufacturerAddress?.trim().length === 0) {
      hasErrors = true;
      setAddressError(true);
      setAddressErrorMessage('Please enter an address.');
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
    addManufacturer,
    manufacturerName,
    manufacturerURL,
    manufacturerAddress,
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
          required={true}
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
        <TextField
          label="Address"
          required={true}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddress}
          error={addressError}
          helperText={addressError && AddressErrorMessage}
          onChange={(event) => {
            setManufacturerAddress(
              event.target.value ? event.target.value : ''
            );
            setAddressError(false);
            setAddressErrorMessage(undefined);
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
