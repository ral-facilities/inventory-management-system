import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React from 'react';
import { SystemImportanceType } from '../app.types';

export interface SystemDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'add' | 'edit';
}

export const SystemDialog = React.memo((props: SystemDialogProps) => {
  const { open, onClose, type } = props;

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle>{type === 'add' ? 'Add System' : 'Edit System'}</DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={2}>
          <Grid item sx={{ mt: 1 }}>
            <TextField label="Name" required={true} fullWidth></TextField>
          </Grid>
          <Grid item>
            <TextField label="Location" required={true} fullWidth></TextField>
          </Grid>
          <Grid item>
            <TextField label="Owner" required={true} fullWidth></TextField>
          </Grid>
          <Grid item>
            <FormControl fullWidth>
              <InputLabel id="importance-select-label">Importance</InputLabel>
              <Select
                labelId="importance-select-label"
                label="Importance"
                value={SystemImportanceType.MEDIUM}
              >
                {Object.values(SystemImportanceType).map((value, i) => (
                  <MenuItem key={i} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          sx={{ width: '50%', mx: 1 }}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button variant="outlined" sx={{ width: '50%', mx: 1 }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
});
