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
import { CancelledError, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { APIImage, APIImageWithURL } from '../api/api.types';
import handleIMS_APIError from '../handleIMS_APIError';
import { downloadFileByLink } from '../utils';

export interface BaseDownloadFileProps {
  open: boolean;
  onClose: () => void;
  fileType: 'Image' | 'Attachment';
}

export interface ImageDownloadDialogProps extends BaseDownloadFileProps {
  fileType: 'Image';
  getFile: (id: string) => Promise<APIImageWithURL>;
  file: APIImage;
}

export type DownloadFileProps = ImageDownloadDialogProps;

const DownloadFileDialog = (props: DownloadFileProps) => {
  const { open, onClose, fileType, file, getFile } = props;

  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  const [isLoading, setIsLoading] = React.useState(false);

  const queryClient = useQueryClient();

  const handleClose = React.useCallback(() => {
    queryClient.removeQueries({
      queryKey: ['Image', file.id],
    });
    setFormError(undefined);
    setIsLoading(false);
    onClose();
  }, [onClose, file, queryClient]);

  const handleDownloadFile = React.useCallback(
    (data: APIImageWithURL | undefined) => {
      if (data) {
        downloadFileByLink(document, data.download_url, data.file_name);
        onClose();
      } else {
        setFormError('No data provided. Please refresh and try again');
      }
    },
    [onClose]
  );

  const handleClick = React.useCallback(async () => {
    setIsLoading(true);

    let data: APIImageWithURL | undefined = undefined;
    let closing: boolean = false;
    try {
      const fetchedData = await queryClient.fetchQuery({
        queryKey: ['Image', file.id],
        queryFn: () => getFile(file.id),
      });
      data = fetchedData;
    } catch (error) {
      if (error instanceof CancelledError) closing = true;
      else if (error instanceof AxiosError) handleIMS_APIError(error);
    } finally {
      setIsLoading(false);
      if (!closing) handleDownloadFile(data);
    }
  }, [file, getFile, handleDownloadFile, queryClient]);

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
