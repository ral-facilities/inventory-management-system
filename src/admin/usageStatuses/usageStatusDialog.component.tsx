import { zodResolver } from '@hookform/resolvers/zod';
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
import { useForm } from 'react-hook-form';
import { UsageStatusPost } from '../../api/api.types';
import { usePostUsageStatus } from '../../api/usageStatuses';
import { UsageStatusSchema } from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface UsageStatusDialogProps {
  open: boolean;
  onClose: () => void;
}

function UsageStatusDialog(props: UsageStatusDialogProps) {
  const { open, onClose } = props;

  const [valueError, setValueError] = React.useState<string | undefined>(
    undefined
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<UsageStatusPost>({
    resolver: zodResolver(UsageStatusSchema),
  });

  // If any field name changes, clear the state
  React.useEffect(() => {
    if (valueError) {
      const subscription = watch((_value, { name }) => {
        if (name === 'value') {
          setValueError(undefined);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [valueError, watch]);

  const { mutateAsync: postUsageStatus, isPending: isAddPending } =
    usePostUsageStatus();

  const handleClose = React.useCallback(() => {
    setValueError(undefined);
    onClose();
  }, [onClose]);

  const handleAddUsageStatus = React.useCallback(
    (usageStatusData: UsageStatusPost) => {
      postUsageStatus(usageStatusData)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 409) {
            setValueError('A usage status with the same value already exists.');
            return;
          }
          handleIMS_APIError(error);
        });
    },
    [postUsageStatus, handleClose]
  );
  const onSubmit = (data: UsageStatusPost) => {
    handleAddUsageStatus(data);
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Usage Status</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              id="usage-status-value-input"
              label="Value"
              required
              sx={{ marginLeft: '4px', my: '8px' }}
              {...register('value')}
              error={!!errors.value || valueError !== undefined}
              helperText={errors.value?.message || valueError}
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
            onClick={handleSubmit(onSubmit)}
            disabled={
              isAddPending ||
              valueError !== undefined ||
              Object.values(errors).length !== 0
            }
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
