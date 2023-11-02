import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material';

import React from 'react';

import {
  AddManufacturer,
  EditManufacturer,
  ErrorParsing,
  Manufacturer,
  ManufacturerDetail,
} from '../app.types';
import {
  useAddManufacturer,
  useEditManufacturer,
  useManufacturerById,
} from '../api/manufacturer';
import { AxiosError } from 'axios';

export interface ManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  onChangeManufacturerDetails: (manufacturer: ManufacturerDetail) => void;
  manufacturer: ManufacturerDetail;
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
  const [URlerror, setURLError] = React.useState(false);
  const [URLErrorMessage, setURLErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const [addressLineError, setAddressLineError] = React.useState(false);
  const [addressLineErrorMessage, setAddressLineErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const [addresspostcodeError, setAddresspostcodeError] = React.useState(false);
  const [AddresspostcodeErrorMessage, setAddresspostcodeErrorMessage] =
    React.useState<string | undefined>(undefined);
  const [countryError, setCountryError] = React.useState(false);
  const [countryErrorMessage, setCountryErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const [formError, setFormError] = React.useState(false);
  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const { mutateAsync: addManufacturer } = useAddManufacturer();
  const { mutateAsync: editManufacturer } = useEditManufacturer();
  const { data: selectedManufacturerData } = useManufacturerById(
    selectedManufacturer?.id
  );

  const handleClose = React.useCallback(() => {
    onChangeManufacturerDetails({
      name: '',
      url: undefined,
      address: {
        address_line: '',
        town: '',
        county: '',
        postcode: '',
        country: '',
      },
      telephone: '',
    });
    setNameError(false);
    setNameErrorMessage(undefined);
    setURLError(false);
    setURLErrorMessage(undefined);
    setAddressLineError(false);
    setAddressLineErrorMessage(undefined);
    setCountryError(false);
    setCountryErrorMessage(undefined);
    setAddresspostcodeError(false);
    setAddresspostcodeErrorMessage(undefined);
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
        setURLError(true);
        setURLErrorMessage('Please enter a valid URL');
      }
    }

    //check name
    if (!manufacturer.name || manufacturer.name?.trim().length === 0) {
      hasErrors = true;
      setNameError(true);
      setNameErrorMessage('Please enter a name.');
    }
    //check address line
    if (
      !manufacturer.address?.address_line ||
      manufacturer.address.address_line.trim().length === 0
    ) {
      hasErrors = true;
      setAddressLineError(true);
      setAddressLineErrorMessage('Please enter an address.');
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
    //check country
    if (
      !manufacturer.address?.country ||
      manufacturer.address.country?.trim().length === 0
    ) {
      hasErrors = true;
      setCountryError(true);
      setCountryErrorMessage('Please enter a country.');
    }

    return hasErrors;
  }, [manufacturer]);

  const handleAddManufacturer = React.useCallback(() => {
    const hasErrors = handleErrors();

    if (hasErrors) {
      return;
    }

    const manufacturerToAdd: AddManufacturer = {
      name: manufacturer.name,
      url: manufacturer.url,
      address: {
        address_line: manufacturer.address.address_line,
        town: manufacturer.address.town,
        county: manufacturer.address.county,
        postcode: manufacturer.address.postcode,
        country: manufacturer.address.country,
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
      const isAddressLineUpdated =
        manufacturer.address?.address_line !==
        selectedManufacturer.address.address_line;
      const isTownUpdated =
        manufacturer.address?.town !== selectedManufacturer.address.town;
      const isCountyUpdated =
        manufacturer.address?.county !== selectedManufacturer.address.county;
      const isPostcodeUpdated =
        manufacturer.address?.postcode !==
        selectedManufacturer.address.postcode;
      const isCountryUpdated =
        manufacturer.address?.country !== selectedManufacturer.address.country;
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
      if (isAddressLineUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...manufacturer.address,
            address_line: manufacturer.address?.address_line,
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
      if (isPostcodeUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...manufacturer.address,
            postcode: manufacturer.address?.postcode,
          },
        };
      }
      if (isCountryUpdated) {
        ManufacturerToEdit = {
          ...ManufacturerToEdit,
          address: {
            ...ManufacturerToEdit.address,
            country: manufacturer.address?.country,
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
        isAddressLineUpdated ||
        isTownUpdated ||
        isCountyUpdated ||
        isPostcodeUpdated ||
        isCountryUpdated ||
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
            setFormError(false);
            setFormErrorMessage(undefined);
          }}
          error={URlerror}
          helperText={URlerror && URLErrorMessage}
          fullWidth
        />
        <Typography>Address</Typography>
        <TextField
          label="Country"
          required={type === 'create' ? true : false}
          sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
          value={manufacturer.address.country}
          onChange={(event) => {
            onChangeManufacturerDetails({
              ...manufacturer,
              address: {
                ...manufacturer.address,
                country: event.target.value,
              },
            });
            setCountryError(false);
            setCountryErrorMessage(undefined);
            setFormError(false);
            setFormErrorMessage(undefined);
          }}
          error={countryError}
          helperText={countryError && countryErrorMessage}
          fullWidth
        />
        <TextField
          label="Address Line"
          required={type === 'create' ? true : false}
          sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
          value={manufacturer.address.address_line}
          onChange={(event) => {
            onChangeManufacturerDetails({
              ...manufacturer,
              address: {
                ...manufacturer.address,
                address_line: event.target.value,
              },
            });
            setAddressLineError(false);
            setAddressLineErrorMessage(undefined);
            setFormError(false);
            setFormErrorMessage(undefined);
          }}
          error={addressLineError}
          helperText={addressLineError && addressLineErrorMessage}
          fullWidth
        />
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
            setAddresspostcodeError(false);
            setAddresspostcodeErrorMessage(undefined);
            setFormError(false);
            setFormErrorMessage(undefined);
          }}
          error={addresspostcodeError}
          helperText={addresspostcodeError && AddresspostcodeErrorMessage}
          fullWidth
        />
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
      </DialogActions>
    </Dialog>
  );
}

export default ManufacturerDialog;
