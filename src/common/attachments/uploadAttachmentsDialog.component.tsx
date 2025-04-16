import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import AwsS3, { type AwsBody } from '@uppy/aws-s3';
import Uppy, { UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import ProgressBar from '@uppy/progress-bar';
import { DashboardModal } from '@uppy/react';
import statusBarStates from '@uppy/status-bar/lib/StatusBarStates';
import { AxiosError } from 'axios';
import React from 'react';
import { APIError } from '../../api/api.types';
import {
  useDeleteAttachment,
  usePostAttachmentMetadata,
} from '../../api/attachments';
import type { UppyUploadMetadata } from '../../app.types';
import { InventoryManagementSystemSettingsContext } from '../../configProvider.component';
import handleIMS_APIError from '../../handleIMS_APIError';
import { getNonEmptyTrimmedString, parseErrorResponse } from '../../utils';
import { getUploadingState, useMetaFields } from '../uppy.utils';

export interface UploadAttachmentsDialogProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
}

const UploadAttachmentsDialog = (props: UploadAttachmentsDialogProps) => {
  const { open, onClose, entityId } = props;

  const theme = useTheme();

  const queryClient = useQueryClient();

  const { attachmentAllowedFileExtensions, maxAttachmentSizeBytes } =
    React.useContext(InventoryManagementSystemSettingsContext);

  // Note: File systems use a factor of 1024 for GB, MB and KB instead of 1000,
  // so here the former is expected despite them really being GiB, MiB and KiB.
  const maxAttachmentSizeMB = maxAttachmentSizeBytes / 1024 ** 2;

  const { mutateAsync: postAttachmentMetadata } = usePostAttachmentMetadata();

  const { mutateAsync: deleteAttachment } = useDeleteAttachment();

  const [fileMetadataMap, setFileMetadataMap] = React.useState<
    Record<string, string>
  >({});

  const [uppy] = React.useState<Uppy<UppyUploadMetadata, AwsBody>>(
    new Uppy<UppyUploadMetadata, AwsBody>({
      autoProceed: false,
      restrictions: {
        maxFileSize: maxAttachmentSizeBytes,
        requiredMetaFields: ['name'],
        allowedFileTypes: attachmentAllowedFileExtensions,
      },
    })
      .use(AwsS3<UppyUploadMetadata, AwsBody>, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          const response = await postAttachmentMetadata({
            entity_id: entityId,
            file_name: file.meta.name,
            title: getNonEmptyTrimmedString(file.meta.title),
            description: getNonEmptyTrimmedString(file.meta.description),
          }).catch((error) => {
            const response = error.response?.data as APIError;
            const errorMessage = response.detail.toLocaleLowerCase();
            const returnMessage = parseErrorResponse(errorMessage);
            throw new Error(returnMessage);
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

  // This is necessary to prevent multiple calls of the delete endpoint.
  const deletedFileIds = React.useRef(new Set<string>());

  const updateFileMetadata = React.useCallback(
    async (
      file?: UppyFile<UppyUploadMetadata, AwsBody>,
      deleteMetadata: boolean = false
    ) => {
      const fileId = file?.id;
      if (!fileId) return;

      const id = fileMetadataMap[fileId];

      if (id) {
        if (
          deleteMetadata &&
          !deletedFileIds.current.has(fileId) &&
          file?.progress.uploadComplete === false
        ) {
          deletedFileIds.current.add(fileId);
          await deleteAttachment(id).catch((error: AxiosError) => {
            handleIMS_APIError(error, false);
          });
        }

        setFileMetadataMap((prev) => {
          const newMap = Object.fromEntries(
            Object.entries(prev).filter(([key]) => key !== fileId)
          );

          // Reset deletedFileIds if newMap is empty
          if (Object.keys(newMap).length === 0) {
            deletedFileIds.current.clear();
          }

          return newMap;
        });
      }
    },
    [deleteAttachment, deletedFileIds, fileMetadataMap]
  );

  const { files = {}, error, recoveredState } = uppy.getState();
  const { isAllComplete } = uppy.getObjectOfFilesPerState();

  const handleClose = React.useCallback(() => {
    // prevent users from closing the dialog while the download is in progress
    const uploadState = getUploadingState(
      error,
      isAllComplete,
      recoveredState,
      files
    );
    if (
      uploadState === statusBarStates.STATE_POSTPROCESSING ||
      uploadState === statusBarStates.STATE_PREPROCESSING ||
      uploadState === statusBarStates.STATE_UPLOADING
    ) {
      return;
    }
    onClose();
    setFileMetadataMap({});
    uppy.clear();
    queryClient.invalidateQueries({ queryKey: ['Attachments', entityId] });
  }, [
    entityId,
    error,
    files,
    isAllComplete,
    onClose,
    queryClient,
    recoveredState,
    uppy,
  ]);

  // Track the start and completion of uploads
  uppy.on('upload-error', async (file) => await updateFileMetadata(file, true));
  uppy.on('file-removed', async (file) => await updateFileMetadata(file, true));
  uppy.on('upload-success', async (file) => await updateFileMetadata(file));

  const metaFields = useMetaFields<UppyUploadMetadata, AwsBody>();

  return (
    <DashboardModal
      open={open}
      onRequestClose={handleClose}
      closeModalOnClickOutside={false}
      animateOpenClose={false}
      uppy={uppy}
      note={`Files cannot be larger than ${maxAttachmentSizeMB}MB. Only supported attachments are allowed.`}
      proudlyDisplayPoweredByUppy={false}
      theme={theme.palette.mode}
      doneButtonHandler={handleClose}
      metaFields={metaFields}
    />
  );
};

export default UploadAttachmentsDialog;
