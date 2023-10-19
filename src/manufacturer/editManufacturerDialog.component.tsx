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

import { AddManufacturer, EditManufacturer } from '../app.types';
import { useAddManufacturer, useEditManufacturer } from '../api/manufacturer';
import { AxiosError } from 'axios';

export interface EditManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  refetchData: () => void;
  id: string;
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function EditManufacturerDialog(props: EditManufacturerDialogProps) {
  const { open, onClose, refetchData, id } = props;

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

  const { mutateAsync: editManufacturer } = useEditManufacturer();

  const [manufacturerName, setManufacturerName] = React.useState<string | null>(
    null
  );
  const [manufacturerURL, setManufacturerURL] = React.useState<string | null>(
    null
  );

  const [
    manufacturerAddressBuildingNumber,
    setManufacturerAddressBuildingNumber,
  ] = React.useState<string | null>(null);
  const [manufacturerAddressStreetName, setManufacturerAddressStreetName] =
    React.useState<string | null>(null);
  const [manufacturerAddressTown, setManufacturerAddressTown] = React.useState<
    string | null
  >(null);
  const [manufacturerAddressCounty, setManufacturerAddressCounty] =
    React.useState<string | null>(null);
  const [manufacturerAddressPostCode, setManufacturerAddressPostCode] =
    React.useState<string | null>(null);

  const [manufacturerTelephone, setManufacturerTelephone] = React.useState<
    string | null
  >(null);

  const handleClose = React.useCallback(() => {
    onClose();
    setNameError(false);
    setNameErrorMessage(undefined);
    setManufacturerName(null);
    setManufacturerURL(null);
    setManufacturerAddressBuildingNumber(null);
    setManufacturerAddressStreetName(null);
    setManufacturerAddressTown(null);
    setManufacturerAddressCounty(null);
    setManufacturerAddressPostCode(null);
    setManufacturerTelephone(null);
    refetchData();
  }, [onClose, refetchData]);

  const handleManufacturer = React.useCallback(() => {
    let manufacturer: EditManufacturer;
    manufacturer = {
      name: manufacturerName,
      url: manufacturerURL,
      address: {
        building_number: manufacturerAddressBuildingNumber,
        street_name: manufacturerAddressStreetName,
        town: manufacturerAddressTown,
        county: manufacturerAddressCounty,
        postCode: manufacturerAddressPostCode,
      },
      telephone: manufacturerTelephone,
      id: id,
    };
    console.log(manufacturerName);
    //check url is valid
    if (manufacturer.url) {
      if (!isValidUrl(manufacturer.url)) {
        setURLError(true);
        setURLErrorMessage('Please enter a valid URL');
        return;
      }
    }

    editManufacturer(manufacturer)
      .then((reponse) => handleClose())
      .catch((error: AxiosError) => {
        console.log(error.response?.status);

        if (error.response?.status === 422) {
          console.log('422 error');
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
    id,
    editManufacturer,
    handleClose,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Manufacturer</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerName}
          error={nameError}
          helperText={nameError && nameErrorMessage}
          onChange={(event) => {
            setManufacturerName(event.target.value ? event.target.value : null);
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
            setManufacturerURL(event.target.value ? event.target.value : null);
            setURLError(false);
            setURLErrorMessage(undefined);
          }}
          fullWidth
        />
        <Typography>Address</Typography>
        <TextField
          label="Building number"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressBuildingNumber}
          error={addressBuildingNumberError}
          helperText={
            addressBuildingNumberError && addressBuildingNumberErrorMessage
          }
          onChange={(event) => {
            setManufacturerAddressBuildingNumber(
              event.target.value ? event.target.value : null
            );
          }}
          fullWidth
        />
        <TextField
          label="Street name"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressStreetName}
          error={addressStreetNameError}
          helperText={addressStreetNameError && addressStreetNameErrorMessage}
          onChange={(event) => {
            setManufacturerAddressStreetName(
              event.target.value ? event.target.value : null
            );
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
              event.target.value ? event.target.value : null
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
              event.target.value ? event.target.value : null
            );
          }}
          fullWidth
        />
        <TextField
          label="Post/Zip code"
          required={false}
          sx={{ marginLeft: '4px', padding: '8px' }} // Adjusted the width and margin
          value={manufacturerAddressPostCode}
          error={addressPostCodeError}
          helperText={addressPostCodeError && AddressPostCodeErrorMessage}
          onChange={(event) => {
            setManufacturerAddressPostCode(
              event.target.value ? event.target.value : null
            );
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
              event.target.value ? event.target.value : null
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

export default EditManufacturerDialog;
