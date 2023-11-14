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
import {
  getSystemImportanceColour,
  useAddSystem,
  useEditSystem,
} from '../api/systems';
import {
  AddSystem,
  EditSystem,
  ErrorParsing,
  System,
  SystemImportanceType,
} from '../app.types';

export interface SystemDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  type: 'add' | 'edit';
  // Only required for prepopulating fields for an edit dialog
  selectedSystem?: System;
}

const SystemDialog = React.memo((props: SystemDialogProps) => {
  const { open, onClose, parentId, type, selectedSystem } = props;

  // User entered properties
  const [systemData, setSystemData] = React.useState<AddSystem>(
    selectedSystem
      ? // Cast here to remove the values not needed here i.e. id & code
        (selectedSystem as AddSystem)
      : {
          // Here using null for optional values only, so that types for isUpdated parameters
          // can match
          name: '',
          description: null,
          location: null,
          owner: null,
          importance: SystemImportanceType.MEDIUM,
        }
  );

  // Error messages for the above properties (undefined means no error)
  const [nameError, setNameError] = React.useState<string | undefined>();

  // For any unhandled error e.g. a connection issue/API error
  const [otherError, setOtherError] = React.useState<boolean>(false);

  const handleClose = React.useCallback(() => {
    if (type === 'add')
      setSystemData({
        name: '',
        description: null,
        location: null,
        owner: null,
        importance: SystemImportanceType.MEDIUM,
      });

    // Remove all errors - event though otherError says it requires a refresh,
    // we don't want it showing if you move somewhere else or change the values
    setNameError(undefined);
    setOtherError(false);

    onClose();
  }, [onClose, type]);

  const { mutateAsync: addSystem } = useAddSystem();
  const { mutateAsync: editSystem } = useEditSystem();

  // Returns true when all fields valid
  const validateFields = React.useCallback((): boolean => {
    if (systemData.name.trim() === '') {
      setNameError('Please enter a name');
      return false;
    }
    return true;
  }, [systemData.name]);

  const handleAddSystem = React.useCallback(() => {
    // Validate the entered fields
    if (validateFields()) {
      // Should be valid so add the system
      const system: AddSystem = {
        name: systemData.name,
        // For optional params use undefined when the parameters are null
        description: systemData.description || undefined,
        location: systemData.location || undefined,
        owner: systemData.owner || undefined,
        importance: systemData.importance,
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
    handleClose,
    parentId,
    systemData.description,
    systemData.importance,
    systemData.location,
    systemData.name,
    systemData.owner,
    validateFields,
  ]);

  const handleEditSystem = React.useCallback(() => {
    // Validate the entered fields
    if (validateFields() && selectedSystem && parentId) {
      // Now ensure there is actually something to update
      const isNameUpdated = systemData.name !== selectedSystem?.name;
      const isDescriptionUpdated =
        systemData.description !== selectedSystem?.description;
      const isLocationUpdated =
        systemData.location !== selectedSystem?.location;
      const isOwnerUpdated = systemData.owner !== selectedSystem?.owner;
      const isImportanceUpdated =
        systemData.importance !== selectedSystem?.importance;

      if (
        isNameUpdated ||
        isDescriptionUpdated ||
        isLocationUpdated ||
        isOwnerUpdated ||
        isImportanceUpdated
      ) {
        const editSystemData: EditSystem = {};

        isNameUpdated && (editSystemData.name = systemData.name);
        isDescriptionUpdated &&
          (editSystemData.description = systemData.description);
        isLocationUpdated && (editSystemData.location = systemData.location);
        isOwnerUpdated && (editSystemData.owner = systemData.owner);
        isImportanceUpdated &&
          (editSystemData.importance = systemData.importance);

        editSystem({ systemId: parentId, system: editSystemData })
          .then((response) => {
            setSystemData(response);
            handleClose();
          })
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
    }
  }, [
    editSystem,
    handleClose,
    parentId,
    selectedSystem,
    systemData.description,
    systemData.importance,
    systemData.location,
    systemData.name,
    systemData.owner,
    validateFields,
  ]);

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
              value={systemData.name}
              error={nameError !== undefined}
              helperText={nameError}
              onChange={(event) => {
                setSystemData({ ...systemData, name: event.target.value });
              }}
              fullWidth
            ></TextField>
          </Grid>
          <Grid item>
            <TextField
              label="Description"
              value={systemData.description}
              onChange={(event) => {
                setSystemData({
                  ...systemData,
                  description: event.target.value || null,
                });
              }}
              multiline
              fullWidth
            ></TextField>
          </Grid>
          <Grid item>
            <TextField
              label="Location"
              value={systemData.location}
              onChange={(event) => {
                setSystemData({
                  ...systemData,
                  location: event.target.value || null,
                });
              }}
              fullWidth
            ></TextField>
          </Grid>
          <Grid item>
            <TextField
              label="Owner"
              value={systemData.owner}
              onChange={(event) => {
                setSystemData({
                  ...systemData,
                  owner: event.target.value || null,
                });
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
                value={systemData.importance}
                onChange={(event) => {
                  setSystemData({
                    ...systemData,
                    importance: event.target.value as SystemImportanceType,
                  });
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
