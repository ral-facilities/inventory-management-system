import { useTheme } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import Uppy, { UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/image-editor/dist/style.css';
import Informer from '@uppy/informer';
import en_US from '@uppy/locales/lib/en_US';
import ProgressBar from '@uppy/progress-bar';
import { DashboardModal } from '@uppy/react';
import statusBarStates from '@uppy/status-bar/lib/StatusBarStates';
import XHR from '@uppy/xhr-upload';
import { AxiosError } from 'axios';
import React from 'react';
import { uppyOnAfterResponse, uppyOnBeforeRequest } from '../api/api';
import {
  usePostCatalogueItemsTemplate,
  usePostCatalogueItemsTemplateValidation,
} from '../api/ingest';
import { UppyImageUploadResponse, UppyUploadMetadata } from '../app.types';
import handleIMS_APIError from '../handleIMS_APIError';
import { useAppSelector } from '../state/hook';
import { selectSettings } from '../state/slices/configSlice';
import {
  getErrorMessage,
  handleBlobDownload,
  parseSpreadsheetError,
} from '../utils';
import {
  getUploadingState,
  StyledUppyBox,
  UppyDashboardLocaleStrings,
} from './uppy.utils';

export interface ImportTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string;
  parentName: string;
}

const ImportTemplateDialog = (props: ImportTemplateDialogProps) => {
  const { open, onClose, parentId, parentName } = props;

  const theme = useTheme();
  const { mutateAsync: postCatalogueItemsTemplate } =
    usePostCatalogueItemsTemplate();

  const { mutateAsync: postCatalogueItemsTemplateValidation } =
    usePostCatalogueItemsTemplateValidation();

  const queryClient = useQueryClient();

  const {
    settings: {
      imsIngestApiUrl,
      spreadsheetAllowedFileExtensions,
      maxSpreadsheetSizeBytes,
    },
  } = useAppSelector(selectSettings);

  // Note: File systems use a factor of 1024 for GB, MB and KB instead of 1000,
  // so here the former is expected despite them really being GiB, MiB and KiB.
  const maxFileSizeMB = maxSpreadsheetSizeBytes / 1024 ** 2;

  const [uppy] = React.useState<
    Uppy<UppyUploadMetadata, UppyImageUploadResponse>
  >(() => {
    const newUppy = new Uppy<UppyUploadMetadata, UppyImageUploadResponse>({
      autoProceed: false,
      infoTimeout: 10000,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: maxSpreadsheetSizeBytes,
        requiredMetaFields: ['name'],
        allowedFileTypes: spreadsheetAllowedFileExtensions,
      },
    })
      .use(ProgressBar)
      .use(Informer);

    newUppy.use(XHR, {
      endpoint: `${imsIngestApiUrl}/spreadsheets/catalogue-items/ingest`,
      method: 'POST',
      fieldName: 'spreadsheet_file',
      async onBeforeRequest(xhr) {
        uppyOnBeforeRequest(xhr);
      },
      getResponseData(xhr) {
        return xhr.status === 204 ? '' : xhr.response;
      },
      async onAfterResponse(xhr) {
        await uppyOnAfterResponse(xhr, parseSpreadsheetError);
      },
    });

    return newUppy;
  });

  const handleDownloadTemplate = React.useCallback(async () => {
    postCatalogueItemsTemplate({ catalogueCategoryId: parentId })
      .then((response) =>
        handleBlobDownload(response, `CatalogueItemTemplate-${parentName}.xlsx`)
      )
      .catch((error: AxiosError) => {
        handleIMS_APIError(error);
      });
  }, [postCatalogueItemsTemplate, parentId, parentName]);

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
    queryClient.invalidateQueries({ queryKey: ['CatalogueItems', parentId] });
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

  React.useEffect(() => {
    uppy.setMeta({ catalogue_category_id: parentId });
  }, [parentId, uppy]);

  React.useEffect(() => {
    const handleFileAdded = (
      file: UppyFile<UppyUploadMetadata, UppyImageUploadResponse>
    ) => {
      const actualFile = file.data as File;

      uppy.info('Validation started. Please wait.', 'info', 15000);

      postCatalogueItemsTemplateValidation({
        catalogueCategoryId: parentId,
        spreadsheetFile: actualFile,
      })
        .then((response) => {
          const headers = response.headers;

          const isValid = headers['imsingestapi-validation-valid'] === 'true';

          const errorCount = Number(
            headers['imsingestapi-validation-errors'] ?? 0
          );

          const warningCount = Number(
            headers['imsingestapi-validation-warnings'] ?? 0
          );

          const hasErrors = !isValid || errorCount > 0;
          const hasWarnings = warningCount > 0;

          if (hasErrors) {
            const errorText = `${errorCount} error${errorCount !== 1 ? 's' : ''}`;

            const warningText = hasWarnings
              ? ` and ${warningCount} warning${warningCount !== 1 ? 's' : ''}`
              : '';

            const message = `Validation failed with ${errorText}${warningText}. A spreadsheet with highlighted issues has been downloaded.`;

            uppy.info(message, 'error', 15000);

            const filename = `CatalogueItemsValidationErrors-${parentName}.xlsx`;

            handleBlobDownload(response, filename);

            uppy.removeFile(file.id);

            return;
          }

          if (hasWarnings) {
            const warningText = `${warningCount} warning${
              warningCount !== 1 ? 's' : ''
            }`;

            const message = `Validation completed with ${warningText}. A spreadsheet highlighting the warnings has been downloaded.`;

            uppy.info(message, 'warning', 15000);

            const filename = `CatalogueItemsValidationWarnings-${parentName}.xlsx`;
            handleBlobDownload(response, filename);

            return;
          }

          uppy.info(
            'Validation complete. No errors or warnings found. Please click Upload to proceed.',
            'success',
            5000
          );
        })
        .catch(async (error: AxiosError) => {
          const errorMessage = await getErrorMessage(error);
          const parsedErrorMessage = parseSpreadsheetError(errorMessage);
          if (parsedErrorMessage === 'There was an unexpected error.') {
            return handleIMS_APIError(error);
          }
          uppy.info(parsedErrorMessage, 'error', 15000);
          uppy.removeFile(file.id);
        });
    };

    uppy.on('file-added', handleFileAdded);

    return () => {
      uppy.off('file-added', handleFileAdded);
    };
  }, [uppy, parentId, postCatalogueItemsTemplateValidation, parentName]);

  return (
    <StyledUppyBox>
      <DashboardModal
        open={open}
        locale={{
          strings: {
            ...en_US.strings,
            dropPasteFiles: 'Drop template here or %{browseFiles}',
          } as UppyDashboardLocaleStrings<
            UppyUploadMetadata,
            UppyImageUploadResponse
          >,
        }}
        onRequestClose={handleClose}
        closeModalOnClickOutside={false}
        note={`Files cannot be larger than ${maxFileSizeMB}MB. Supported file types: ${spreadsheetAllowedFileExtensions.join(', ')}.`}
        animateOpenClose={false}
        uppy={uppy}
        proudlyDisplayPoweredByUppy={false}
        theme={theme.palette.mode}
        doneButtonHandler={handleClose}
        metaFields={[]}
      />
    </StyledUppyBox>
  );
};

export default ImportTemplateDialog;
