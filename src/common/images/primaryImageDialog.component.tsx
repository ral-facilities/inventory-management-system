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
import ImageGallery from './imageGallery.component';
import UploadImagesDialog from './uploadImagesDialog.component';

export interface DeleteImageProps {
  open: boolean;
  onClose: () => void;
  entityID: string;
}

const PrimaryImageDialog = (props: DeleteImageProps) => {
  const { open, onClose, entityID } = props;

  const [openUploadDialog, setOpenUploadDialog] =
    React.useState<boolean>(false);

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  return (
    <>
      <UploadImagesDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        entityId={entityID}
      />
      <Dialog open={open} maxWidth="xl">
        <DialogTitle
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Select Primary Image
          <Button
            onClick={() => {
              setOpenUploadDialog(true);
            }}
          >
            Upload Image
          </Button>
        </DialogTitle>
        <DialogContent>
          <ImageGallery entityId={entityID} dense={true} />
        </DialogContent>
        <DialogActions
          sx={{ display: 'inline-flex', justifyContent: 'space-between' }}
        >
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Save</Button>
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
    </>
  );
};

export default PrimaryImageDialog;
