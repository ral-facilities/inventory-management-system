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
import { APIError, Unit } from '../../api/api.types';
import { useDeleteUnit } from '../../api/units';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface DeleteUnitProps {
  open: boolean;
  onClose: () => void;
  unit: Unit | undefined;
}

const DeleteUnitDialog = (props: DeleteUnitProps) => {
  const { open, onClose, unit } = props;

  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteUnit, isPending: isDeletePending } =
    useDeleteUnit();

  const handleClose = React.useCallback(() => {
    setFormError(undefined);
    onClose();
  }, [onClose]);

  const handleDeleteUnit = React.useCallback(() => {
    if (unit) {
      deleteUnit(unit.id)
        .then(() => {
          onClose();
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as APIError;
          if (response && error.response?.status === 409) {
            setFormError(
              `This unit is currently used by one or more catalogue categories. Remove all uses before deleting it here.`
            );
            return;
          }
          handleIMS_APIError(error);
        });
    } else {
      setFormError('No data provided. Please refresh and try again');
    }
  }, [deleteUnit, onClose, unit]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Unit
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-unit-value">{unit?.value}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteUnit}
          disabled={isDeletePending || formError != undefined}
          endIcon={isDeletePending ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
      {formError != undefined && (
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
            {formError}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default DeleteUnitDialog;
