import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { AxiosError } from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { UnitPost } from '../../api/api.types';
import { usePostUnit } from '../../api/units';
import { UnitSchema } from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface UnitsDialogProps {
  open: boolean;
  onClose: () => void;
}

function UnitsDialog(props: UnitsDialogProps) {
  const { open, onClose } = props;

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<UnitPost>({
    resolver: zodResolver(UnitSchema),
  });

  const { mutateAsync: postUnit, isPending: isAddPending } = usePostUnit();

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [clearErrors, onClose, reset]);

  const handleAddUnit = React.useCallback(
    (unitData: UnitPost) => {
      postUnit(unitData)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 409) {
            setError('value', {
              message:
                'A unit with the same value already exists. Please enter a different value.',
            });
            return;
          }
          handleIMS_APIError(error);
        });
    },
    [postUnit, handleClose, setError]
  );

  const onSubmit = (data: UnitPost) => {
    handleAddUnit(data);
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Unit</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid sx={{ mt: 1 }}>
            <TextField
              id="unit-value-input"
              label="Value"
              required
              sx={{ marginLeft: '4px', my: '8px' }}
              {...register('value')}
              error={!!errors.value}
              helperText={errors.value?.message}
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
            disabled={isAddPending || Object.values(errors).length !== 0}
            endIcon={isAddPending ? <CircularProgress size={20} /> : null}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default UnitsDialog;
