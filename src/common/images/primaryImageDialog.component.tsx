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
import React from 'react';
import ImageGallery from './imageGallery.component';

export interface DeleteImageProps {
  open: boolean;
  onClose: () => void;
  entityID: string;
}

const PrimaryImageDialog = (props: DeleteImageProps) => {
  const { open, onClose, entityID } = props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  return (
    <Dialog open={open} maxWidth="xl">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Primary Image
      </DialogTitle>
      <DialogContent>
        <ImageGallery entityId={entityID} dense={true} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
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

export default PrimaryImageDialog;
