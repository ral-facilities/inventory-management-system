import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Step,
  StepLabel,
  Stepper,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import Uppy, { Body, Meta } from '@uppy/core';
import Informer from '@uppy/informer';
import en_US from '@uppy/locales/lib/en_US';
import ProgressBar from '@uppy/progress-bar';
import { Dashboard } from '@uppy/react';
import statusBarStates from '@uppy/status-bar/lib/StatusBarStates';
import XHR from '@uppy/xhr-upload';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import { uppyOnAfterResponse, uppyOnBeforeRequest } from '../api/api';
import { usePostCatalogueItemsTemplate } from '../api/ingest';
import { UppyImageUploadResponse, UppyUploadMetadata } from '../app.types';
import handleTransferState from '../handleTransferState';
import { useAppSelector } from '../state/hook';
import { selectSettings } from '../state/slices/configSlice';
import {
  getErrorMessage,
  handleBlobDownload,
  parseSpreadsheetError,
} from '../utils';
import { FLEX_CONTAINER_PROPS, FORM_WITH_STEPPER_DIALOG_PROPS } from './consts';
import { getUploadingState, UppyDashboardLocaleStrings } from './uppy.utils';

const BaseUppyBox = styled('div')({
  '& .uppy-Root': {
    height: '100%',
  },
  '& .uppy-Dashboard.uppy-Dashboard--animateOpenClose.uppy-Dashboard--isInnerWrapVisible':
    {
      height: '100%',
    },
});

export const ValidationUppyBox = styled(BaseUppyBox)({
  // No override, keep remove button visible
});

export const ImportUppyBox = styled(BaseUppyBox)({
  '& .uppy-Dashboard-Item-actionWrapper': {
    display: 'none',
  },
});

const UPPY_INFORMER_TIMEOUT = 10000;

