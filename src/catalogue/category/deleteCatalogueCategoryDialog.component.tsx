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
import { CatalogueCategory } from '../../app.types';

export interface DeleteCatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueCategory: CatalogueCategory | undefined;
}

const DeleteCatalogueCategoryDialog = (
  props: DeleteCatalogueCategoryDialogProps
) => {
  const { open, onClose, catalogueCategory } = props;

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
          onClose();
        })
        .catch((error) => {
          setError(true);
          setErrorMessage(error.message);
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [catalogueCategory, deleteCatalogueCategory, onClose]);

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
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDeleteCatalogueCategory}>Continue</Button>
          {error && <FormHelperText error>{errorMessage}</FormHelperText>}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCatalogueCategoryDialog;
