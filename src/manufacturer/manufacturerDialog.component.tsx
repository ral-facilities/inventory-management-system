import { zodResolver } from '@hookform/resolvers/zod';
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
import { useForm } from 'react-hook-form';

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
import { ManufacturerSchema, RequestType } from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';

export interface ManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  selectedManufacturer?: Manufacturer;
  type: RequestType;
}

function ManufacturerDialog(props: ManufacturerDialogProps) {
  const { open, onClose, selectedManufacturer, type } = props;

  const { mutateAsync: postManufacturer, isPending: isAddPending } =
    usePostManufacturer();
  const { mutateAsync: patchManufacturer, isPending: isEditPending } =
    usePatchManufacturer();

  const isNotCreating = type !== 'post' && selectedManufacturer;

  const initialManufacturer: ManufacturerPost = React.useMemo(
    () =>
      isNotCreating
        ? selectedManufacturer
        : {
            name: '',
            url: '',
            telephone: '',
            address: {
              address_line: '',
              town: '',
              county: '',
              postcode: '',
              country: '',
            },
          },
    [isNotCreating, selectedManufacturer]
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    reset,
  } = useForm<ManufacturerPost>({
    resolver: zodResolver(ManufacturerSchema(type)),
    defaultValues: initialManufacturer,
  });

  // Load the values for editing
  React.useEffect(() => {
    reset(initialManufacturer);
  }, [initialManufacturer, reset]);

  React.useEffect(() => {
    if (errors.root?.formError) {
      const subscription = watch(() => clearErrors('root.formError'));
      return () => subscription.unsubscribe();
    }
  }, [clearErrors, errors, selectedManufacturer, watch]);

  const handleClose = React.useCallback(() => {
    clearErrors();
    onClose();
  }, [clearErrors, onClose]);

  const handleAddManufacturer = React.useCallback(
    (manufacturerData: ManufacturerPost) => {
      postManufacturer(manufacturerData)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 409) {
            setError('name', {
              message:
                'A manufacturer with the same name has been found. Please enter a different name.',
            });
            return;
          }
          handleIMS_APIError(error);
        });
    },
    [postManufacturer, handleClose, setError]
  );

  const handleEditManufacturer = React.useCallback(
    (manufacturerData: ManufacturerPost) => {
      if (selectedManufacturer) {
        const isNameUpdated =
          manufacturerData.name !== selectedManufacturer.name;

        const isURLUpdated =
          manufacturerData.url !== selectedManufacturer.url &&
          manufacturerData.url !== undefined;

        const isAddressLineUpdated =
          manufacturerData.address?.address_line !==
          selectedManufacturer.address.address_line;

        const isTownUpdated =
          manufacturerData.address?.town !== selectedManufacturer.address.town;

        const isCountyUpdated =
          manufacturerData.address?.county !==
          selectedManufacturer.address.county;

        const isPostcodeUpdated =
          manufacturerData.address?.postcode !==
          selectedManufacturer.address.postcode;

        const isCountryUpdated =
          manufacturerData.address?.country !==
          selectedManufacturer.address.country;

        const isTelephoneUpdated =
          manufacturerData.telephone !== selectedManufacturer.telephone;

        let manufacturerToEdit: ManufacturerPatch = {};

        isNameUpdated && (manufacturerToEdit.name = manufacturerData.name);
        isURLUpdated && (manufacturerToEdit.url = manufacturerData.url);

        if (isAddressLineUpdated) {
          manufacturerToEdit = {
            ...manufacturerToEdit,
            address: {
              ...manufacturerData.address,
              address_line: manufacturerData.address?.address_line,
            },
          };
        }
        if (isTownUpdated) {
          manufacturerToEdit = {
            ...manufacturerToEdit,
            address: {
              ...manufacturerData.address,
              town: manufacturerData.address?.town,
            },
          };
        }
        if (isCountyUpdated) {
          manufacturerToEdit = {
            ...manufacturerToEdit,
            address: {
              ...manufacturerData.address,
              county: manufacturerData.address?.county,
            },
          };
        }
        if (isPostcodeUpdated) {
          manufacturerToEdit = {
            ...manufacturerToEdit,
            address: {
              ...manufacturerData.address,
              postcode: manufacturerData.address?.postcode,
            },
          };
        }
        if (isCountryUpdated) {
          manufacturerToEdit = {
            ...manufacturerToEdit,
            address: {
              ...manufacturerData.address,
              country: manufacturerData.address?.country,
            },
          };
        }

        isTelephoneUpdated &&
          (manufacturerToEdit.telephone = manufacturerData.telephone);

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
            manufacturer: manufacturerToEdit,
          })
            .then(() => handleClose())
            .catch((error: AxiosError) => {
              const response = error.response?.data as APIError;
              if (response && error.response?.status === 409) {
                setError('name', {
                  message:
                    'A manufacturer with the same name has been found. Please enter a different name.',
                });
                return;
              }

              handleIMS_APIError(error);
            });
        } else {
          setError('root.formError', {
            message:
              "There have been no changes made. Please change a field's value or press Cancel to exit.",
          });
        }
      }
    },
    [selectedManufacturer, patchManufacturer, handleClose, setError]
  );

  const onSubmit = (data: ManufacturerPost) => {
    type === 'post'
      ? handleAddManufacturer(data)
      : handleEditManufacturer(data);
  };

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>{`${type === 'post' ? 'Add' : 'Edit'} Manufacturer`}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1} component="form">
          <Grid item sx={{ mt: 1 }}>
            <TextField
              id="manufacturer-name-input"
              label="Name"
              required
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-url-input"
              label="URL"
              {...register('url')}
              error={!!errors.url}
              helperText={errors.url?.message}
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
              required
              {...register('address.address_line')}
              error={!!errors?.address?.address_line}
              helperText={errors?.address?.address_line?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-town-input"
              label="Town"
              {...register('address.town')}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-county-input"
              label="County"
              {...register('address.county')}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-country-input"
              label="Country"
              required
              {...register('address.country')}
              error={!!errors?.address?.country}
              helperText={errors?.address?.country?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-postcode-input"
              label="Post/Zip code"
              required
              {...register('address.postcode')}
              error={!!errors?.address?.postcode}
              helperText={errors?.address?.postcode?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              id="manufacturer-telephone-input"
              label="Telephone number"
              {...register('telephone')}
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
            onClick={handleSubmit(onSubmit)}
            disabled={
              Object.values(errors).length !== 0 ||
              isAddPending ||
              isEditPending
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
        {errors.root?.formError && (
          <FormHelperText sx={{ marginBottom: '16px' }} error>
            {errors.root?.formError.message}
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ManufacturerDialog;
