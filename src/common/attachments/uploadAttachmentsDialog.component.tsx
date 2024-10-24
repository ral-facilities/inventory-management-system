import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
} from '@mui/material';
import AwsS3, { AwsBody } from '@uppy/aws-s3';
import Uppy, { Meta, UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import ProgressBar from '@uppy/progress-bar'; // Import the ProgressBar plugin
import { Dashboard } from '@uppy/react';
import React from 'react';
import { usePostAttachmentMetadata } from '../../api/attachments';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_B = MAX_FILE_SIZE_MB * 1000 * 1000;

export interface UploadAttachmentsDialogProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
}

const UploadAttachmentsDialog = (props: UploadAttachmentsDialogProps) => {
  const { open, onClose, entityId } = props;
  const theme = useTheme();

  const [isUploading, setIsUploading] = React.useState(false);
  const [uppy, setUppy] = React.useState<Uppy<Meta, AwsBody> | null>(null);
  const [fileMetadataMap, setFileMetadataMap] = React.useState<
    Record<string, string>
  >({});

  const { mutateAsync: postAttachmentMetadata } = usePostAttachmentMetadata();

  // Handlers for upload-error and file-removed events
  const handleUploadError = React.useCallback(
    (fileMetadataMap: Record<string, string>) =>
      (file?: UppyFile<Meta, AwsBody>) => {
        const id = fileMetadataMap[file?.id ?? ''];
        // TODO CHeck if it exist in database first
        // This should fix the multiple deletion error
        if (id) {
          // TODO delete if the upload has failed
          // console.log('Delete id ', id);
          const newMap = { ...fileMetadataMap };
          delete newMap[file?.id ?? ''];
        }
        setIsUploading(false);
      },
    []
  );

  const handleFileRemoved = React.useCallback(
    (fileMetadataMap: Record<string, string>) =>
      (file: UppyFile<Meta, AwsBody>) => {
        const id = fileMetadataMap[file?.id ?? ''];
        // TODO CHeck if it exist in database first
        // This should fix the multiple deletion error
        if (id) {
          // TODO delete if the file has been removed mid upload
          // console.log('Delete id ', id);
          const newMap = { ...fileMetadataMap };
          delete newMap[file?.id ?? ''];
        }

        setIsUploading(false);
      },
    []
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setFileMetadataMap({});
    setIsUploading(false);
  }, [onClose]);

  React.useEffect(() => {
    if (open) {
      const uppyInstance = new Uppy<Meta, AwsBody>({
        autoProceed: false,
        restrictions: {
          maxFileSize: MAX_FILE_SIZE_B,
          requiredMetaFields: ['name'],
        },
      });

      // Set up the S3 upload with a pre-signed URL
      uppyInstance.use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          // Collect metadata directly from the file object
          const response = await postAttachmentMetadata({
            entity_id: entityId,
            file_name: (file.meta.name as string) || '',
            title:
              typeof file.meta.title === 'string' && file.meta.title.trim()
                ? (file.meta.title as string)
                : undefined,
            description:
              typeof file.meta.description === 'string' &&
              file.meta.description.trim()
                ? file.meta.description
                : undefined,
          });

          setFileMetadataMap((prev) => ({
            ...prev,
            [file.id]: response.id,
          }));

          return {
            method: 'POST',
            url: response.upload_info.url,
            fields: response.upload_info.fields,
          };
        },
      });

      // Use the FileInput and ProgressBar plugins

      uppyInstance.use(ProgressBar);

      setUppy(uppyInstance);

      return () => uppyInstance.cancelAll();
    }
  }, [open, entityId, postAttachmentMetadata]);

  // Track the start and completion of uploads
  uppy?.on('upload', () => setIsUploading(true));
  uppy?.on('complete', () => setIsUploading(false));

  uppy?.on('upload-error', handleUploadError(fileMetadataMap));

  uppy?.on('file-removed', handleFileRemoved(fileMetadataMap));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Attachments</DialogTitle>
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
                id: 'name',
                name: 'File name',
                placeholder: 'Enter file name',
              },
              {
                id: 'title',
                name: 'Title',
                placeholder: 'Enter file title',
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

export default UploadAttachmentsDialog;
