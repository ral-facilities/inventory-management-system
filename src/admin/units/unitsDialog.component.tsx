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

  const [valueError, setValueError] = React.useState<string | undefined>(
    undefined
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<UnitPost>({
    resolver: zodResolver(UnitSchema),
    mode: 'onSubmit',
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

  const { mutateAsync: postUnit, isPending: isAddPending } = usePostUnit();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleAddUnit = React.useCallback(
    (unitData: UnitPost) => {
      postUnit(unitData)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          if (error.response?.status === 409) {
            setValueError('A unit with the same value already exists.');
            return;
          }
          handleIMS_APIError(error);
        });
    },
    [postUnit, handleClose]
  );

  const onSubmit = (data: UnitPost) => {
    handleAddUnit(data);
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Unit</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
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

export default UnitsDialog;
