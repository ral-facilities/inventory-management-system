import React from 'react';
import { AddUsageStatus } from '../../app.types';
import { trimStringValues } from '../../utils';
import handleIMS_APIError from '../../handleIMS_APIError';
import { AxiosError } from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { useAddUsageStatus } from '../../api/usageStatuses';

export interface UsageStatusDialogProps {
  open: boolean;
  onClose: () => void;
}

function UsageStatusDialog(props: UsageStatusDialogProps) {
  const { open, onClose } = props;

  const [usageStatusDetails, setUsageStatusDetails] = React.useState<
    AddUsageStatus | undefined
  >(undefined);

  const [valueError, setValueError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: addUsageStatus, isPending: isAddPending } =
    useAddUsageStatus();

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

    addUsageStatus(trimStringValues(usageStatusDetails))
      .then(() => handleClose())
      .catch((error: AxiosError) => {
        if (error.response?.status === 409) {
          setValueError('A usage status with the same name already exists');
          return;
        }
        handleIMS_APIError(error);
      });
  }, [handleErrors, addUsageStatus, usageStatusDetails, handleClose]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Usage Status</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
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
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default UsageStatusDialog;
