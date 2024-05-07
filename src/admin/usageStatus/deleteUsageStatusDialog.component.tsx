import { AxiosError } from 'axios';
import { ErrorParsing, UsageStatus } from '../../app.types';
import React from 'react';
import handleIMS_APIError from '../../handleIMS_APIError';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormHelperText,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useDeleteUsageStatus } from '../../api/usageStatus';

export interface DeleteUsageStatusProps {
  open: boolean;
  onClose: () => void;
  usageStatus: UsageStatus | undefined;
}

const DeleteUsageStatusDialog = (props: DeleteUsageStatusProps) => {
  const { open, onClose, usageStatus } = props;

  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteUsageStatus, isPending: isDeletePending } =
    useDeleteUsageStatus();

  const handleClose = React.useCallback(() => {
    setFormError(undefined);
    onClose();
  }, [onClose]);

  const handleDeleteUnit = React.useCallback(() => {
    if (usageStatus) {
      deleteUsageStatus(usageStatus.id)
        .then(() => {
          onClose();
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;
          if (response && error.response?.status === 409) {
            setFormError(`${response.detail}. Please delete the Item first`);
            return;
          }
          handleIMS_APIError(error);
        });
    } else {
      setFormError('No data provided. Please refresh and try again');
    }
  }, [deleteUsageStatus, onClose, usageStatus]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Unit
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-unit-value">{usageStatus?.value}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteUnit}
          disabled={isDeletePending || formError != undefined}
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

export default DeleteUsageStatusDialog;
