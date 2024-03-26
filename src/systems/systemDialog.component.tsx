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
import React, { useEffect } from 'react';
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
import handleIMS_APIError from '../handleIMS_APIError';
import { trimStringValues } from '../utils';

export type SystemDialogType = 'add' | 'edit' | 'save as';

const getEmptySystem = (): AddSystem => {
  return {
    // Here using null for optional values only, so that types for isUpdated parameters
    // can match
    name: '',
    description: null,
    location: null,
    owner: null,
    importance: SystemImportanceType.MEDIUM,
  } as AddSystem;
};

export interface SystemDialogProps {
  open: boolean;
  onClose: () => void;
  type: SystemDialogType;
  // Only required for add
  parentId?: string | null;
  // Only required for prepopulating fields for an edit dialog
  selectedSystem?: System;
}

const SystemDialog = React.memo((props: SystemDialogProps) => {
  const { open, onClose, parentId, type, selectedSystem } = props;

  // User entered properties
  const [systemData, setSystemData] =
    React.useState<AddSystem>(getEmptySystem());

  // Ensure system data is updated when the selected system changes
  useEffect(() => {
    if (open) {
      if (type === 'add') setSystemData(getEmptySystem());
      else if (selectedSystem) setSystemData(selectedSystem as AddSystem);
    }
  }, [selectedSystem, open, type]);

  // Error messages for the above properties (undefined means no error)
  const [nameError, setNameError] = React.useState<string | undefined>(
    undefined
  );

  // Form error that should dissappear when the form is modified
  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const handleClose = React.useCallback(() => {
    if (type === 'add') setSystemData(getEmptySystem());
    // Reset for edit
    else setSystemData(selectedSystem as AddSystem);

    // Remove all errors
    setNameError(undefined);
    setFormError(undefined);

    onClose();
  }, [onClose, selectedSystem, type]);

  const { mutateAsync: addSystem, isPending: isAddPending } = useAddSystem();
  const { mutateAsync: editSystem, isPending: isEditPending } = useEditSystem();

  // Returns true when all fields valid
  const validateFields = React.useCallback((): boolean => {
    if (systemData.name.trim() === '') {
      setNameError('Please enter a name');
      return false;
    }
    return true;
  }, [systemData.name]);

  const handleAddSaveSystem = React.useCallback(() => {
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
      if (parentId !== undefined) system.parent_id = parentId;
      addSystem(trimStringValues(system))
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;

          // 409 occurs when there is a system with a duplicate name with the
          // same parent
          if (response && error.response?.status === 409)
            setNameError(response.detail);
          else handleIMS_APIError(error);
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
    if (validateFields() && selectedSystem) {
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
        const editSystemData: EditSystem = { id: selectedSystem.id };

        isNameUpdated && (editSystemData.name = systemData.name);
        isDescriptionUpdated &&
          (editSystemData.description = systemData.description);
        isLocationUpdated && (editSystemData.location = systemData.location);
        isOwnerUpdated && (editSystemData.owner = systemData.owner);
        isImportanceUpdated &&
          (editSystemData.importance = systemData.importance);

        editSystem(trimStringValues(editSystemData))
          .then((response) => {
            setSystemData(response);
            handleClose();
          })
          .catch((error: AxiosError) => {
            const response = error.response?.data as ErrorParsing;

            // 409 occurs when there is a system with a duplicate name with the
            // same parent
            if (response && error.response?.status === 409)
              setNameError(response.detail);
            else handleIMS_APIError(error);
          });
      } else setFormError('Please edit a form entry before clicking save');
    }
  }, [
    editSystem,
    handleClose,
    selectedSystem,
    systemData.description,
    systemData.importance,
    systemData.location,
    systemData.name,
    systemData.owner,
    validateFields,
  ]);

  // Reset form error on any form modification
  const handleFormChange = (newSystemData: AddSystem) => {
    setSystemData(newSystemData);
    setFormError(undefined);
  };

  // For title
  const systemText = parentId ? 'Subsystem' : 'System';

  return (
    <Dialog
      open={open}
      onClose={(_event: object, reason: string) =>
        !(reason == 'backdropClick' || reason == 'escapeKeyDown') &&
        handleClose()
      }
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {type === 'edit' ? `Edit ${systemText}` : `Add ${systemText}`}
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
                handleFormChange({ ...systemData, name: event.target.value });
                setNameError(undefined);
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Description"
              value={systemData.description ?? ''}
              onChange={(event) => {
                handleFormChange({
                  ...systemData,
                  description: event.target.value || null,
                });
              }}
              multiline
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Location"
              value={systemData.location ?? ''}
              onChange={(event) => {
                handleFormChange({
                  ...systemData,
                  location: event.target.value || null,
                });
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Owner"
              value={systemData.owner ?? ''}
              onChange={(event) => {
                handleFormChange({
                  ...systemData,
                  owner: event.target.value || null,
                });
              }}
              fullWidth
            />
          </Grid>
          <Grid item>
            <FormControl fullWidth>
              <InputLabel id="importance-select-label">Importance</InputLabel>
              <Select
                labelId="importance-select-label"
                label="Importance"
                value={systemData.importance}
                onChange={(event) => {
                  handleFormChange({
                    ...systemData,
                    importance: event.target.value as SystemImportanceType,
                  });
                }}
              >
                {Object.values(SystemImportanceType).map((value, i) => (
                  <MenuItem key={i} value={value}>
                    <Chip
                      label={value}
                      sx={() => {
                        const colorName = getSystemImportanceColour(value);
                        return {
                          margin: 0,
                          bgcolor: `${colorName}.main`,
                          color: `${colorName}.contrastText`,
                        };
                      }}
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
            onClick={type === 'edit' ? handleEditSystem : handleAddSaveSystem}
            disabled={
              isAddPending ||
              isEditPending ||
              formError !== undefined ||
              nameError !== undefined
            }
          >
            Save
          </Button>
        </Box>
        {formError && (
          <FormHelperText sx={{ marginTop: 4 }} error>
            {formError}
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
});
SystemDialog.displayName = 'SystemDialog';

export default SystemDialog;
