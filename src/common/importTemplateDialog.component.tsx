import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import Uppy from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/image-editor/dist/style.css';
import en_US from '@uppy/locales/lib/en_US';
import ProgressBar from '@uppy/progress-bar'; // Import the ProgressBar plugin
import { DashboardModal } from '@uppy/react';
import statusBarStates from '@uppy/status-bar/lib/StatusBarStates';
import XHR from '@uppy/xhr-upload';
import React from 'react';
import { uppyOnAfterResponse, uppyOnBeforeRequest } from '../api/api';
import { UppyImageUploadResponse, UppyUploadMetadata } from '../app.types';
import { useAppSelector } from '../state/hook';
import { selectSettings } from '../state/slices/configSlice';
import DownloadTemplateDialog from './downloadTemplateDialog';
import {
  getUploadingState,
  StyledUppyBox,
  UppyDashboardLocaleStrings,
} from './uppy.utils';

export interface ImportTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  collection: 'catalogue-items';
  parentId: string;
  name: string;
}

const ImportTemplateDialog = (props: ImportTemplateDialogProps) => {
  const { open, onClose, collection, parentId, name } = props;

  const theme = useTheme();

  const [downloadTemplateDialogOpen, setDownloadTemplateDialogOpen] =
    React.useState<boolean>(false);

  const queryClient = useQueryClient();

  const {
    settings: {
      // maxImageSizeBytes,
      imsIngestApiUrl,
      // attachmentAllowedFileExtensions,
    },
  } = useAppSelector(selectSettings);

  // Note: File systems use a factor of 1024 for GB, MB and KB instead of 1000,
  // so here the former is expected despite them really being GiB, MiB and KiB.
  // const maxFileSizeMB = maxImageSizeBytes / 1024 ** 2;

  const [uppy] = React.useState<
    Uppy<UppyUploadMetadata, UppyImageUploadResponse>
  >(() => {
    const newUppy = new Uppy<UppyUploadMetadata, UppyImageUploadResponse>({
      autoProceed: false,
      infoTimeout: 10000,
      restrictions: {
        // maxFileSize: maxImageSizeBytes,
        maxNumberOfFiles: 1,
        requiredMetaFields: ['name'],
        // allowedFileTypes: attachmentAllowedFileExtensions,
      },
    }).use(ProgressBar);

    newUppy.use(XHR, {
      endpoint: `${imsIngestApiUrl}/ingest/${collection}/${parentId}`,
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

  const handleVerifyClick = React.useCallback(() => {
    // TODO: implement verification logic
    console.log('Verify button clicked');
  }, []);

  const handleDownloadTemplate = React.useCallback(() => {
    setDownloadTemplateDialogOpen(true);
  }, []);

  React.useEffect(() => {
    const injectVerifyButton = () => {
      const container = document.querySelector(
        '.uppy-StatusBar-actions'
      ) as HTMLElement;

      if (!container) return;

      const { error, recoveredState, hideUploadButton, allowNewUpload } =
        uppy.getState();
      const {
        isAllPaused,

        isUploadInProgress,
        newFiles,
      } = uppy.getObjectOfFilesPerState();

      const showVerifyBtn =
        !error &&
        newFiles &&
        ((!isUploadInProgress && !isAllPaused) || recoveredState) &&
        allowNewUpload &&
        !hideUploadButton;

      const existingBtn = document.getElementById('verify-button');

      if (!showVerifyBtn) {
        if (existingBtn) {
          existingBtn.style.display = 'none';

          //
          requestAnimationFrame(() => {
            existingBtn.remove();
          });
        }
        return;
      }

      if (document.getElementById('verify-button')) return;

      const verifyBtn = document.createElement('button');
      verifyBtn.id = 'verify-button';

      verifyBtn.setAttribute('data-uppy-super-focusable', 'true');

      verifyBtn.className =
        'uppy-u-reset uppy-c-btn uppy-StatusBar-actionBtn uppy-StatusBar-actionBtn--upload uppy-c-btn-primary';

      verifyBtn.style.marginRight = '8px';
      verifyBtn.innerHTML = 'Verify 1 File';
      verifyBtn.style.display = showVerifyBtn ? 'inline-block' : 'none';

      verifyBtn.onclick = handleVerifyClick;

      const uploadBtn = container.querySelector(
        '.uppy-StatusBar-actionBtn--upload'
      );

      if (uploadBtn) {
        container.insertBefore(verifyBtn, uploadBtn);
      } else {
        container.appendChild(verifyBtn);
      }
    };

    const update = () => {
      requestAnimationFrame(() => {
        injectVerifyButton();
      });
    };

    uppy.on('file-added', update);
    uppy.on('file-removed', update);
    uppy.on('upload-progress', update);
    uppy.on('upload', update);
    uppy.on('upload-start', update);

    uppy.on('state-update', update);
    uppy.on('complete', update);

    update();

    return () => {
      uppy.off('file-added', update);
      uppy.off('file-removed', update);
      uppy.off('upload-progress', update);
      uppy.off('upload', update);
      uppy.off('upload-start', update);
      uppy.off('state-update', update);
      uppy.off('complete', update);
    };
  }, [uppy, handleVerifyClick]);

  React.useEffect(() => {
    const injectDownloadLink = () => {
      const title = document.querySelector(
        '.uppy-Dashboard-AddFiles-title'
      ) as HTMLElement;

      if (!title) return;

      const { files = {} } = uppy.getState();
      const fileCount = Object.keys(files).length;

      if (fileCount > 0) {
        document.getElementById('download-template-link')?.remove();
        return;
      }

      if (document.getElementById('download-template-link')) return;

      const browseBtn = title.querySelector(
        '.uppy-Dashboard-browse'
      ) as HTMLElement;

      if (!browseBtn) return;

      const link = document.createElement('button');
      link.id = 'download-template-link';

      link.className = 'uppy-u-reset uppy-c-btn uppy-Dashboard-browse';

      link.innerText = 'download template';

      link.onclick = () => {
        handleDownloadTemplate();
      };

      browseBtn.insertAdjacentElement('afterend', link);

      browseBtn.insertAdjacentText('afterend', ' or ');
    };

    const update = () => {
      requestAnimationFrame(() => {
        injectDownloadLink();
      });
    };

    uppy.on('file-added', update);
    uppy.on('file-removed', update);
    uppy.on('state-update', update);
    uppy.on('dashboard:modal-open', update);

    update();

    return () => {
      uppy.off('file-added', update);
      uppy.off('file-removed', update);
      uppy.off('state-update', update);
      uppy.off('dashboard:modal-open', update);
    };
  }, [handleDownloadTemplate, uppy]);

  // Destroy uppy instance on unmount (Should also avoid errors in tests e.g. 'ReferenceError: window is not defined' from code
  // executing after tests have completed)
  React.useEffect(
    () => () => {
      uppy.destroy();
    },
    [uppy]
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
    uppy.clear();
    queryClient.invalidateQueries({ queryKey: ['Catalogue Items', parentId] });
  }, [
    parentId,
    error,
    files,
    isAllComplete,
    onClose,
    queryClient,
    recoveredState,
    uppy,
  ]);

  return (
    <>
      <StyledUppyBox>
        <DashboardModal
          open={open}
          locale={{
            strings: {
              ...en_US.strings, // Spread default strings

              dropPasteFiles: 'Drop template here or %{browseFiles}',
            } as UppyDashboardLocaleStrings<
              UppyUploadMetadata,
              UppyImageUploadResponse
            >,
          }}
          onRequestClose={handleClose}
          closeModalOnClickOutside={false}
          animateOpenClose={false}
          uppy={uppy}
          // note={`Files cannot be larger than ${maxFileSizeMB}MB. Supported file types: ${attachmentAllowedFileExtensions.join(', ')}.`}
          proudlyDisplayPoweredByUppy={false}
          theme={theme.palette.mode}
          doneButtonHandler={handleClose}
          metaFields={[]}
        />
      </StyledUppyBox>
      <DownloadTemplateDialog
        open={downloadTemplateDialogOpen}
        onClose={() => setDownloadTemplateDialogOpen(false)}
        collection={collection}
        id={parentId}
        name={name}
      />
    </>
  );
};

export default ImportTemplateDialog;
