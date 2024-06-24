import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { UsageStatusPost } from '../../api/api.types';
import { usePostUsageStatus } from '../../api/usageStatuses';
import handleIMS_APIError from '../../handleIMS_APIError';
import { trimStringValues } from '../../utils';

export interface UsageStatusDialogProps {
  open: boolean;
  onClose: () => void;
}

function UsageStatusDialog(props: UsageStatusDialogProps) {
  const { open, onClose } = props;

  const [usageStatusDetails, setUsageStatusDetails] = React.useState<
    UsageStatusPost | undefined
  >(undefined);

  const [valueError, setValueError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: postUsageStatus, isPending: isAddPending } =
    usePostUsageStatus();

  const handleClose = React.useCallback(() => {
    setUsageStatusDetails(undefined);
    setValueError(undefined);
    onClose();
  }, [onClose]);

  const handleErrors = React.useCallback((): boolean => {
    let hasErrors = false;
    if (
      !usageStatusDetails?.value ||
      usageStatusDetails?.value.trim().length === 0
    ) {
      hasErrors = true;
      setValueError('Please enter a value');
    }

    return hasErrors;
  }, [usageStatusDetails]);

  const handleAddUsageStatus = React.useCallback(() => {
    const hasErrors = handleErrors();

    if (hasErrors) {
      return;
    }

    postUsageStatus(trimStringValues(usageStatusDetails))
      .then(() => handleClose())
      .catch((error: AxiosError) => {
        if (error.response?.status === 409) {
          setValueError('A usage status with the same value already exists');
          return;
        }
        handleIMS_APIError(error);
      });
  }, [handleErrors, postUsageStatus, usageStatusDetails, handleClose]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Usage Status</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              id="usage-status-value-input"
              label="Value"
              required={true}
              sx={{ marginLeft: '4px', my: '8px' }}
              value={usageStatusDetails?.value ?? ''}
              onChange={(event) => {
                setUsageStatusDetails({ value: event.target.value });
                setValueError(undefined);
              }}
              error={valueError !== undefined}
              helperText={valueError}
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
            onClick={handleAddUsageStatus}
            disabled={isAddPending || valueError !== undefined}
            endIcon={isAddPending ? <CircularProgress size={20} /> : null}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default UsageStatusDialog;