const getUppyLocale = (isAdminMode: boolean) => {
  const action = isAdminMode ? 'Import' : 'Validate';
  const actioning = isAdminMode ? 'Importing' : 'Validating';

  return {
    ...en_US.strings,

    cancelUpload: `Cancel ${action.toLowerCase()}`,
    pauseUpload: `Pause ${action.toLowerCase()}`,
    resumeUpload: `Resume ${action.toLowerCase()}`,
    retryUpload: `Retry ${action.toLowerCase()}`,

    upload: action,
    uploadComplete: `${action} complete`,
    uploadFailed: `${action} failed`,
    uploading: actioning,
    uploadPaused: `${action} paused`,
    uploadStalled: `${action} has not made any progress for %{seconds} seconds. You may want to retry it.`,

    uploadXFiles: {
      '0': `${action} %{smart_count} file`,
      '1': `${action} %{smart_count} file`,
    },
  };
};
const parseXHRHeaders = (headerString: string): Record<string, string> => {
  return headerString
    .trim()
    .split(/[\r\n]+/)
    .reduce(
      (acc, line) => {
        const parts = line.split(': ');
        const key = parts.shift()?.toLowerCase();
        const value = parts.join(': ');
        if (key) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );
};

export interface ValidationHeadersProps<M extends Meta, B extends Body> {
  headers: AxiosResponse['headers'];
  uppy: Uppy<M, B>;
  fileId?: string;
  parentName: string;
  data: Blob;
  onChangeSpreadsheetValid: (val: boolean) => void;
}

export const handleValidationHeaders = <M extends Meta, B extends Body>(
  props: ValidationHeadersProps<M, B>
) => {
  const { headers, uppy, fileId, parentName, data, onChangeSpreadsheetValid } =
    props;
  const isValid = headers['imsingestapi-validation-valid'] === 'true';
  const errorCount = Number(headers['imsingestapi-validation-errors'] ?? 0);
  const warningCount = Number(headers['imsingestapi-validation-warnings'] ?? 0);
  const hasErrors = !isValid || errorCount > 0;
  const hasWarnings = warningCount > 0;

  if (hasErrors) {
    onChangeSpreadsheetValid(false);
    const errorText = `${errorCount} error${errorCount !== 1 ? 's' : ''}`;
    const warningText = hasWarnings
      ? ` and ${warningCount} warning${warningCount !== 1 ? 's' : ''}`
      : '';
    const message = `Validation failed with ${errorText}${warningText}. A spreadsheet with highlighted issues has been downloaded.`;
    uppy?.info(message, 'error', UPPY_INFORMER_TIMEOUT);
    handleTransferState([
      {
        name: 'Spreadsheet',
        message: 'Invalid',
        state: 'error',
      },
    ]);
    const filename = `CatalogueItemsValidationErrors-${parentName}.xlsx`;
    handleBlobDownload(data, headers, filename);
    if (fileId) {
      uppy?.removeFile(fileId);
    }
    return;
  }

  if (hasWarnings) {
    onChangeSpreadsheetValid(true);
    const warningText = `${warningCount} warning${
      warningCount !== 1 ? 's' : ''
    }`;
    const message = `Validation completed with ${warningText}. A spreadsheet highlighting the warnings has been downloaded. Please click Next to proceed.`;
    uppy?.info(message, 'warning', UPPY_INFORMER_TIMEOUT);
    handleTransferState([
      {
        name: 'Spreadsheet',
        message: 'Valid with warnings',
        state: 'warning',
      },
    ]);
    const filename = `CatalogueItemsValidationWarnings-${parentName}.xlsx`;
    handleBlobDownload(data, headers, filename);
    return;
  }
  onChangeSpreadsheetValid(true);
  uppy?.info(
    `Validation complete. No errors or warnings found. Please click Next to proceed.`,
    'success',
    5000
  );
  handleTransferState([
    {
      name: 'Spreadsheet',
      message: 'Valid',
      state: 'success',
    },
  ]);
};

interface CreateSpreadsheetUppyProps<M extends Meta, B extends Body> {
  endpoint: string;
  parentName: string;
  maxSpreadsheetSizeBytes: number;
  spreadsheetAllowedFileExtensions: string[];
  onChangeSpreadsheetValid: (val: boolean) => void;
  handleValidationHeaders?: (props: ValidationHeadersProps<M, B>) => void;
}
const createSpreadsheetUppy = <M extends Meta, B extends Body>(
  props: CreateSpreadsheetUppyProps<M, B>
) => {
  const {
    endpoint,
    parentName,
    handleValidationHeaders,
    maxSpreadsheetSizeBytes,
    spreadsheetAllowedFileExtensions,
    onChangeSpreadsheetValid,
  } = props;
  const uppy = new Uppy<M, B>({
    autoProceed: false,
    infoTimeout: UPPY_INFORMER_TIMEOUT,
    restrictions: {
      maxNumberOfFiles: 1,
      maxFileSize: maxSpreadsheetSizeBytes,
      requiredMetaFields: ['name'],
      allowedFileTypes: spreadsheetAllowedFileExtensions,
    },
  })
    .use(ProgressBar)
    .use(Informer);

  uppy.use(XHR, {
    endpoint,
    method: 'POST',
    fieldName: 'spreadsheet_file',
    responseType: 'blob',

    async onBeforeRequest(xhr) {
      uppyOnBeforeRequest(xhr);
    },

    getResponseData(xhr) {
      const parsedHeaders = parseXHRHeaders(xhr.getAllResponseHeaders());
      if (handleValidationHeaders)
        handleValidationHeaders({
          headers: parsedHeaders,
          parentName: parentName,
          data: xhr.response,
          uppy: uppy,
          onChangeSpreadsheetValid: onChangeSpreadsheetValid,
        });

      return xhr.status === 204 ? '' : xhr.response;
    },

    async onAfterResponse(xhr) {
      await uppyOnAfterResponse(xhr, parseSpreadsheetError);
    },
  });

  return uppy;
};
export interface ImportTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string;
  parentName: string;
  isAdminMode: boolean;
}

