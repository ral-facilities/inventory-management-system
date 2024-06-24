import {
  Box,
  Button,
  CircularProgress,
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

import { AxiosError } from 'axios';
import {
  APIError,
  Manufacturer,
  ManufacturerPatch,
  ManufacturerPost,
} from '../api/api.types';
import {
  usePatchManufacturer,
  usePostManufacturer,
} from '../api/manufacturers';
import handleIMS_APIError from '../handleIMS_APIError';
import { trimStringValues } from '../utils';

export interface ManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
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
  } catch (_error) {
    return false;
  }
}

function ManufacturerDialog(props: ManufacturerDialogProps) {
  const { open, onClose, selectedManufacturer, type } = props;

  const [manufacturerDetails, setManufacturerDetails] =
    React.useState<ManufacturerPost>({
      name: '',
      url: null,
      address: {
        address_line: '',
        town: null,
        county: null,
        postcode: '',
        country: '',
      },
      telephone: null,
    });

  React.useEffect(() => {
    if (selectedManufacturer && type === 'edit')
      setManufacturerDetails(selectedManufacturer);
  }, [selectedManufacturer, open, type]);

  const [nameError, setNameError] = React.useState<string | undefined>(
    undefined
  );

  const [urlError, setUrlError] = React.useState<string | undefined>(undefined);

  const [addressLineError, setAddressLineError] = React.useState<
    string | undefined
  >(undefined);

  const [addressPostcodeError, setAddressPostcodeError] = React.useState<
    string | undefined
  >(undefined);

  const [countryError, setCountryError] = React.useState<string | undefined>(
    undefined
  );

  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: postManufacturer, isPending: isAddPending } =
    usePostManufacturer();
  const { mutateAsync: patchManufacturer, isPending: isEditPending } =
    usePatchManufacturer();

  const handleClose = React.useCallback(() => {
    setManufacturerDetails({
      name: '',
      url: null,
      address: {
        address_line: '',
        town: null,
        county: null,
        postcode: '',
        country: '',
      },
      telephone: null,
    });
    setNameError(undefined);
    setUrlError(undefined);
    setAddressLineError(undefined);
    setCountryError(undefined);
    setAddressPostcodeError(undefined);
    setFormError(undefined);
    onClose();
  }, [onClose, setManufacturerDetails]);

  const handleErrors = React.useCallback((): boolean => {
    let hasErrors = false;

    //check url is valid

    if (
      manufacturerDetails.url !== null &&
      !isValidUrl(manufacturerDetails.url ?? '')
    ) {
      if (manufacturerDetails.url?.trim()) {
        setUrlError('Please enter a valid URL');
        hasErrors = true;
      }
    }

    //check name
    if (
      !manufacturerDetails.name ||
      manufacturerDetails.name?.trim().length === 0
    ) {
      hasErrors = true;
      setNameError('Please enter a name.');
    }
    //check address line
    if (
      !manufacturerDetails.address?.address_line ||
      manufacturerDetails.address.address_line.trim().length === 0
    ) {
      hasErrors = true;

      setAddressLineError('Please enter an address.');
    }

    //check post code
    if (
      !manufacturerDetails.address?.postcode ||
      manufacturerDetails.address.postcode?.trim().length === 0
    ) {
      hasErrors = true;

      setAddressPostcodeError('Please enter a post code or zip code.');
    }
    //check country
    if (
      !manufacturerDetails.address?.country ||
      manufacturerDetails.address.country?.trim().length === 0
    ) {
      hasErrors = true;

      setCountryError('Please enter a country.');
    }

    return hasErrors;
  }, [manufacturerDetails]);

  const handleAddManufacturer = React.useCallback(() => {
    const hasErrors = handleErrors();

    if (hasErrors) {
      return;
    }

    const manufacturerToAdd: ManufacturerPost = {
      name: manufacturerDetails.name,
      url: manufacturerDetails.url ?? undefined,
      address: {
        address_line: manufacturerDetails.address.address_line,
        town: manufacturerDetails.address.town ?? null,
        county: manufacturerDetails.address.county ?? null,
        postcode: manufacturerDetails.address.postcode,
        country: manufacturerDetails.address.country,
      },
      telephone: manufacturerDetails.telephone ?? null,
    };

    postManufacturer(trimStringValues(manufacturerToAdd))
      .then(() => handleClose())
      .catch((error: AxiosError) => {
        if (error.response?.status === 409) {
          setNameError('A manufacturer with the same name already exists.');
          return;
        }
        handleIMS_APIError(error);
      });
  }, [handleErrors, manufacturerDetails, postManufacturer, handleClose]);

  const handleEditManufacturer = React.useCallback(() => {
    if (manufacturerDetails && selectedManufacturer) {
      const hasErrors = handleErrors();

      if (hasErrors) {
        return;
      }

      const isNameUpdated =
        manufacturerDetails.name !== selectedManufacturer.name;

      const isURLUpdated =
        manufacturerDetails.url !== selectedManufacturer.url &&
        manufacturerDetails.url !== undefined;

      const isAddressLineUpdated =
        manufacturerDetails.address?.address_line !==
        selectedManufacturer.address.address_line;

      const isTownUpdated =
        manufacturerDetails.address?.town !== selectedManufacturer.address.town;

      const isCountyUpdated =
        manufacturerDetails.address?.county !==
        selectedManufacturer.address.county;

      const isPostcodeUpdated =
        manufacturerDetails.address?.postcode !==
        selectedManufacturer.address.postcode;

      const isCountryUpdated =
        manufacturerDetails.address?.country !==
        selectedManufacturer.address.country;

      const isTelephoneUpdated =
        manufacturerDetails.telephone !== selectedManufacturer.telephone;

      let manufacturerToEdit: ManufacturerPatch = {};

      isNameUpdated && (manufacturerToEdit.name = manufacturerDetails.name);
      isURLUpdated && (manufacturerToEdit.url = manufacturerDetails.url);

      if (isAddressLineUpdated) {
        manufacturerToEdit = {
          ...manufacturerToEdit,
          address: {
            ...manufacturerDetails.address,
            address_line: manufacturerDetails.address?.address_line,
          },
        };
      }
      if (isTownUpdated) {
        manufacturerToEdit = {
          ...manufacturerToEdit,
          address: {
            ...manufacturerDetails.address,
            town: manufacturerDetails.address?.town,
          },
        };
      }
      if (isCountyUpdated) {
        manufacturerToEdit = {
          ...manufacturerToEdit,
          address: {
            ...manufacturerDetails.address,
            county: manufacturerDetails.address?.county,
          },
        };
      }
      if (isPostcodeUpdated) {
        manufacturerToEdit = {
          ...manufacturerToEdit,
          address: {
            ...manufacturerDetails.address,
            postcode: manufacturerDetails.address?.postcode,
          },
        };
      }
      if (isCountryUpdated) {
        manufacturerToEdit = {
          ...manufacturerToEdit,
          address: {
            ...manufacturerDetails.address,
            country: manufacturerDetails.address?.country,
          },
        };
      }

      isTelephoneUpdated &&
        (manufacturerToEdit.telephone = manufacturerDetails.telephone);

      if (
        isNameUpdated ||
        isURLUpdated ||
        isAddressLineUpdated ||
        isTownUpdated ||
        isCountyUpdated ||
        isPostcodeUpdated ||
        isCountryUpdated ||
        isTelephoneUpdated
      ) {
        patchManufacturer({
          id: selectedManufacturer.id,
          manufacturer: trimStringValues(manufacturerToEdit),
        })
          .then(() => handleClose())
          .catch((error: AxiosError) => {
            const response = error.response?.data as APIError;
            if (response && error.response?.status === 409) {
              setNameError(
                'A manufacturer with the same name has been found. Please enter a different name'
              );
              return;
            }

            handleIMS_APIError(error);
          });
      } else {
        setFormError(
          "There have been no changes made. Please change a field's value or press Cancel to exit"
        );
      }
    }
  }, [
    patchManufacturer,
    handleClose,
    handleErrors,
    manufacturerDetails,
    selectedManufacturer,
  ]);

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>{`${
        type === 'create' ? 'Add' : 'Edit'
      } Manufacturer`}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              id="manufacturer-name-input"
              label="Name"
              required={true}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.name}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  name: event.target.value,
                });
                setNameError(undefined);
                setFormError(undefined);
              }}
              error={nameError !== undefined}
              helperText={nameError}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-url-input"
              label="URL"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.url ?? ''}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  url:
                    event.target.value.trim() === ''
                      ? null
                      : event.target.value,
                });

                setUrlError(undefined);
                setFormError(undefined);
              }}
              error={urlError !== undefined}
              helperText={urlError}
              fullWidth
            />
          </Grid>
          <Grid item>
            <Typography>Address</Typography>
          </Grid>

          <Grid item>
            <TextField
              id="manufacturer-address-line-input"
              label="Address Line"
              required={true}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.address.address_line}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  address: {
                    ...manufacturerDetails.address,
                    address_line: event.target.value,
                  },
                });

                setAddressLineError(undefined);

                setFormError(undefined);
              }}
              error={addressLineError !== undefined}
              helperText={addressLineError && addressLineError}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-town-input"
              label="Town"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.address.town ?? ''}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  address: {
                    ...manufacturerDetails.address,
                    town: event.target.value || null,
                  },
                });

                setFormError(undefined);
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-county-input"
              label="County"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.address.county ?? ''}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  address: {
                    ...manufacturerDetails.address,
                    county: event.target.value || null,
                  },
                });

                setFormError(undefined);
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-country-input"
              label="Country"
              required={true}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.address.country}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  address: {
                    ...manufacturerDetails.address,
                    country: event.target.value,
                  },
                });

                setCountryError(undefined);

                setFormError(undefined);
              }}
              error={countryError !== undefined}
              helperText={countryError}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-postcode-input"
              label="Post/Zip code"
              required={true}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.address.postcode}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  address: {
                    ...manufacturerDetails.address,
                    postcode: event.target.value,
                  },
                });

                setAddressPostcodeError(undefined);

                setFormError(undefined);
              }}
              error={addressPostcodeError !== undefined}
              helperText={addressPostcodeError}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-telephone-input"
              label="Telephone number"
              required={false}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={manufacturerDetails.telephone ?? ''}
              onChange={(event) => {
                setManufacturerDetails({
                  ...manufacturerDetails,
                  telephone: event.target.value || null,
                });

                setFormError(undefined);
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
            disabled={
              isAddPending ||
              isEditPending ||
              formError !== undefined ||
              nameError !== undefined ||
              urlError !== undefined ||
              addressLineError !== undefined ||
              addressPostcodeError !== undefined ||
              countryError !== undefined
            }
            endIcon={
              isAddPending || isEditPending ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            Save
          </Button>
        </Box>
        {formError && (
          <FormHelperText sx={{ marginBottom: '16px' }} error>
            {formError}
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ManufacturerDialog;
