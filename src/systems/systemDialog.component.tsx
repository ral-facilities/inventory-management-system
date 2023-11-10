import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { getSystemImportanceColour, useAddSystem } from '../api/systems';
import { AddSystem, ErrorParsing, SystemImportanceType } from '../app.types';

export interface SystemDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  type: 'add' | 'edit';
}

const SystemDialog = React.memo((props: SystemDialogProps) => {
  const { open, onClose, parentId, type } = props;

  // User entered properties
  const [name, setName] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [location, setLocation] = React.useState<string>('');
  const [owner, setOwner] = React.useState<string>('');
  const [importance, setImportance] = React.useState<SystemImportanceType>(
    SystemImportanceType.MEDIUM
  );

  // Error messages for the above properties (undefined means no error)
  const [nameError, setNameError] = React.useState<string | undefined>();

  // For any unhandled error e.g. a connection issue/API error
  const [otherError, setOtherError] = React.useState<boolean>(false);

  const handleClose = React.useCallback(() => {
    setName('');
    setDescription('');
    setLocation('');
    setOwner('');
    setImportance(SystemImportanceType.MEDIUM);

    // Remove all errors - event though otherError says it requires a refresh,
    // we don't want it showing if you move somewhere else or change the values
    setNameError(undefined);
    setOtherError(false);

    onClose();
  }, [onClose]);

  const { mutateAsync: addSystem } = useAddSystem();

  const handleAddSystem = React.useCallback(() => {
    // Validate the entered fields
    if (name.trim() === '') {
      setNameError('Please enter a name');
    } else {
      // Should be valid so add the system
      const system: AddSystem = {
        name: name,
        description: description !== '' ? description : undefined,
        location: location !== '' ? location : undefined,
        owner: owner !== '' ? owner : undefined,
        importance: importance,
      };
      if (parentId !== null) system.parent_id = parentId;
      addSystem(system)
        .then((response) => handleClose())
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;
          console.log(error);

          // 409 occurs when there is a system with a duplicate name with the
          // same parent
          if (response && error.response?.status === 409)
            setNameError(response.detail);
          else setOtherError(true);
        });
    }
  }, [
    addSystem,
    description,
    handleClose,
    importance,
    location,
    name,
    owner,
    parentId,
  ]);
  const handleEditSystem = React.useCallback(() => {}, []);

  // For title
  const systemText = parentId ? 'Subsystem' : 'System';

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        {type === 'add' ? `Add ${systemText}` : `Edit ${systemText}`}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={2}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required={true}
              value={name}
              error={nameError !== undefined}
              helperText={nameError}
              onChange={(event) => {
                setName(event.target.value);
              }}
              fullWidth
            ></TextField>
          </Grid>
          <Grid item>
            <TextField
              label="Description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              multiline
              fullWidth
            ></TextField>
          </Grid>
          <Grid item>
            <TextField
              label="Location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
              }}
              fullWidth
            ></TextField>
          </Grid>
          <Grid item>
            <TextField
              label="Owner"
              value={owner}
              onChange={(event) => {
                setOwner(event.target.value);
              }}
              fullWidth
            ></TextField>
          </Grid>
          <Grid item>
            <FormControl fullWidth>
              <InputLabel id="importance-select-label">Importance</InputLabel>
              <Select
                labelId="importance-select-label"
                label="Importance"
                value={importance}
                onChange={(event) => {
                  setImportance(event.target.value as SystemImportanceType);
                }}
              >
                {Object.values(SystemImportanceType).map((value, i) => (
                  <MenuItem key={i} value={value}>
                    <Chip
                      label={value}
                      sx={{ margin: 0 }}
                      color={getSystemImportanceColour(value)}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', padding: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
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
            onClick={type === 'add' ? handleAddSystem : handleEditSystem}
          >
            Save
          </Button>
        </Box>
        {otherError && (
          <FormHelperText sx={{ marginTop: 4 }} error>
            Please refresh and try again
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
});

export default SystemDialog;
