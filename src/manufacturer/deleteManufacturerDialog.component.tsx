import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import React from 'react';
import { ErrorParsing, ViewManufacturerResponse } from '../app.types';
import { AxiosError } from 'axios';
import { useDeleteManufacturer } from '../api/manufacturer';

export interface DeleteManufacturerProps {
  open: boolean;
  onClose: () => void;
  manufacturer: ViewManufacturerResponse | undefined;
}

const DeleteManufacturerDialog = (props: DeleteManufacturerProps) => {
  const { open, onClose, manufacturer } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteManufacturer } = useDeleteManufacturer();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage(undefined);
  }, [onClose]);

  const handleDeleteManufacturer = React.useCallback(() => {
    if (manufacturer) {
      deleteManufacturer(manufacturer)
        .then((response) => {
          onClose();
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;
          if (response && error.response?.status === 409) {
            setError(true);
            setErrorMessage(
              `${response.detail} Please delete the Catalogue Item first`
            );
            return;
          }
          setError(true);
          setErrorMessage('Please refresh and try again');
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [manufacturer, deleteManufacturer, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Delete Manufacturer</DialogTitle>
      <DialogContent>
        Are you sure you want to delete{' '}
        <strong data-testid="delete-manufacturer-name">
          {manufacturer?.name}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDeleteManufacturer}>Continue</Button>
      </DialogActions>
      {error && (
        <Box
          sx={{
            mx: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ maxWidth: '100%', fontSize: '1rem' }} error>
            {errorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default DeleteManufacturerDialog;
