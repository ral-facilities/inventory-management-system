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
import { APIImage } from '../../api/api.types';
import { useDeleteImage } from '../../api/images';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface DeleteImageProps {
  open: boolean;
  onClose: () => void;
  image: APIImage | undefined;
}

const DeleteImageDialog = (props: DeleteImageProps) => {
  const { open, onClose, image } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteImage, isPending: isDeletePending } =
    useDeleteImage();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage(undefined);
  }, [onClose]);

  const handleDeleteImage = React.useCallback(() => {
    if (image) {
      deleteImage(image.id)
        .then(() => {
          onClose();
        })
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [image, deleteImage, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Image
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-image-name">{image?.title}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteImage}
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

export default DeleteImageDialog;
