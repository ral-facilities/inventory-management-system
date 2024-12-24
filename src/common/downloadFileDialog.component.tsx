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
  selectedImages?: APIImage[];
  useGetFileIds: (ids: string[]) => UseQueryResult<APIImageWithURL>[];
  onChangeSelectedImages: (selectedImages: MRT_RowSelectionState) => void;
}

export type DownloadFileProps = ImageDownloadDialogProps;

const DownloadFileDialog = (props: DownloadFileProps) => {
  const {
    open,
    onClose,
    fileType,
    selectedImages,
    useGetFileIds,
    onChangeSelectedImages,
  } = props;

  const count = selectedImages ? selectedImages.length : 0;

  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  let isLoading = false;

  const selectedImagesIds = selectedImages?.map((image) => image.id);

  const handleClose = React.useCallback(() => {
    setFormError(undefined);
    onClose();
  }, [onClose]);

  const downloadedImages: (APIImageWithURL | undefined)[] = useGetFileIds(
    selectedImagesIds ?? ['']
  ).map((query) => {
    isLoading = isLoading || query.isLoading;
    return query.data;
  });

  const handleDownloadImages = React.useCallback(() => {
    if (downloadedImages) {
      downloadedImages.forEach((image: APIImageWithURL | undefined) => {
        if (image) {
          const link = document.createElement('a');
          link.href = image.url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
      onChangeSelectedImages({});
      onClose();
    }
  }, [downloadedImages, onChangeSelectedImages, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Download {fileType}
        {count ? 's' : ''}
      </DialogTitle>
      <DialogContent>
        Are you sure you want to download{' '}
        <strong data-testid="delete-usage-status-value">
          {selectedImages?.length + ' '}
        </strong>
        {fileType}
        {count > 1 ? 's' : ''}?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDownloadImages}
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
