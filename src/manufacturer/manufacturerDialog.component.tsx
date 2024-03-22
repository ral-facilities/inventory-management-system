import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  AddManufacturer,
  EditManufacturer,
  ErrorParsing,
  Manufacturer,
} from '../app.types';
import { AxiosError } from 'axios';
import { useAddManufacturer, useEditManufacturer } from '../api/manufacturer';
import handleIMS_APIError from '../handleIMS_APIError';

const manufacturerSchema = z.object({
  name: z.string().trim().min(1, { message: 'Please enter a name.' }),
  url: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  address: z.object({
    address_line: z
      .string()
      .trim()
      .min(1, { message: 'Please enter an address.' }),
    town: z.string().trim().optional(),
    county: z.string().trim().optional(),
    country: z.string().trim().min(1, { message: 'Please enter a country.' }),
    postcode: z
      .string()
      .trim()
      .min(1, { message: 'Please enter a post code or zip code.' }),
  }),
  telephone: z.string().trim().optional(),
});

export interface ManufacturerDialogProps {
  open: boolean;
  onClose: () => void;
  selectedManufacturer?: Manufacturer;
  type: 'edit' | 'create';
}

function ManufacturerDialog(props: ManufacturerDialogProps) {
  const { open, onClose, selectedManufacturer, type } = props;
  const [nameError, setNameError] = React.useState<string | undefined>(
    undefined
  );
  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: addManufacturer, isPending: isAddPending } =
    useAddManufacturer();
  const { mutateAsync: editManufacturer, isPending: isEditPending } =
    useEditManufacturer();

  const isNotCreating = type !== 'create' && selectedManufacturer;
  const manufacturer = selectedManufacturer ?? {
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
  };

  const initialManufacturer: AddManufacturer = {
    name: isNotCreating ? manufacturer.name : '',
    url: isNotCreating ? manufacturer.url ?? '' : '',
    telephone: isNotCreating ? manufacturer.telephone ?? '' : '',
    address: {
      address_line: isNotCreating ? manufacturer.address.address_line : '',
      town: isNotCreating ? manufacturer.address.town ?? '' : '',
      county: isNotCreating ? manufacturer.address.county ?? '' : '',
      postcode: isNotCreating ? manufacturer.address.postcode : '',
      country: isNotCreating ? manufacturer.address.country : '',
    },
  };
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: initialManufacturer,
  });

  // If any field value changes, clear the state
  React.useEffect(() => {
    if (selectedManufacturer) {
      const subscription = watch(() => setFormError(undefined));
      return () => subscription.unsubscribe();
    }
  }, [selectedManufacturer, watch]);

  const handleClose = React.useCallback(() => {
    setNameError(undefined);
    setFormError(undefined);
    onClose();
  }, [onClose]);

  const handleAddManufacturer = React.useCallback(
    (manufacturerData: AddManufacturer) => {
      addManufacturer(manufacturerData)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 409) {
            setNameError('A manufacturer with the same name already exists.');
            return;
          }
          handleIMS_APIError(error);
        });
    },
    [addManufacturer, handleClose]
  );

  const handleEditManufacturer = React.useCallback(
    (manufacturerData: EditManufacturer) => {
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

        let manufacturerToEdit: EditManufacturer = {
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
          editManufacturer(manufacturerToEdit)
            .then(() => handleClose())
            .catch((error: AxiosError) => {
              const response = error.response?.data as ErrorParsing;
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
    [editManufacturer, handleClose, selectedManufacturer]
  );

  const onSubmit = (data: AddManufacturer) => {
    type === 'create'
      ? handleAddManufacturer(data)
      : handleEditManufacturer(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{`${type === 'create' ? 'Add' : 'Edit'} Manufacturer`}</DialogTitle>
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
            onClick={onClose}
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
