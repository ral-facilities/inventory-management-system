import { useTheme } from '@mui/material';
import AwsS3 from '@uppy/aws-s3';
import Uppy, { Body, Meta, UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import ProgressBar from '@uppy/progress-bar';
import { DashboardModal } from '@uppy/react';
import React from 'react';
import { usePostAttachmentMetadata } from '../../api/attachments';
import { getNonEmptyTrimmedString } from '../../utils';

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

  const { mutateAsync: postAttachmentMetadata } = usePostAttachmentMetadata();
  const [fileMetadataMap, setFileMetadataMap] = React.useState<
    Record<string, string>
  >({});

  const [uppy] = React.useState<Uppy<Meta, Body>>(
    new Uppy<Meta, Body>({
      autoProceed: false,
      restrictions: {
        maxFileSize: MAX_FILE_SIZE_B,
        requiredMetaFields: ['name'],
      },
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          const response = await postAttachmentMetadata({
            entity_id: entityId,
            file_name: (file.meta.name as string) || '',
            title: getNonEmptyTrimmedString(file.meta.title),
            description: getNonEmptyTrimmedString(file.meta.description),
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

  const updateFileMetadata = React.useCallback(
    (file?: UppyFile<Meta, Body>, deleteMetadata?: boolean) => {
      const id = fileMetadataMap[file?.id ?? ''];
      if (id) {
        if (deleteMetadata) {
          // TODO: Implement logic to delete metadata using id
          // If metadata exists for the given id, remove it from the api
          // If not, do nothing and exit the function
        }

        const newMap = Object.fromEntries(
          Object.entries(fileMetadataMap).filter(([key]) => key !== file?.id)
        );
        setFileMetadataMap(newMap);
      }
    },
    [fileMetadataMap]
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setFileMetadataMap({});
    uppy.cancelAll();
  }, [onClose, uppy]);

  // Track the start and completion of uploads
  uppy.on('upload-error', (file) => updateFileMetadata(file, true));
  uppy.on('file-removed', (file) => updateFileMetadata(file, true));
  uppy.on('upload-success', (file) => updateFileMetadata(file));

  return (
    <DashboardModal
      open={open}
      onRequestClose={handleClose}
      closeModalOnClickOutside={false}
      animateOpenClose={false}
      uppy={uppy}
      note={`Files cannot be larger than ${MAX_FILE_SIZE_MB}MB. Only supported attachments are allowed.`}
      proudlyDisplayPoweredByUppy={false}
      theme={theme.palette.mode}
      doneButtonHandler={handleClose}
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
  );
};

export default UploadAttachmentsDialog;
