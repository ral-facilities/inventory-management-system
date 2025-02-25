import {
  Button,
  CircularProgress,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ThemeProvider,
  useTheme,
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
  const theme = useTheme();

  const modifiedTheme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      background: {
        ...theme.palette.background,
        paper: theme.palette.mode === 'dark' ? '#1B1B1B' : 'white',
      },
    },
  });

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
    <ThemeProvider theme={modifiedTheme}>
      <Dialog open={open} maxWidth="xl" fullWidth>
        <DialogTitle
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Select Primary Image
        </DialogTitle>
        <ThemeProvider theme={theme}>
          <DialogContent>
            <ImageGallery
              entityId={entityID}
              dense={true}
              setSelectedPrimaryID={setSelectedPrimaryID}
            />
          </DialogContent>
        </ThemeProvider>
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
    </ThemeProvider>
  );
};

export default PrimaryImageDialog;
