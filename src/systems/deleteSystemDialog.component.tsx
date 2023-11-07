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
import { useDeleteSystem } from '../api/systems';
import { ErrorParsing, System } from '../app.types';
import { useNavigateToSystem } from './systems.component';

export interface DeleteSystemDialogProps {
  open: boolean;
  onClose: () => void;
  system: System;
}

export const DeleteSystemDialog = (props: DeleteSystemDialogProps) => {
  const { open, onClose, system } = props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteSystem } = useDeleteSystem();

  const navigateToSystem = useNavigateToSystem();

  const handleClose = () => {
    onClose();
    setErrorMessage(undefined);
  };

  const handleDeleteSystem = React.useCallback(() => {
    deleteSystem(system.id)
      .then((response) => {
        onClose();
        // Navigate to parent as current system no longer exists
        navigateToSystem(system.parent_id);
      })
      .catch((error: AxiosError) => {
        const response = error.response?.data as ErrorParsing;
        if (response && error.response?.status === 409) {
          // Duplicate system
          setErrorMessage(
            `${response.detail}, please delete the child systems first`
          );
          return;
        }
        setErrorMessage('Please refresh and try again');
      });
  }, [deleteSystem, navigateToSystem, onClose, system.id, system.parent_id]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Delete System</DialogTitle>
      <DialogContent>
        Are you sure you want to delete
        <strong data-testid="delete-system-name">{system.name}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDeleteSystem}>Continue</Button>
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
