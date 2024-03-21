import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  AddSystem,
  EditSystem,
  ErrorParsing,
  System,
  SystemImportanceType,
} from '../app.types';
import { AxiosError } from 'axios';
import {
  getSystemImportanceColour,
  useAddSystem,
  useEditSystem,
} from '../api/systems';
import handleIMS_APIError from '../handleIMS_APIError';
import { trimStringValues } from '../utils';

const systemsSchema = z.object({
  name: z.string().trim().min(1, { message: 'Please enter a name' }),
  location: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val)),
  owner: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val)),
  description: z
    .string()
    .optional()
    .transform((val) => (val === '' ? null : val)),
  importance: z.nativeEnum(SystemImportanceType),
});

export type SystemDialogType = 'add' | 'edit' | 'save as';
export interface SystemDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'add' | 'edit' | 'save as';
  parentId?: string | null;
  selectedSystem?: System;
}

function SystemDialog(props: SystemDialogProps) {
  const { open, onClose, parentId, type, selectedSystem } = props;
  // Error messages for the above properties (undefined means no error)
  const [nameError, setNameError] = React.useState<string | undefined>(
    undefined
  );

  // Form error that should disappear when the form is modified
  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const isNotAdding = type !== 'add' && selectedSystem;
  const system = selectedSystem || {
    name: '',
    description: '',
    location: '',
    owner: '',
    importance: SystemImportanceType.MEDIUM,
  };

  const initialSystem: AddSystem = {
    name: isNotAdding ? system.name : '',
    description: isNotAdding ? system.description : '',
    location: isNotAdding ? system.location : '',
    owner: isNotAdding ? system.owner : '',
    importance: system.importance,
  };

  const { mutateAsync: addSystem, isPending: isAddPending } = useAddSystem();
  const { mutateAsync: editSystem, isPending: isEditPending } = useEditSystem();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    control,
  } = useForm({
    resolver: zodResolver(systemsSchema),
    defaultValues: initialSystem,
  });

  // If any field value changes, clear the state
  React.useEffect(() => {
    if (selectedSystem) {
      const subscription = watch(() => setFormError(undefined));
      return () => subscription.unsubscribe();
    }
  }, [selectedSystem, watch]);

  const handleClose = React.useCallback(() => {
    // Remove all errors
    setNameError(undefined);
    setFormError(undefined);

    onClose();
  }, [onClose]);

  const handleAddSaveSystem = React.useCallback(
    (system: AddSystem) => {
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
    },
    [addSystem, handleClose]
  );

  const handleEditSystem = React.useCallback(
    (systemData: AddSystem) => {
      // Validate the entered fields
      if (selectedSystem) {
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

          editSystem(editSystemData)
            .then((response) => {
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
    },
    [editSystem, handleClose, selectedSystem]
  );
  const onSubmit = (data: AddSystem) => {
    type === 'edit'
      ? handleEditSystem(data)
      : handleAddSaveSystem({ ...data, parent_id: parentId ?? undefined });
  };
  // For title
  const systemText = parentId ? 'Subsystem' : 'System';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {type === 'edit' ? `Edit ${systemText}` : `Add ${systemText}`}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={2}>
          <Grid item sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required
              {...register('name')}
              error={!!errors.name || nameError !== undefined}
              helperText={errors.name?.message || nameError}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Description"
              {...register('description')}
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField label="Location" {...register('location')} fullWidth />
          </Grid>
          <Grid item>
            <TextField label="Owner" {...register('owner')} fullWidth />
          </Grid>
          <Grid item>
            <FormControl fullWidth>
              <Controller
                control={control}
                name="importance"
                render={({ field: { value, onChange } }) => (
                  <>
                    <InputLabel id="importance-select-label">
                      Importance
                    </InputLabel>
                    <Select
                      labelId="importance-select-label"
                      label="Importance"
                      value={value}
                      onChange={onChange}
                    >
                      {Object.values(SystemImportanceType).map((value, i) => (
                        <MenuItem key={i} value={value}>
                          <Chip
                            label={value}
                            sx={() => {
                              const colorName =
                                getSystemImportanceColour(value);
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
                  </>
                )}
              />
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
            onClick={handleSubmit(onSubmit)}
            disabled={
              isAddPending ||
              isEditPending ||
              formError !== undefined ||
              nameError !== undefined ||
              Object.values(errors).length !== 0
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
}

SystemDialog.displayName = 'SystemDialog';

export default SystemDialog;
