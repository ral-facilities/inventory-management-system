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
import { useDeleteCatalogueItem } from '../../api/catalogueItem';
import { CatalogueItem, ErrorParsing } from '../../app.types';

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

  const { mutateAsync: deleteCatalogueItem } = useDeleteCatalogueItem();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage('');
  }, [onClose]);
  const handleDeleteCatalogueCategory = React.useCallback(() => {
    if (catalogueItem) {
      deleteCatalogueItem(catalogueItem)
        .then((response) => {
          onClose();
          onChangeCatalogueItem(undefined);
        })
        .catch((error: AxiosError) => {
          const response = error.response?.data as ErrorParsing;
          if (response && error.response?.status === 409) {
            console.log(response.detail);
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
  }, [catalogueItem, deleteCatalogueItem, onChangeCatalogueItem, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        Delete Catalogue Item
        <WarningIcon sx={{ marginLeft: 0.5 }} />
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
        <Button onClick={handleDeleteCatalogueCategory} disabled={error}>
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
