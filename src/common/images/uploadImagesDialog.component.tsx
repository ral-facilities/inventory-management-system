import { useTheme } from '@mui/material';
import Uppy, { Body, Meta } from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import ImageEditor from '@uppy/image-editor';
import '@uppy/image-editor/dist/style.css';
import ProgressBar from '@uppy/progress-bar'; // Import the ProgressBar plugin
import { DashboardModal } from '@uppy/react';
import XHR from '@uppy/xhr-upload';
import React from 'react';
import { settings } from '../../settings';
import { getNonEmptyTrimmedString } from '../../utils';

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

  const osApiUrl = async () => (await settings)?.osApiUrl || '';
  const [uppy] = React.useState<Uppy<Meta, Body>>(() => {
    const newUppy = new Uppy<Meta, Body>({
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
      });
    });

    return newUppy;
  });

  const handleClose = React.useCallback(() => {
    onClose();
    uppy.cancelAll();
  }, [onClose, uppy]);

  React.useEffect(() => {
    uppy.setMeta({
      entity_id: entityId,
    });
  }, [entityId, uppy]);

  uppy.on('dashboard:file-edit-complete', (file) => {
    if (file) {
      // Extract existing metadata
      const { title, description, ...restMeta } = file.meta;

      // Format title and description
      const formattedTitle = getNonEmptyTrimmedString(title);
      const formattedDescription = getNonEmptyTrimmedString(description);

      // Prepare the updated metadata object
      const updatedFileData = {
        ...restMeta,
        ...(formattedTitle && { title: formattedTitle }),
        ...(formattedDescription && { description: formattedDescription }),
      };

      // Use patchFilesState to update the metadata
      // Ensure you call the method properly
      uppy.patchFilesState({
        [file.id]: {
          meta: updatedFileData,
        },
      });
    }
  });

  uppy.on('upload-error', (_file, _error, response) => {
    if (response?.body?.id) {
      // TODO: Implement logic to delete metadata using id
      // If metadata exists for the given id, remove it from the api
      // If not, do nothing and exit the function
    }
  });

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

export default UploadImagesDialog;
