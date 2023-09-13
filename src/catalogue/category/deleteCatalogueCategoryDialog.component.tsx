import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import React from 'react';
import { useDeleteCatalogueCategory } from '../../api/catalogueCategory';
import { CatalogueCategory, ErrorParsing } from '../../app.types';
import { AxiosError } from 'axios';

export interface DeleteCatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueCategory: CatalogueCategory | undefined;
  refetchData: () => void;
}

const DeleteCatalogueCategoryDialog = (
  props: DeleteCatalogueCategoryDialogProps
) => {
  const { open, onClose, catalogueCategory, refetchData } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteCatalogueCategory } = useDeleteCatalogueCategory();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage('');
  }, [onClose]);
  const handleDeleteCatalogueCategory = React.useCallback(() => {
    if (catalogueCategory) {
      deleteCatalogueCategory(catalogueCategory)
        .then((response) => {
          refetchData();
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
          setError(true);
          setErrorMessage('Please refresh and try again');
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [catalogueCategory, deleteCatalogueCategory, onClose, refetchData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Delete Catalogue Category</DialogTitle>
      <DialogContent>
        Are you sure you want to delete{' '}
        <strong data-testid="delete-catalogue-category-name">
          {catalogueCategory?.name}
        </strong>
        ?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDeleteCatalogueCategory}>Continue</Button>
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
