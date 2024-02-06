import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { useDeleteManufacturer } from '../api/manufacturer';
import { ErrorParsing, Manufacturer } from '../app.types';

export interface DeleteManufacturerProps {
  open: boolean;
  onClose: () => void;
  manufacturer: Manufacturer | undefined;
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
              `${response.detail}. Please delete the Catalogue Item first.`
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
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Manufacturer
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-manufacturer-name">
          {manufacturer?.name}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDeleteManufacturer} disabled={error}>
          Continue
        </Button>
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
