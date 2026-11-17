import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AxiosError } from 'axios';
import React from 'react';
import z from 'zod';
import { APIError, CatalogueCategory } from '../../../api/api.types';
import { useDeleteCatalogueCategoryProperty } from '../../../api/catalogueCategories';
import { CatalogueCategorySchema } from '../../../form.schemas';
import handleIMS_APIError from '../../../handleIMS_APIError';
import { MigrationWarningMessage } from './propertyDialog.component';

export interface DeletePropertyDialogProps {
  open: boolean;
  onClose: (props: { successfulDeletion: boolean }) => void;
  catalogueCategory?: CatalogueCategory;
  selectedProperty?: NonNullable<
    z.input<typeof CatalogueCategorySchema>['properties']
  >[number];
}

const DeletePropertyDialog = (props: DeletePropertyDialogProps) => {
  const { open, onClose, catalogueCategory, selectedProperty } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const [isWarningChecked, setIsWarningChecked] = React.useState(false);

  const { mutateAsync: deleteProperty, isPending: isDeletePending } =
    useDeleteCatalogueCategoryProperty();

  const handleClose = React.useCallback(
    (props: { successfulDeletion: boolean }) => {
      onClose({ successfulDeletion: props.successfulDeletion });
      setError(false);
      setErrorMessage('');
    },
    [onClose]
  );
  const handleDeleteProperty = React.useCallback(() => {
    const propertyAPIFormat = catalogueCategory?.properties.find(
      (prop) => prop.name === selectedProperty?.name
    );

    if (catalogueCategory && propertyAPIFormat) {
      deleteProperty({
        catalogueCategory,
        property: propertyAPIFormat,
      })
        .then(() => {
          handleClose({ successfulDeletion: true });
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as APIError;
          if (response && error.response?.status === 409) {
            setError(true);
            setErrorMessage(response.detail);
            return;
          }
          handleIMS_APIError(error);
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [catalogueCategory, deleteProperty, handleClose, selectedProperty?.name]);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Property as Admin
        <Tooltip
          title="As an admin, you can delete properties"
          data-testid={'admin-status-tooltip'}
          placement="top"
          enterTouchDelay={0}
          arrow
          sx={{ mx: 2 }}
        >
          <InfoOutlinedIcon />
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-property-name">
          {selectedProperty?.name}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Grid
          container
          size={12}
          sx={{
            px: 1.5,
          }}
        >
          <Grid size={12}>
            <MigrationWarningMessage
              isChecked={isWarningChecked}
              setIsChecked={setIsWarningChecked}
            />
          </Grid>
          <Grid
            size={12}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 2,
              marginBottom: 1,
            }}
          >
            <Button onClick={() => handleClose({ successfulDeletion: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProperty}
              disabled={isDeletePending || error || !isWarningChecked}
              endIcon={isDeletePending ? <CircularProgress size={20} /> : null}
            >
              Continue
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
      {error && (
        <Box
          sx={{
            mx: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ maxWidth: '100%', fontSize: '1rem' }} error>
            {errorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default DeletePropertyDialog;
