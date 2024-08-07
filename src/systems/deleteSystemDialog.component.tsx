import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { APIError, System } from '../api/api.types';
import { useDeleteSystem } from '../api/systems';
import handleIMS_APIError from '../handleIMS_APIError';

export interface DeleteSystemDialogProps {
  open: boolean;
  onClose: () => void;
  system?: System;
}

export const DeleteSystemDialog = (props: DeleteSystemDialogProps) => {
  const { open, onClose, system } = props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteSystem, isPending: isDeletePending } =
    useDeleteSystem();

  const handleClose = () => {
    onClose();
    setErrorMessage(undefined);
  };

  const handleDeleteSystem = React.useCallback(() => {
    if (system)
      deleteSystem(system.id)
        .then(() => {
          onClose();
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as APIError;
          if (response && error.response?.status === 409) {
            // Duplicate system
            setErrorMessage(
              `${response.detail}, please delete the child systems first`
            );
            return;
          }
          handleIMS_APIError(error);
        });
  }, [deleteSystem, onClose, system]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete System
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-system-name">{system?.name}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteSystem}
          disabled={isDeletePending || errorMessage !== undefined}
          endIcon={isDeletePending ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
      {errorMessage !== undefined && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 2,
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
