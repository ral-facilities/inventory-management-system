import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { AxiosError } from 'axios';
import React from 'react';
import {
  System,
  SystemImportanceType,
  SystemPatch,
  SystemPost,
} from '../api/api.types';
import {
  getSystemImportanceColour,
  usePatchSystem,
  usePostSystem,
} from '../api/systems';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { RequestType, SystemsSchema } from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';

export interface SystemDialogProps {
  open: boolean;
  onClose: () => void;
  requestType: RequestType;
  duplicate?: boolean;
  // Only required for add
  parentId?: string | null;
  // Only required for pre-populating fields for an edit dialog
  selectedSystem?: System;
}

const SystemDialog = React.memo((props: SystemDialogProps) => {
  const { open, onClose, parentId, requestType, selectedSystem, duplicate } =
    props;

  const isNotCreating = (requestType !== 'post' || duplicate) && selectedSystem;

  const { mutateAsync: postSystem, isPending: isAddPending } = usePostSystem();
  const { mutateAsync: patchSystem, isPending: isEditPending } =
    usePatchSystem();

  const initialSystem: SystemPost = React.useMemo(
    () =>
      isNotCreating
        ? selectedSystem
        : {
            name: '',
            description: '',
            location: '',
            owner: '',
            importance: SystemImportanceType.MEDIUM,
          },
    [isNotCreating, selectedSystem]
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    control,
    setError,
    clearErrors,
    reset,
  } = useForm<SystemPost>({
    resolver: zodResolver(SystemsSchema(requestType)),
    defaultValues: initialSystem,
  });

  // Load the values for editing.
  React.useEffect(() => {
    reset(initialSystem);
  }, [initialSystem, reset]);

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    if (errors.root?.formError) {
      const subscription = watch(() => clearErrors('root.formError'));
      return () => subscription.unsubscribe();
    }
  }, [clearErrors, errors, watch]);

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
  }, [clearErrors, onClose, reset]);

  const handleAddSaveSystem = React.useCallback(
    (system: SystemPost) => {
      postSystem(system)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          // 409 occurs when there is a system with a duplicate name with the
          // same parent
          if (error.response?.status === 409) {
            setError('name', {
              message:
                'A System with the same name already exists within the same parent System. Please enter a different name.',
            });
          } else handleIMS_APIError(error);
        });
    },
    [postSystem, handleClose, setError]
  );

  const handleEditSystem = React.useCallback(
    (systemData: SystemPost) => {
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
          const editSystemData: SystemPatch = {};

          if (isNameUpdated) editSystemData.name = systemData.name;
          if (isDescriptionUpdated)
            editSystemData.description = systemData.description;
          if (isLocationUpdated) editSystemData.location = systemData.location;
          if (isOwnerUpdated) editSystemData.owner = systemData.owner;
          if (isImportanceUpdated)
            editSystemData.importance = systemData.importance;

          patchSystem({
            id: selectedSystem.id,
            system: editSystemData,
          })
            .then(() => {
              handleClose();
            })
            .catch((error: AxiosError) => {
              // 409 occurs when there is a system with a duplicate name with the
              // same parent
              if (error.response?.status === 409) {
                setError('name', {
                  message:
                    'A System with the same name already exists within the same parent System. Please enter a different name.',
                });
                return;
              }
              handleIMS_APIError(error);
            });
        } else
          setError('root.formError', {
            message:
              "There have been no changes made. Please change a field's value or press Cancel to exit.",
          });
      }
    },
    [selectedSystem, setError, patchSystem, handleClose]
  );

  const onSubmit = (data: SystemPost) => {
    if (requestType === 'patch') {
      handleEditSystem(data);
    } else {
      handleAddSaveSystem({
        ...data,
        parent_id: parentId ?? undefined,
      });
    }
  };

  // For title
  const systemText = parentId ? 'Subsystem' : 'System';

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        {requestType === 'patch' ? `Edit ${systemText}` : `Add ${systemText}`}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Stack width="100%">
            <Grid sx={{ mt: 1 }}>
              <TextField
                id="system-name-input"
                label="Name"
                required
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
            </Grid>
            <Grid>
              <TextField
                id="system-description-input"
                label="Description"
                {...register('description')}
                multiline
                fullWidth
              />
            </Grid>
            <Grid>
              <TextField
                id="system-location-input"
                label="Location"
                {...register('location')}
                fullWidth
              />
            </Grid>
            <Grid>
              <TextField
                id="system-owner-input"
                label="Owner"
                {...register('owner')}
                fullWidth
              />
            </Grid>
            <Grid>
              <Controller
                control={control}
                name="importance"
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    multiple
                    limitTags={1}
                    disableClearable={true}
                    id="importance-select"
                    options={Object.values(SystemImportanceType)}
                    getOptionLabel={(option) => option}
                    value={[value]}
                    onChange={(_event, value) => {
                      if (value.length === 0) return;
                      // as is a multiple autocomplete this removes original selection from list
                      // therefore only the new option is in the array
                      value.shift();

                      onChange(value[0]);
                    }}
                    renderInput={(params) => (
                      <TextField label="Importance" {...params} />
                    )}
                    renderTags={() => (
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
                    )}
                    renderOption={(props, option) => (
                      <MenuItem {...props} key={option}>
                        <Chip
                          label={option}
                          sx={() => {
                            const colorName = getSystemImportanceColour(option);
                            return {
                              margin: 0,
                              bgcolor: `${colorName}.main`,
                              color: `${colorName}.contrastText`,
                            };
                          }}
                        />
                      </MenuItem>
                    )}
                  />
                )}
              />
            </Grid>
          </Stack>
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
              Object.values(errors).length !== 0
            }
            endIcon={
              isAddPending || isEditPending ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            Save
          </Button>
        </Box>
        {errors.root?.formError && (
          <FormHelperText sx={{ marginTop: 4 }} error>
            {errors.root?.formError.message}
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
});
SystemDialog.displayName = 'SystemDialog';

export default SystemDialog;
