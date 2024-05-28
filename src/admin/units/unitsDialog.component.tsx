import React from 'react';
import { useAddUnit } from '../../api/units';
import { AddUnit } from '../../app.types';
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

export interface UnitsDialogProps {
  open: boolean;
  onClose: () => void;
}

function UnitsDialog(props: UnitsDialogProps) {
  const { open, onClose } = props;

  const [unitDetails, setUnitDetails] = React.useState<AddUnit>({
    value: null,
  });

  const [valueError, setValueError] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: addUnit, isPending: isAddPending } = useAddUnit();

  const handleClose = React.useCallback(() => {
    setUnitDetails({
      value: null,
    });
    setValueError(undefined);
    onClose();
  }, [onClose]);

  const handleErrors = React.useCallback((): boolean => {
    let hasErrors = false;
    if (!unitDetails.value || unitDetails.value.trim().length === 0) {
      hasErrors = true;
      setValueError('Please enter a value');
    }

    return hasErrors;
  }, [unitDetails]);

  const handleAddUnit = React.useCallback(() => {
    const hasErrors = handleErrors();

    if (hasErrors) {
      return;
    }

    addUnit(trimStringValues(unitDetails))
      .then(() => handleClose())
      .catch((error: AxiosError) => {
        if (error.response?.status === 409) {
          setValueError('A unit with the value name already exists');
          return;
        }
        handleIMS_APIError(error);
      });
  }, [handleErrors, unitDetails, addUnit, handleClose]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Add Unit</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              label="Value"
              required={true}
              sx={{ marginLeft: '4px', my: '8px' }} // Adjusted the width and margin
              value={unitDetails.value ?? ''}
              onChange={(event) => {
                setUnitDetails({ value: event.target.value });
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
            onClick={handleAddUnit}
            disabled={isAddPending || valueError !== undefined}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default UnitsDialog;
