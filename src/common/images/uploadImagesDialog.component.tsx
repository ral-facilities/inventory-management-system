import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import Uppy from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import ImageEditor from '@uppy/image-editor';
import '@uppy/image-editor/dist/style.css';
import ProgressBar from '@uppy/progress-bar'; // Import the ProgressBar plugin
import { DashboardModal } from '@uppy/react';
import statusBarStates from '@uppy/status-bar/lib/StatusBarStates';
import XHR from '@uppy/xhr-upload';
import React from 'react';
import { uppyOnAfterResponse, uppyOnBeforeRequest } from '../../api/api';
import type {
  UppyImageUploadResponse,
  UppyUploadMetadata,
} from '../../app.types';
import { InventoryManagementSystemSettingsContext } from '../../configProvider.component';
import { getNonEmptyTrimmedString } from '../../utils';
import { getUploadingState, useMetaFields } from '../uppy.utils';

export interface UploadImagesDialogProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
}

const UploadImagesDialog = (props: UploadImagesDialogProps) => {
  const { open, onClose, entityId } = props;

  const theme = useTheme();

  const queryClient = useQueryClient();

  const { maxImageSizeBytes, osApiUrl, imageAllowedFileExtensions } =
    React.useContext(InventoryManagementSystemSettingsContext);

  // Note: File systems use a factor of 1024 for GB, MB and KB instead of 1000,
  // so here the former is expected despite them really being GiB, MiB and KiB.
  const maxFileSizeMB = maxImageSizeBytes / 1024 ** 2;

  const [uppy] = React.useState<
    Uppy<UppyUploadMetadata, UppyImageUploadResponse>
  >(() => {
    const newUppy = new Uppy<UppyUploadMetadata, UppyImageUploadResponse>({
      autoProceed: false,
      restrictions: {
        maxFileSize: maxImageSizeBytes,
        requiredMetaFields: ['name'],
        allowedFileTypes: imageAllowedFileExtensions,
      },
    })
      .use(ImageEditor)
      .use(ProgressBar);

    newUppy.use(XHR, {
      endpoint: `${osApiUrl}/images`,
      method: 'POST',
      fieldName: 'upload_file',
      async onBeforeRequest(xhr) {
        uppyOnBeforeRequest(xhr);
      },
      async onAfterResponse(xhr) {
        await uppyOnAfterResponse(xhr);
      },
    });

    return newUppy;
  });

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
    uppy.clear();
    queryClient.invalidateQueries({ queryKey: ['Images', entityId] });
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

  React.useEffect(() => {
    uppy.setMeta({
      entity_id: entityId,
    });
  }, [entityId, uppy]);

  uppy.on('dashboard:file-edit-complete', (file) => {
    if (file) {
      const { title, description, ...restMeta } = file.meta;

      const formattedTitle = getNonEmptyTrimmedString(title);
      const formattedDescription = getNonEmptyTrimmedString(description);

      const updatedFileData = {
        ...restMeta,
        ...(formattedTitle && { title: formattedTitle }),
        ...(formattedDescription && { description: formattedDescription }),
      };

      uppy.patchFilesState({
        [file.id]: {
          meta: updatedFileData,
        },
      });
    }
  });

  const metaFields = useMetaFields<
    UppyUploadMetadata,
    UppyImageUploadResponse
  >();

  return (
    <DashboardModal
      open={open}
      locale={{
        strings: {
          dropPasteFiles: 'Drop images here or %{browseFiles}',
        },
        pluralize: (n) => {
          if (n === 1) {
            return 0;
          }
          return 1;
        },
      }}
      onRequestClose={handleClose}
      closeModalOnClickOutside={false}
      animateOpenClose={false}
      uppy={uppy}
      note={`Files cannot be larger than ${maxFileSizeMB}MB. Supported file types: ${imageAllowedFileExtensions.join(', ')}.`}
      proudlyDisplayPoweredByUppy={false}
      theme={theme.palette.mode}
      doneButtonHandler={handleClose}
      metaFields={metaFields}
    />
  );
};

export default UploadImagesDialog;
