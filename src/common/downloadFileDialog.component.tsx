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
import { AxiosError } from 'axios';
import React from 'react';
import { APIImage, APIImageWithURL } from '../api/api.types';
import { downloadFileByLink } from '../utils';

export interface BaseDownloadFileProps {
  open: boolean;
  onClose: () => void;
  fileType: 'Image' | 'Attachment';
}

export interface ImageDownloadDialogProps extends BaseDownloadFileProps {
  fileType: 'Image';
  useGetFile: (id: string) => UseQueryResult<APIImageWithURL, AxiosError>;
  file: APIImage;
}

export type DownloadFileProps = ImageDownloadDialogProps;

const DownloadFileDialog = (props: DownloadFileProps) => {
  const { open, onClose, fileType, file, useGetFile } = props;

  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const [downloadId, setDownloadId] = React.useState<string>('');

  const {
    data: downloadFile,
    isLoading: downloadIsLoading,
    error,
    isPending: downloadIsPending,
  } = useGetFile(downloadId);

  const handleClose = React.useCallback(() => {
    setFormError(undefined);
    setDownloadId('');
    onClose();
  }, [onClose]);

  const handleClick = React.useCallback(() => {
    setDownloadId(file.id);
  }, [file]);

  const handleDownloadFile = React.useCallback(() => {
    if (!error && downloadFile) {
      downloadFileByLink(
        document,
        downloadFile.download_url,
        downloadFile.file_name
      );
      setDownloadId('');
      onClose();
    } else {
      setFormError('No data provided. Please refresh and try again');
    }
  }, [downloadFile, onClose, error]);

  React.useEffect(() => {
    if (!downloadIsPending) {
      handleDownloadFile();
    }
  }, [downloadFile, error, handleDownloadFile, downloadIsPending]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle
        sx={{ display: 'inline-flex', alignItems: 'center' }}
        data-testid="download-file-dialog-title"
      >
        <WarningIcon sx={{ marginRight: 1 }} />
        Download {fileType}?
      </DialogTitle>
      <DialogContent data-testid="download-images-message">
        Are you sure you want to download{' '}
        <strong data-testid="download-images-value">{file.file_name}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleClick}
          disabled={downloadIsLoading || formError != undefined}
          endIcon={downloadIsLoading ? <CircularProgress size={20} /> : null}
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
