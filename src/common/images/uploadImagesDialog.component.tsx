import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
} from '@mui/material';
import { AwsBody } from '@uppy/aws-s3';
import Uppy, { Meta } from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import ProgressBar from '@uppy/progress-bar'; // Import the ProgressBar plugin
import { Dashboard } from '@uppy/react';
import XHR from '@uppy/xhr-upload';
import React from 'react';
import { settings } from '../../settings';

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_B = MAX_FILE_SIZE_MB * 1048576;

export interface UploadImagesDialogProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
}

const UploadImagesDialog = (props: UploadImagesDialogProps) => {
  const { open, onClose, entityId } = props;
  const theme = useTheme();

  const [isUploading, setIsUploading] = React.useState(false);
  const [uppy, setUppy] = React.useState<Uppy<Meta, AwsBody> | null>(null);

  const handleClose = React.useCallback(() => {
    onClose();
    setIsUploading(false);
  }, [onClose]);

  const storageApiUrl = async () => (await settings)?.storageApiUrl || '';

  React.useEffect(() => {
    if (open) {
      const uppyInstance = new Uppy<Meta, AwsBody>({
        autoProceed: false,
        restrictions: {
          maxFileSize: MAX_FILE_SIZE_B,
          requiredMetaFields: ['name'],
          allowedFileTypes: ['image/*'], // Only allow image files
        },
      });

      // Set up the S3 upload with a pre-signed URL

      uppyInstance.setMeta({
        entity_id: entityId, // Add entityId here
      });

      storageApiUrl().then((url) => {
        uppyInstance.use(XHR, {
          endpoint: `${url}/images`,
          method: 'POST',
          fieldName: 'upload_file',
        });
      });

      // Use the FileInput and ProgressBar plugins

      uppyInstance.use(ProgressBar);

      setUppy(uppyInstance);

      return () => uppyInstance.cancelAll();
    }
  }, [open, entityId]);

  // Track the start and completion of uploads
  uppy?.on('upload', () => setIsUploading(true));
  uppy?.on('complete', () => setIsUploading(false));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Images</DialogTitle>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
        {uppy && (
          <Dashboard
            uppy={uppy}
            note={`Files cannot be larger than ${MAX_FILE_SIZE_MB}MB`}
            proudlyDisplayPoweredByUppy={false}
            doneButtonHandler={handleClose}
            theme={theme.palette.mode}
            metaFields={[
              {
                id: 'title',
                name: 'Title',
                placeholder: 'Enter file title',
              },
              {
                id: 'name',
                name: 'Name',
                placeholder: 'Enter file name',
              },
              {
                id: 'description',
                name: 'Description',
                placeholder: 'Enter file description',
              },
            ]}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          sx={{ width: '100%', mx: 1 }}
          onClick={handleClose}
          disabled={isUploading}
          color="secondary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadImagesDialog;
