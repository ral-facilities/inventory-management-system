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

  const { data: downloadedFile, isLoading: downloadIsLoading } = useGetFile(
    file.id
  );

  const handleClose = React.useCallback(() => {
    setFormError(undefined);
    onClose();
  }, [onClose]);

  const handleDownloadFile = React.useCallback(() => {
    if (downloadedFile) {
      const link = document.createElement('a');
      link.href = downloadedFile.download_url;
      link.download = downloadedFile.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    } else {
      setFormError('No data provided. Please refresh and try again');
    }
  }, [downloadedFile, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
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
          onClick={handleDownloadFile}
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
