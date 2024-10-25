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
// Note: File systems use a factor of 1024 for GB, MB and KB instead of 1000, so here the former is expected despite them really being GiB, MiB and KiB.
const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_B = MAX_FILE_SIZE_MB * 1024 * 1024;
export interface UploadAttachmentsDialogProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
}

const UploadAttachmentsDialog = (props: UploadAttachmentsDialogProps) => {
  const { open, onClose, entityId } = props;
  const theme = useTheme();

  const [isUploading, setIsUploading] = React.useState(false);

  const { mutateAsync: postAttachmentMetadata } = usePostAttachmentMetadata();
  const [uppy] = React.useState<Uppy<Meta, AwsBody>>(
    new Uppy<Meta, AwsBody>({
      autoProceed: false,
      restrictions: {
        maxFileSize: MAX_FILE_SIZE_B,
        requiredMetaFields: ['name'],
      },
    })
      .use(AwsS3, {
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
      })
      .use(ProgressBar)
  );

  const [fileMetadataMap, setFileMetadataMap] = React.useState<
    Record<string, string>
  >({});

  const handleUploadError = React.useCallback(
    (file?: UppyFile<Meta, AwsBody>) => {
      const id = fileMetadataMap[file?.id ?? ''];

      if (id) {
        // Filter out the failed upload file
        const newMap = Object.fromEntries(
          Object.entries(fileMetadataMap).filter(([key]) => key !== file?.id)
        );

        setFileMetadataMap(newMap);

        // Set isUploading to false only if there is exactly one item left before this deletion
        if (Object.values(newMap).length === 0) {
          setIsUploading(false);
        }
      }
    },
    [fileMetadataMap]
  );

  const handleFileRemoved = React.useCallback(
    (file: UppyFile<Meta, AwsBody>) => {
      const id = fileMetadataMap[file?.id ?? ''];

      if (id) {
        // Filter out the file removed mid-upload
        const newMap = Object.fromEntries(
          Object.entries(fileMetadataMap).filter(([key]) => key !== file?.id)
        );

        setFileMetadataMap(newMap);

        // Set isUploading to false only if there is exactly one item left before this deletion
        if (Object.values(newMap).length === 0) {
          setIsUploading(false);
        }
      }
    },
    [fileMetadataMap]
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setFileMetadataMap({});
    setIsUploading(false);
  }, [onClose]);

  // Track the start and completion of uploads
  uppy.on('upload', () => setIsUploading(true));
  uppy.on('complete', () => setIsUploading(false));

  uppy.on('upload-error', handleUploadError);

  uppy.on('file-removed', handleFileRemoved);

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
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
