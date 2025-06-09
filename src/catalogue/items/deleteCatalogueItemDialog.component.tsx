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
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { APIError, CatalogueItem } from '../../api/api.types';
import { useDeleteCatalogueItem } from '../../api/catalogueItems';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface DeleteCatalogueItemDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueItem: CatalogueItem | undefined;
  onChangeCatalogueItem: (catalogueItem: CatalogueItem | undefined) => void;
}

const DeleteCatalogueItemDialog = (props: DeleteCatalogueItemDialogProps) => {
  const { open, onClose, catalogueItem, onChangeCatalogueItem } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteCatalogueItem, isPending: isDeletePending } =
    useDeleteCatalogueItem();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage('');
  }, [onClose]);
  const handleDeleteCatalogueCategory = React.useCallback(() => {
    if (catalogueItem) {
      deleteCatalogueItem(catalogueItem.id)
        .then(() => {
          onClose();
          onChangeCatalogueItem(undefined);
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as APIError;
          if (response && error.response?.status === 409) {
            setError(true);
            setErrorMessage(
              `${response.detail}, please delete the children elements first`
            );
            return;
          } else if (
            response &&
            error.response?.status == 422 &&
            response.detail.includes('replacement')
          ) {
            setError(true);
            setErrorMessage(
              `${response.detail}, please either change the replacement first, delete the item that is obsolete or contact support.`
            );
          }
          handleIMS_APIError(error);
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [catalogueItem, deleteCatalogueItem, onChangeCatalogueItem, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Catalogue Item
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-catalogue-category-name">
          {catalogueItem?.name}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteCatalogueCategory}
          disabled={isDeletePending || error}
          endIcon={isDeletePending ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
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

export default DeleteCatalogueItemDialog;
