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
import { APIImage, ImageMetadataPatch } from '../../api/api.types';
import { usePatchImage } from '../../api/images';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface RemovePrimaryImageProps {
  open: boolean;
  onClose: () => void;
  image: APIImage;
}

const RemovePrimaryImageDialog = (props: RemovePrimaryImageProps) => {
  const { open, onClose, image } = props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: patchImage, isPending: isEditPending } = usePatchImage();

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  const handlePatchImage = React.useCallback(() => {
    if (image) {
      const fileToEdit: ImageMetadataPatch = {
        primary: false,
        file_name: image.file_name,
      };
      patchImage({ id: image.id, fileMetadata: fileToEdit })
        .then(() => {
          onClose();
        })
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    } else {
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [image, patchImage, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Remove Primary Image
      </DialogTitle>
      <DialogContent>
        Are you sure you want to remove{' '}
        <strong data-testid="remove-image-name">{image?.file_name}</strong> as
        primary image?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handlePatchImage}
          disabled={isEditPending || errorMessage != undefined}
          endIcon={isEditPending ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
      {errorMessage != undefined && (
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

export default RemovePrimaryImageDialog;
