import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { useDeleteCatalogueCategory } from '../../api/catalogueCategory';
import { CatalogueCategory, ErrorParsing } from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface DeleteCatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueCategory: CatalogueCategory | undefined;
  onChangeCatalogueCategory: (
    catalogueCategory: CatalogueCategory | undefined
  ) => void;
}

const DeleteCatalogueCategoryDialog = (
  props: DeleteCatalogueCategoryDialogProps
) => {
  const { open, onClose, catalogueCategory, onChangeCatalogueCategory } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteCatalogueCategory, isPending: isDeletePending } =
    useDeleteCatalogueCategory();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage('');
  }, [onClose]);
  const handleDeleteCatalogueCategory = React.useCallback(() => {
    if (catalogueCategory) {
      deleteCatalogueCategory(catalogueCategory)
        .then(() => {
          onChangeCatalogueCategory(undefined);
          onClose();
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;
          if (response && error.response?.status === 409) {
            setError(true);
            setErrorMessage(
              `${response.detail}, please delete the children elements first`
            );
            return;
          }
          handleIMS_APIError(error);
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [
    catalogueCategory,
    deleteCatalogueCategory,
    onChangeCatalogueCategory,
    onClose,
  ]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) =>
        event && reason == 'backdropClick' ? null : handleClose()
      }
      maxWidth="lg"
    >
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Catalogue Category
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-catalogue-category-name">
          {catalogueCategory?.name}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteCatalogueCategory}
          disabled={isDeletePending || error}
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

export default DeleteCatalogueCategoryDialog;
