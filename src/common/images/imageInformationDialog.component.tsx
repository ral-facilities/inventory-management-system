import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import { APIImage } from '../../api/api.types'; // Make sure this path points to your types
import { formatDateTimeStrings } from '../../utils';
import ThumbnailImage from './thumbnailImage.component';

export interface ImageInformationDialogProps {
  open: boolean;
  onClose: () => void;
  image: APIImage;
}

const ImageInformationDialog = (props: ImageInformationDialogProps) => {
  const { open, onClose, image } = props;

  return (
    <Dialog
      // SciGateway navigation drawer is 1200 and the gallery lightbox 1210
      sx={{ zIndex: 1210 + 10 }}
      open={open}
      maxWidth="sm"
      disableEnforceFocus
      fullWidth
    >
      <DialogTitle>Image Information</DialogTitle>
      <DialogContent>
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}
          >
            <ThumbnailImage image={image} dense={false} />
          </Box>

          <Typography variant="h6">File Name:</Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            {image.file_name}
          </Typography>
          <Divider sx={{ marginY: 2 }} />

          {image.title && (
            <>
              <Typography variant="h6">Title:</Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {image.title}
              </Typography>
              <Divider sx={{ marginY: 2 }} />
            </>
          )}

          {image.description && (
            <>
              <Typography variant="h6">Description:</Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {image.description}
              </Typography>
              <Divider sx={{ marginY: 2 }} />
            </>
          )}

          <Typography variant="h6">Primary:</Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            {image.primary ? 'Yes' : 'No'}
          </Typography>
          <Divider sx={{ marginY: 2 }} />

          <Typography variant="h6">Created Time:</Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            {formatDateTimeStrings(image.created_time, true)}
          </Typography>
          <Divider sx={{ marginY: 2 }} />

          <Typography variant="h6">Modified Time:</Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            {formatDateTimeStrings(image.modified_time, true)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageInformationDialog;
