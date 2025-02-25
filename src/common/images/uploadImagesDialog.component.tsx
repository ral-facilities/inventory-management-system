import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import Uppy from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import ImageEditor from '@uppy/image-editor';
import '@uppy/image-editor/dist/style.css';
import ProgressBar from '@uppy/progress-bar'; // Import the ProgressBar plugin
import { DashboardModal } from '@uppy/react';
import XHR from '@uppy/xhr-upload';
import React from 'react';
import { uppyOnAfterResponse, uppyOnBeforeRequest } from '../../api/api';
import type {
  UppyImageUploadResponse,
  UppyUploadMetadata,
} from '../../app.types';
import { settings } from '../../settings';
import { getNonEmptyTrimmedString } from '../../utils';
import { useMetaFields } from '../uppy.utils';

// Note: File systems use a factor of 1024 for GB, MB and KB instead of 1000, so here the former is expected despite them really being GiB, MiB and KiB.
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_B = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface UploadImagesDialogProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
}

const UploadImagesDialog = (props: UploadImagesDialogProps) => {
  const { open, onClose, entityId } = props;

  const theme = useTheme();

  const queryClient = useQueryClient();

  const osApiUrl = async () => (await settings)?.osApiUrl || '';
  const [uppy] = React.useState<
    Uppy<UppyUploadMetadata, UppyImageUploadResponse>
  >(() => {
    const newUppy = new Uppy<UppyUploadMetadata, UppyImageUploadResponse>({
      autoProceed: false,
      restrictions: {
        maxFileSize: MAX_FILE_SIZE_B,
        requiredMetaFields: ['name'],
        allowedFileTypes: ['image/*'],
      },
    })
      .use(ImageEditor)
      .use(ProgressBar);

    osApiUrl().then((url) => {
      newUppy.use(XHR, {
        endpoint: `${url}/images`,
        method: 'POST',
        fieldName: 'upload_file',
        async onBeforeRequest(xhr) {
          uppyOnBeforeRequest(xhr);
        },
        async onAfterResponse(xhr) {
          await uppyOnAfterResponse(xhr);
        },
      });
    });

    return newUppy;
  });

  const handleClose = React.useCallback(() => {
    onClose();
    uppy.cancelAll();
    queryClient.invalidateQueries({ queryKey: ['Images', entityId] });
  }, [entityId, onClose, queryClient, uppy]);

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
      onRequestClose={handleClose}
      closeModalOnClickOutside={false}
      animateOpenClose={false}
      uppy={uppy}
      note={`Files cannot be larger than ${MAX_FILE_SIZE_MB}MB. Only images are allowed.`}
      proudlyDisplayPoweredByUppy={false}
      theme={theme.palette.mode}
      doneButtonHandler={handleClose}
      metaFields={metaFields}
    />
  );
};

export default UploadImagesDialog;
