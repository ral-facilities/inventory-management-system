import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { ImageMetadataPatch } from '../../api/api.types';
import { usePatchImage } from '../../api/images';
import handleIMS_APIError from '../../handleIMS_APIError';
import ImageGallery from './imageGallery.component';

export interface PrimaryImageProps {
  open: boolean;
  onClose: () => void;
  entityID: string;
}

const PrimaryImageDialog = (props: PrimaryImageProps) => {
  const { open, onClose, entityID } = props;

  const [selectedPrimaryID, setSelectedPrimaryID] = React.useState<string>('');

  const { mutateAsync: editImage, isPending: editPending } = usePatchImage();

  const handleClose = React.useCallback(() => {
    onClose();
    setSelectedPrimaryID('');
  }, [onClose]);

  const handleEditImage = React.useCallback(() => {
    const fileToEdit: ImageMetadataPatch = { primary: true };
    editImage({ id: selectedPrimaryID, fileMetadata: fileToEdit })
      .then(() => {
        handleClose();
      })
      .catch((error: AxiosError) => {
        handleIMS_APIError(error);
      });
  }, [selectedPrimaryID, editImage, handleClose]);

  return (
    <Dialog
      open={open}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { backgroundColor: 'background.default' } }}
    >
      <DialogTitle
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Select Primary Image
      </DialogTitle>
      <DialogContent>
        <ImageGallery
          entityId={entityID}
          dense={true}
          setSelectedPrimaryID={setSelectedPrimaryID}
        />
      </DialogContent>
      <DialogActions
        sx={{
          display: 'inline-flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleEditImage}
          disabled={editPending || selectedPrimaryID === ''}
          endIcon={editPending ? <CircularProgress size={20} /> : null}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrimaryImageDialog;