const ImportTemplateDialog = (props: ImportTemplateDialogProps) => {
  const { open, onClose, parentId, parentName, isAdminMode } = props;

  const {
    settings: {
      imsIngestApiUrl,
      spreadsheetAllowedFileExtensions,
      maxSpreadsheetSizeBytes,
    },
  } = useAppSelector(selectSettings);

  const theme = useTheme();

  const queryClient = useQueryClient();

  const [isValidSpreadsheet, setIsValidSpreadsheet] =
    React.useState<boolean>(false);

  const [activeStep, setActiveStep] = React.useState<number>(0);

  // Note: File systems use a factor of 1024 for GB, MB and KB instead of 1000,
  // so here the former is expected despite them really being GiB, MiB and KiB.
  const maxFileSizeMB = maxSpreadsheetSizeBytes / 1024 ** 2;

  const [validateUppy] = React.useState<
    Uppy<UppyUploadMetadata, UppyImageUploadResponse>
  >(() =>
    createSpreadsheetUppy({
      endpoint: `${imsIngestApiUrl}/spreadsheets/catalogue-items/validate`,
      parentName: parentName,
      maxSpreadsheetSizeBytes: maxSpreadsheetSizeBytes,
      spreadsheetAllowedFileExtensions: spreadsheetAllowedFileExtensions,
      onChangeSpreadsheetValid: setIsValidSpreadsheet,
      handleValidationHeaders: handleValidationHeaders,
    })
  );

  const [importUppy] = React.useState<
    Uppy<UppyUploadMetadata, UppyImageUploadResponse>
  >(() =>
    createSpreadsheetUppy({
      endpoint: `${imsIngestApiUrl}/spreadsheets/catalogue-items/ingest`,
      parentName: parentName,
      maxSpreadsheetSizeBytes: maxSpreadsheetSizeBytes,
      spreadsheetAllowedFileExtensions: spreadsheetAllowedFileExtensions,
      onChangeSpreadsheetValid: setIsValidSpreadsheet,
    })
  );

  validateUppy.on('upload-error', () => setIsValidSpreadsheet(false));
  validateUppy.on('file-removed', () => setIsValidSpreadsheet(false));

  const {
    files: validateFiles = {},
    error: validateError,
    recoveredState: validateRecoveredState,
  } = validateUppy.getState();
  const { isAllComplete: validateIsAllComplete } =
    validateUppy.getObjectOfFilesPerState();

  const {
    files: importFiles = {},
    error: importError,
    recoveredState: importRecoveredState,
  } = validateUppy.getState();
  const { isAllComplete: importIsAllComplete } =
    validateUppy.getObjectOfFilesPerState();

  const handleClose = React.useCallback(() => {
    // prevent users from closing the dialog while the download is in progress
    const validateUploadState = getUploadingState(
      validateError,
      validateIsAllComplete,
      validateRecoveredState,
      validateFiles
    );

    const importUploadState = getUploadingState(
      importError,
      importIsAllComplete,
      importRecoveredState,
      importFiles
    );
    if (
      validateUploadState === statusBarStates.STATE_POSTPROCESSING ||
      validateUploadState === statusBarStates.STATE_PREPROCESSING ||
      validateUploadState === statusBarStates.STATE_UPLOADING ||
      importUploadState === statusBarStates.STATE_POSTPROCESSING ||
      importUploadState === statusBarStates.STATE_PREPROCESSING ||
      importUploadState === statusBarStates.STATE_UPLOADING
    ) {
      return;
    }
    onClose();

    validateUppy.clear();
    importUppy.clear();
    queryClient.invalidateQueries({ queryKey: ['CatalogueItems', parentId] });
    setIsValidSpreadsheet(false);
    setActiveStep(0);
  }, [
    validateError,
    validateIsAllComplete,
    validateRecoveredState,
    validateFiles,
    importError,
    importIsAllComplete,
    importRecoveredState,
    importFiles,
    onClose,
    validateUppy,
    importUppy,
    queryClient,
    parentId,
  ]);

  React.useEffect(() => {
    validateUppy.setMeta({ catalogue_category_id: parentId });
  }, [parentId, validateUppy]);

  React.useEffect(() => {
    importUppy.setMeta({ catalogue_category_id: parentId });
  }, [parentId, importUppy]);

  React.useEffect(() => {
    if (isValidSpreadsheet) {
      importUppy.clear();
      const uploadedFile = validateUppy.getFiles()[0];
      importUppy.addFile({
        name: uploadedFile.name || '',
        type: uploadedFile.type,
        data: uploadedFile.data,
      });
    }
  }, [parentId, importUppy, isValidSpreadsheet, validateUppy]);

  const { mutateAsync: postCatalogueItemsTemplate } =
    usePostCatalogueItemsTemplate();

  const handleDownloadTemplate = React.useCallback(async () => {
    postCatalogueItemsTemplate({ catalogueCategoryId: parentId })
      .then((response) =>
        handleBlobDownload(
          response.data,
          response.headers,
          `CatalogueItemTemplate-${parentName}.xlsx`
        )
      )
      .catch(async (error: AxiosError) => {
        const errorMessage = await getErrorMessage(error);
        let parsedErrorMessage =
          'There was an unexpected error. Please try again or contact the system administrator.';
        if (
          errorMessage ===
            'cannot generate a catalogue items template for a non-leaf catalogue category' ||
          errorMessage === 'the specified catalogue category does not exist'
        ) {
          parsedErrorMessage = `The selected catalogue category no longer exists or is invalid. Please navigate to a valid category catalogue that contains catalogue items and try again.`;
        }
        handleTransferState([
          {
            name: 'Download template',
            message: parsedErrorMessage,
            state: 'error',
          },
        ]);
      });
  }, [postCatalogueItemsTemplate, parentId, parentName]);

  // Stepper
  const STEPS = [
    'Download spreadsheet',
    'Validate spreadsheet',
    'Import spreadsheet',
  ];

  const handleNext = React.useCallback((activeStep: number) => {
    switch (activeStep) {
      case 0:
        return setActiveStep((prevActiveStep) => prevActiveStep + 1);
      case 1:
        return setActiveStep((prevActiveStep) => prevActiveStep + 1);
      case 2:
        return false;
    }
  }, []);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <DownloadIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              Download Catalogue Template
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
              Download the spreadsheet template, populate it with catalogue item
              data, then proceed to validation.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </Paper>
        );

      case 1:
        return (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              ...FLEX_CONTAINER_PROPS,
            }}
          >
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Upload your completed spreadsheet to validate catalogue items. Any
              errors or warnings will be highlighted in a downloadable
              spreadsheet.
            </Typography>
            <ValidationUppyBox style={FLEX_CONTAINER_PROPS}>
              <Dashboard
                uppy={validateUppy}
                proudlyDisplayPoweredByUppy={false}
                width="100%"
                height="100%"
                locale={{
                  strings: getUppyLocale(false) as UppyDashboardLocaleStrings<
                    UppyUploadMetadata,
                    UppyImageUploadResponse
                  >,
                }}
                style={{ ...FLEX_CONTAINER_PROPS }}
                theme={theme.palette.mode}
                showRemoveButtonAfterComplete={true}
                doneButtonHandler={null}
                note={`Files cannot be larger than ${maxFileSizeMB}MB. Supported file types: ${spreadsheetAllowedFileExtensions.join(', ')}.`}
              />
            </ValidationUppyBox>
          </Paper>
        );
      case 2:
        return (
          <>
            {isAdminMode ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  ...FLEX_CONTAINER_PROPS,
                }}
              >
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Validation completed successfully. The spreadsheet is ready to
                  be imported into the catalogue.
                </Typography>
                <ImportUppyBox style={FLEX_CONTAINER_PROPS}>
                  <Dashboard
                    uppy={importUppy}
                    proudlyDisplayPoweredByUppy={false}
                    locale={{
                      strings: getUppyLocale(
                        true
                      ) as UppyDashboardLocaleStrings<
                        UppyUploadMetadata,
                        UppyImageUploadResponse
                      >,
                    }}
                    width="100%"
                    height="100%"
                    style={{ ...FLEX_CONTAINER_PROPS }}
                    theme={theme.palette.mode}
                    showRemoveButtonAfterComplete={false}
                    doneButtonHandler={null}
                    note={`Files cannot be larger than ${maxFileSizeMB}MB. Supported file types: ${spreadsheetAllowedFileExtensions.join(', ')}.`}
                  />
                </ImportUppyBox>
              </Paper>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <AdminPanelSettingsIcon
                  color="primary"
                  sx={{ fontSize: 64, mb: 2 }}
                />

                <Typography variant="h6" gutterBottom>
                  Administrator Action Required
                </Typography>

                <Typography color="text.secondary" sx={{ maxWidth: 550 }}>
                  Your spreadsheet has been validated successfully. Please
                  contact an administrator to import the spreadsheet so the
                  catalogue items can be made available.
                </Typography>
              </Paper>
            )}
          </>
        );
    }
  };
  return (
    <Dialog
      open={open}
      {...FORM_WITH_STEPPER_DIALOG_PROPS}
      disableEscapeKeyDown
    >
      <DialogTitle>Import spreadsheet</DialogTitle>
      <DialogContent sx={{ ...FLEX_CONTAINER_PROPS, minHeight: '400px' }}>
        <Stepper
          nonLinear
          activeStep={activeStep}
          orientation="horizontal"
          sx={{ marginTop: 2 }}
        >
          {STEPS.map((label, index) => {
            const labelProps: {
              optional?: React.ReactNode;
              error?: boolean;
            } = {};

            return (
              <Step sx={{ cursor: 'pointer' }} key={label}>
                <StepLabel
                  {...labelProps}
                  onClick={() => {
                    if (!isValidSpreadsheet && index === 2) return;
                    setActiveStep(index);
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <Box sx={{ ...FLEX_CONTAINER_PROPS, marginTop: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ mr: 'auto' }}>
          Cancel
        </Button>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>

        {activeStep === STEPS.length - 1 ? (
          <Button onClick={handleClose} sx={{ mr: 3 }}>
            Finish
          </Button>
        ) : (
          <Button
            disabled={!isValidSpreadsheet && activeStep === 1}
            onClick={() => handleNext(activeStep)}
            sx={{ mr: 3 }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportTemplateDialog;
