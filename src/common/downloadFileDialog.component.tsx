import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { MRT_RowSelectionState } from 'material-react-table';
import React from 'react';
import { APIImage, APIImageWithURL } from '../api/api.types';

export interface BaseDownloadFileProps {
  open: boolean;
  onClose: () => void;
  fileType: 'Image' | 'Attachment';
}

export interface ImageDownloadDialogProps extends BaseDownloadFileProps {
  fileType: 'Image';
  selectedFiles?: APIImage[];
  useGetFileIds: (ids: string[]) => UseQueryResult<APIImageWithURL>[];
  onChangeSelectedFiles: (selectedFiles: MRT_RowSelectionState) => void;
}

export type DownloadFileProps = ImageDownloadDialogProps;

const DownloadFileDialog = (props: DownloadFileProps) => {
  const {
    open,
    onClose,
    fileType,
    selectedFiles,
    useGetFileIds,
    onChangeSelectedFiles,
  } = props;

  type fileInterface<T extends typeof fileType> = T extends 'Image'
    ? APIImageWithURL
    : APIImageWithURL;

  const count = selectedFiles ? selectedFiles.length : 0;

  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  let isLoading = false;

  const selectedFilesIds = selectedFiles?.map((file) => file.id);

  const handleClose = React.useCallback(() => {
    setFormError(undefined);
    onClose();
  }, [onClose]);

  const downloadedFiles: (fileInterface<typeof fileType> | undefined)[] =
    useGetFileIds(selectedFilesIds ?? ['']).map((query) => {
      isLoading = isLoading || query.isLoading;
      return query.data;
    });

  const handleDownloadFiles = React.useCallback(() => {
    if (downloadedFiles && downloadedFiles.length >= 1) {
      downloadedFiles.forEach(
        async (file: fileInterface<typeof fileType> | undefined) => {
          if (file) {
            try {
              const response = await fetch(file.url);
              if (!response.ok) {
                throw new Error(
                  `Failed to fetch image: ${response.statusText}`
                );
              }
              const blob = await response.blob();
              const link = document.createElement('a');

              link.href = URL.createObjectURL(blob);
              link.download = file.file_name;

              document.body.appendChild(link);
              link.click();
              URL.revokeObjectURL(link.href);
              document.body.removeChild(link);
            } catch (error) {
              console.error('Error downloading image:', error);
            }
          }
        }
      );
      onChangeSelectedFiles({});
      onClose();
    } else {
      setFormError('No data provided. Please refresh and try again');
    }
  }, [downloadedFiles, onChangeSelectedFiles, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Download {fileType}
        {count ? 's' : ''}
      </DialogTitle>
      <DialogContent data-testid="download-images-message">
        Are you sure you want to download{' '}
        <strong data-testid="download-images-value">
          {selectedFiles?.length + ' '}
        </strong>
        {fileType}
        {count > 1 ? 's' : ''}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDownloadFiles}
          disabled={isLoading || formError != undefined}
          endIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
      {formError != undefined && (
        <Box
          sx={{
            mx: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ maxWidth: '100%', fontSize: '1rem' }} error>
            {formError}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default DownloadFileDialog;
