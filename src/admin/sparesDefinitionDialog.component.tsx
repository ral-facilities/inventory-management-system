import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  TextField,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SparesDefinitionPut, UsageStatus } from '../api/api.types';
import {
  useGetSparesDefinition,
  usePutSparesDefinition,
} from '../api/settings';
import { useGetUsageStatuses } from '../api/usageStatuses';
import WarningMessage from '../common/warningMessage.component';
import { SparesDefinitionSchema } from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';
import { areListsEqual } from '../utils';

export interface SparesDefinitionDialogProps {
  open: boolean;
  onClose: () => void;
}

const SparesDefinitionDialog = (props: SparesDefinitionDialogProps) => {
  const { open, onClose } = props;

  const { data: usageStatuses } = useGetUsageStatuses();
  const { data: sparesDefinition } = useGetSparesDefinition();

  const initialSparesDefinition: SparesDefinitionPut = React.useMemo(
    () => ({
      usage_statuses:
        sparesDefinition?.usage_statuses.map((status) => ({ id: status.id })) ||
        [],
    }),
    [sparesDefinition]
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    setError,
    reset,
    watch,
  } = useForm<SparesDefinitionPut>({
    resolver: zodResolver(SparesDefinitionSchema),
    defaultValues: initialSparesDefinition,
  });
  const { mutateAsync: putSparesDefinition, isPending: isPutPending } =
    usePutSparesDefinition();

  const [isWarningMessageChecked, setIsWarningMessageChecked] =
    React.useState(false);

  const handleClose = React.useCallback(() => {
    clearErrors();
    onClose();
    reset();
    setIsWarningMessageChecked(false);
  }, [clearErrors, onClose, reset]);

  const handlePutSparesDefinition = React.useCallback(
    (sparesDefinitionData: SparesDefinitionPut) => {
      if (initialSparesDefinition) {
        const isSparesDefinitionUpdated = !areListsEqual(
          initialSparesDefinition.usage_statuses.map((status) => status.id),
          sparesDefinitionData.usage_statuses.map((status) => status.id)
        );

        if (isSparesDefinitionUpdated) {
          putSparesDefinition(sparesDefinitionData)
            .then(() => handleClose())
            .catch((error: AxiosError) => {
              handleIMS_APIError(error);
            });
        } else {
          setError('root.formError', {
            message:
              'No changes detected in the spares definition. Please update the spares definition or select Cancel to exit.',
          });
        }
      }
    },
    [initialSparesDefinition, putSparesDefinition, handleClose, setError]
  );

  const onSubmit = (data: SparesDefinitionPut) => {
    handlePutSparesDefinition(data);
  };

  // Load the values for editing
  React.useEffect(() => {
    reset(initialSparesDefinition);
  }, [initialSparesDefinition, reset]);

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    if (errors.root?.formError) {
      const subscription = watch(() => clearErrors('root.formError'));
      return () => subscription.unsubscribe();
    }
  }, [clearErrors, errors, watch]);
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Spares Definition</DialogTitle>
      <DialogContent>
        <Controller
          control={control}
          name="usage_statuses"
          render={({ field: { value: usage_status_ids, onChange } }) => {
            const currentSparesDef: UsageStatus[] = usage_status_ids
              .map(
                ({ id }) =>
                  usageStatuses?.find((status) => status.id === id) || null
              )
              .filter((status): status is UsageStatus => status !== null);
            return (
              <Autocomplete
                id="item-usage-statuses-input"
                value={currentSparesDef}
                size="small"
                onChange={(_event, usageStatus: UsageStatus[]) => {
                  onChange(
                    usageStatus.map((status) => ({
                      id: status.id,
                    }))
                  );
                }}
                multiple
                sx={{ alignItems: 'center', mt: 1 }}
                fullWidth
                options={usageStatuses ?? []}
                isOptionEqualToValue={(option, value) => option.id == value.id}
                getOptionLabel={(option) => option.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required={true}
                    label="Usage statuses"
                    error={!!errors.usage_statuses}
                    helperText={errors.usage_statuses?.message}
                  />
                )}
              />
            );
          }}
        />
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', padding: '0px 24px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <WarningMessage
            isChecked={isWarningMessageChecked}
            setIsChecked={setIsWarningMessageChecked}
            message={
              'Saving these changes will trigger updates to all catalogue items and may cause modifications to items to be denied. Please confirm that you understand the consequences by checking the box to proceed.'
            }
          />
        </Box>
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
            disabled={isPutPending || !isWarningMessageChecked}
            endIcon={isPutPending ? <CircularProgress size={20} /> : null}
          >
            Save
          </Button>
        </Box>
        {errors.root?.formError && (
          <FormHelperText sx={{ marginBottom: '16px' }} error>
            {errors.root?.formError.message}
          </FormHelperText>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SparesDefinitionDialog;
