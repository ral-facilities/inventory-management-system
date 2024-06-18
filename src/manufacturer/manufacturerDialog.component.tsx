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
  const [nameError, setNameError] = React.useState<string | undefined>(
    undefined
  );
  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: postManufacturer, isPending: isAddPending } =
    usePostManufacturer();
  const { mutateAsync: patchManufacturer, isPending: isEditPending } =
    usePatchManufacturer();

  const isNotCreating = type !== 'post' && selectedManufacturer;

  const initialManufacturer: ManufacturerPost = React.useMemo(
    () => ({
      name: isNotCreating ? selectedManufacturer.name : '',
      url: isNotCreating ? selectedManufacturer.url ?? '' : '',
      telephone: isNotCreating ? selectedManufacturer.telephone ?? '' : '',
      address: {
        address_line: isNotCreating
          ? selectedManufacturer.address.address_line
          : '',
        town: isNotCreating ? selectedManufacturer.address.town ?? '' : '',
        county: isNotCreating ? selectedManufacturer.address.county ?? '' : '',
        postcode: isNotCreating ? selectedManufacturer.address.postcode : '',
        country: isNotCreating ? selectedManufacturer.address.country : '',
      },
    }),
    [isNotCreating, selectedManufacturer]
  );
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ManufacturerPost>({
    resolver: zodResolver(ManufacturerSchema(type)),
  });

  // Load the values for editing. This method is used instead of the default values
  // property in "useForm" because the default values don't work for editing on the landing pages.
  React.useEffect(() => {
    Object.entries(initialManufacturer).map(([key, value]) =>
      setValue(key as keyof ManufacturerPost, value)
    );
  }, [initialManufacturer, setValue]);

  // If any field value changes, clear the state
  React.useEffect(() => {
    if (selectedManufacturer) {
      const subscription = watch(() => setFormError(undefined));
      return () => subscription.unsubscribe();
    }
  }, [selectedManufacturer, watch]);

  // If the name field changes, clear the name error state
  React.useEffect(() => {
    if (nameError) {
      const subscription = watch((_value, { name }) => {
        if (name === 'name') {
          setNameError(undefined);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [nameError, watch]);

  const handleClose = React.useCallback(() => {
    setNameError(undefined);
    setFormError(undefined);
    onClose();
  }, [onClose]);

  const handleAddManufacturer = React.useCallback(
    (manufacturerData: ManufacturerPost) => {
      postManufacturer(manufacturerData)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 409) {
            setNameError('A manufacturer with the same name already exists.');
            return;
          }
          handleIMS_APIError(error);
        });
    },
    [postManufacturer, handleClose]
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

        let manufacturerToEdit: ManufacturerPatch = {
          id: selectedManufacturer.id,
        };

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
          patchManufacturer(manufacturerToEdit)
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
    },
    [patchManufacturer, handleClose, selectedManufacturer]
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
              label="Name"
              required
              {...register('name')}
              error={!!errors.name || nameError !== undefined}
              helperText={errors.name?.message || nameError}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
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
              label="Address Line"
              required
              {...register('address.address_line')}
              error={!!errors?.address?.address_line}
              helperText={errors?.address?.address_line?.message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField label="Town" {...register('address.town')} fullWidth />
          </Grid>
          <Grid item>
            <TextField
              label="County"
              {...register('address.county')}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
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
              formError !== undefined ||
              nameError !== undefined ||
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
