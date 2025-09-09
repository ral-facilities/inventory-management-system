import { zodResolver } from '@hookform/resolvers/zod';
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
import { AxiosError } from 'axios';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  System,
  SystemImportanceType,
  SystemPatch,
  SystemPost,
  type APIError,
  type SystemType,
} from '../api/api.types';
import {
  getSystemImportanceColour,
  useGetSystem,
  useGetSystemTypes,
  usePatchSystem,
  usePostSystem,
} from '../api/systems';
import { RequestType, SystemsSchema } from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';
import { createFormControlWithRootErrorClearing } from '../utils';

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

const SystemDialog = (props: SystemDialogProps) => {
  const { open, onClose, parentId, requestType, selectedSystem, duplicate } =
    props;

  const { mutateAsync: postSystem, isPending: isAddPending } = usePostSystem();
  const { mutateAsync: patchSystem, isPending: isEditPending } =
    usePatchSystem();

  const { data: parentSystem } = useGetSystem(parentId);

  const parentSystemTypeId = React.useMemo(() => {
    if (parentSystem) {
      return parentSystem.type_id;
    }
    return null;
  }, [parentSystem]);

  const { data: systemsTypes } = useGetSystemTypes();
  const isNotCreating = (requestType !== 'post' || duplicate) && selectedSystem;

  const initialSystem: SystemPost = React.useMemo(
    () =>
      isNotCreating
        ? {
            name: selectedSystem.name,
            description: selectedSystem.description ?? '',
            location: selectedSystem.location ?? '',
            owner: selectedSystem.owner ?? '',
            importance: selectedSystem.importance,
            type_id: selectedSystem.type_id,
          }
        : {
            name: '',
            description: '',
            location: '',
            owner: '',
            importance: SystemImportanceType.MEDIUM,
            type_id: parentSystemTypeId ?? '',
          },
    [isNotCreating, parentSystemTypeId, selectedSystem]
  );
  // This is within the React Component as this dialog is used in multiple places in the systems page
  const formControl = createFormControlWithRootErrorClearing<SystemPost>();

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setError,
    clearErrors,
    reset,
  } = useForm<SystemPost>({
    formControl,
    resolver: zodResolver(SystemsSchema(requestType)),
    defaultValues: initialSystem,
  });

  // Load the values for editing.
  React.useEffect(() => {
    reset(initialSystem);
  }, [initialSystem, reset]);

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
          const status = error.response?.status;
          const errorMessage = (error.response?.data as APIError).detail;
          if (
            status === 409 &&
            errorMessage.includes(
              'A System with the same name already exists within the same parent System'
            )
          ) {
            setError('name', {
              message:
                'A System with the same name already exists within the same parent System. Please enter a different name.',
            });
            return;
          }
          if (
            status === 422 &&
            errorMessage.includes('Specified system type not found')
          ) {
            setError('type_id', {
              message:
                'Specified system type not found. Please select a valid system type.',
            });
            return;
          }
          handleIMS_APIError(error);
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
        const isTypeUpdated = systemData.type_id !== selectedSystem?.type_id;

        if (
          isNameUpdated ||
          isDescriptionUpdated ||
          isLocationUpdated ||
          isOwnerUpdated ||
          isImportanceUpdated ||
          isTypeUpdated
        ) {
          const editSystemData: SystemPatch = {};

          if (isNameUpdated) editSystemData.name = systemData.name;
          if (isDescriptionUpdated)
            editSystemData.description = systemData.description;
          if (isLocationUpdated) editSystemData.location = systemData.location;
          if (isOwnerUpdated) editSystemData.owner = systemData.owner;
          if (isImportanceUpdated)
            editSystemData.importance = systemData.importance;
          if (isTypeUpdated) editSystemData.type_id = systemData.type_id;

          patchSystem({
            id: selectedSystem.id,
            system: editSystemData,
          })
            .then(() => {
              handleClose();
            })
            .catch((error: AxiosError) => {
              const status = error.response?.status;
              const errorMessage = (error.response?.data as APIError).detail;
              if (
                status === 409 &&
                errorMessage.includes(
                  'A System with the same name already exists within the same parent System'
                )
              ) {
                setError('name', {
                  message:
                    'A System with the same name already exists within the same parent System. Please enter a different name.',
                });
                return;
              }
              if (
                status === 422 &&
                errorMessage.includes(
                  'Cannot change the type of a system when it has children'
                )
              ) {
                setError('type_id', {
                  message:
                    'Cannot change the type of a system that has child systems and items. Please remove all child systems and items before changing the type.',
                });
                return;
              }
              if (
                status === 422 &&
                errorMessage.includes('Specified system type not found')
              ) {
                setError('type_id', {
                  message:
                    'Specified system type not found. Please select a valid system type.',
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
        <Stack
          spacing={2}
          sx={{
            width: '100%',
          }}
        >
          <Box sx={{ marginTop: '8px !important' }}>
            <TextField
              id="system-name-input"
              label="Name"
              required
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          </Box>
          <Controller
            control={control}
            name="type_id"
            render={({ field: { value, onChange } }) => (
              <Autocomplete
                disableClearable={value != null}
                id="systems-type-id-input"
                disabled={!!parentSystemTypeId}
                value={
                  parentSystemTypeId
                    ? (systemsTypes?.find(
                        (systemType) => systemType.id === parentSystemTypeId
                      ) ?? null)
                    : (systemsTypes?.find(
                        (systemType) => systemType.id === value
                      ) ?? null)
                }
                onChange={(_event, systemType: SystemType | null) => {
                  onChange(systemType?.id ?? null);
                }}
                sx={{ alignItems: 'center' }}
                fullWidth
                options={systemsTypes ?? []}
                isOptionEqualToValue={(option, value) => option.id == value.id}
                getOptionLabel={(option) => option.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required={true}
                    disabled={!!parentSystemTypeId}
                    label="Type"
                    error={!!errors.type_id}
                    helperText={errors.type_id?.message}
                  />
                )}
              />
            )}
          />
          <TextField
            id="system-description-input"
            label="Description"
            {...register('description')}
            multiline
            fullWidth
          />
          <TextField
            id="system-location-input"
            label="Location"
            {...register('location')}
            fullWidth
          />
          <TextField
            id="system-owner-input"
            label="Owner"
            {...register('owner')}
            fullWidth
          />
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
        </Stack>
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
};

export default SystemDialog;
