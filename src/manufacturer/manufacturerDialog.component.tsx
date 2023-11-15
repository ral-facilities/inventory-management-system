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
  Manufacturer,
  EditManufacturer,
  ErrorParsing,
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
  const { open, onClose, manufacturer, onChangeManufacturerDetails, type } =
    props;

  const [nameErrorMessage, setNameErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const nameError = nameErrorMessage !== undefined;

  const [urlErrorMessage, setUrlErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const urlError = urlErrorMessage !== undefined;

  const [addressLineErrorMessage, setAddressLineErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const addressLineError = addressLineErrorMessage !== undefined;

  const [addressPostcodeErrorMessage, setAddressPostcodeErrorMessage] =
    React.useState<string | undefined>(undefined);
  const addressPostcodeError = addressPostcodeErrorMessage !== undefined;

  const [countryErrorMessage, setCountryErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const countryError = countryErrorMessage !== undefined;

  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);
  const formError = formErrorMessage !== undefined;

  const [catchAllError, setCatchAllError] = React.useState(false);

  const { mutateAsync: addManufacturer } = useAddManufacturer();
  const { mutateAsync: editManufacturer } = useEditManufacturer();
  const { data: selectedManufacturerData } = useManufacturer(manufacturer?.id);

  const handleClose = React.useCallback(() => {
    onChangeManufacturerDetails({
      name: '',
      url: undefined,
      address: {
        address_line: '',
        town: null,
        county: null,
        postcode: '',
        country: '',
      },
      telephone: null,
    });
    setNameErrorMessage(undefined);
    setUrlErrorMessage(undefined);
    setAddressLineErrorMessage(undefined);
    setCountryErrorMessage(undefined);
    setAddressPostcodeErrorMessage(undefined);
    setFormErrorMessage(undefined);
    onClose();
  }, [onClose, onChangeManufacturerDetails]);

  const handleErrors = React.useCallback((): boolean => {
    let hasErrors = false;

    //check url is valid
    if (manufacturer.url || manufacturer.url?.trim().length === 0) {
      if (!isValidUrl(manufacturer.url)) {
        hasErrors = true;
        setUrlErrorMessage('Please enter a valid URL');
      }
    }

    //check name
    if (!manufacturer.name || manufacturer.name?.trim().length === 0) {
      hasErrors = true;
      setNameErrorMessage('Please enter a name.');
    }
    //check address line
    if (
      !manufacturer.address?.address_line ||
      manufacturer.address.address_line.trim().length === 0
    ) {
      hasErrors = true;

      setAddressLineErrorMessage('Please enter an address.');
    }

    //check post code
    if (
      !manufacturer.address?.postcode ||
      manufacturer.address.postcode?.trim().length === 0
    ) {
      hasErrors = true;

      setAddressPostcodeErrorMessage('Please enter a post code or zip code.');
    }
    //check country
    if (
      !manufacturer.address?.country ||
      manufacturer.address.country?.trim().length === 0
    ) {
      hasErrors = true;

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
      url: manufacturer.url ?? undefined,
      address: {
        address_line: manufacturer.address.address_line,
        town: manufacturer.address.town ?? null,
        county: manufacturer.address.county ?? null,
        postcode: manufacturer.address.postcode,
        country: manufacturer.address.country,
      },
      telephone: manufacturer.telephone ?? null,
    };

    addManufacturer(manufacturerToAdd)
      .then((response) => handleClose())
      .catch((error: AxiosError) => {
        console.log(error.response?.status, manufacturer.name);

        if (error.response?.status === 409) {
          setNameErrorMessage(
            'A manufacturer with the same name already exists.'
          );
          return;
        }
        setCatchAllError(true);
      });
  }, [handleErrors, manufacturer, addManufacturer, handleClose]);

  const handleEditManufacturer = React.useCallback(() => {
    if (manufacturer && selectedManufacturerData) {
      const hasErrors = handleErrors();

      if (hasErrors) {
        return;
      }

      const isNameUpdated = manufacturer.name !== selectedManufacturerData.name;

      const isURLUpdated =
        manufacturer.url !== selectedManufacturerData.url &&
        manufacturer.url !== undefined;

      const isAddressLineUpdated =
        manufacturer.address?.address_line !==
        selectedManufacturerData.address.address_line;

      const isTownUpdated =
        manufacturer.address?.town !== selectedManufacturerData.address.town;

      const isCountyUpdated =
        manufacturer.address?.county !==
        selectedManufacturerData.address.county;

      const isPostcodeUpdated =
        manufacturer.address?.postcode !==
        selectedManufacturerData.address.postcode;

      const isCountryUpdated =
        manufacturer.address?.country !==
        selectedManufacturerData.address.country;

      const isTelephoneUpdated =
        manufacturer.telephone !== selectedManufacturerData.telephone;

      let ManufacturerToEdit: EditManufacturer = {
        id: selectedManufacturerData?.id,
      };

      isNameUpdated && (ManufacturerToEdit.name = manufacturer.name);
      isURLUpdated && (ManufacturerToEdit.url = manufacturer.url);

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
            ...manufacturer.address,
            country: manufacturer.address?.country,
          },
        };
      }

      isTelephoneUpdated &&
        (ManufacturerToEdit.telephone = manufacturer.telephone);

      if (
        (selectedManufacturerData.id && isNameUpdated) ||
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
              setNameErrorMessage(
                'A manufacturer with the same name has been found. Please enter a different name'
              );
              return;
            }
            setCatchAllError(true);
          });
      } else {
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
    selectedManufacturerData,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{`${
        type === 'create' ? 'Add' : 'Edit'
      } Manufacturer`}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
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
                setNameErrorMessage(undefined);
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

                setUrlErrorMessage(undefined);

                setFormErrorMessage(undefined);
              }}
              error={urlError}
              helperText={urlError && urlErrorMessage}
              fullWidth
            />
          </Grid>
          <Grid item>
            <Typography>Address</Typography>
          </Grid>

          <Grid item>
            <TextField
              label="Address Line"
              required={true}
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

                setAddressLineErrorMessage(undefined);

                setFormErrorMessage(undefined);
              }}
              error={addressLineError}
              helperText={addressLineError && addressLineErrorMessage}
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
                    town: event.target.value || null,
                  },
                });

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
                    county: event.target.value || null,
                  },
                });

                setFormErrorMessage(undefined);
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Country"
              required={true}
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

                setCountryErrorMessage(undefined);

                setFormErrorMessage(undefined);
              }}
              error={countryError}
              helperText={countryError && countryErrorMessage}
              fullWidth
            />
          </Grid>
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

                setAddressPostcodeErrorMessage(undefined);

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
                  telephone: event.target.value || null,
                });

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
