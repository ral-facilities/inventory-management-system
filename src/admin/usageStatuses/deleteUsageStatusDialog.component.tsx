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
import { useDeleteUsageStatus } from '../../api/usageStatuses';
import { ErrorParsing, UsageStatus } from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';

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

  const handleDeleteUsageStatus = React.useCallback(() => {
    if (usageStatus) {
      deleteUsageStatus(usageStatus.id)
        .then(() => {
          onClose();
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;
          if (response && error.response?.status === 409) {
            setFormError(
              `This usage status is currently used by one or more items. Remove all uses before deleting it here.`
            );
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
        Delete Usage Status
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-usage-status-value">
          {usageStatus?.value}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteUsageStatus}
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

export default DeleteUsageStatusDialog;
