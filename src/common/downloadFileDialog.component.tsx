import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';
import { APIImage, APIImageWithURL } from '../api/api.types';
import { getImageQuery } from '../api/images';
import handleIMS_APIError from '../handleIMS_APIError';
import { downloadFileByLink } from '../utils';

export interface BaseDownloadFileProps {
  open: boolean;
  onClose: () => void;
  fileType: 'Image' | 'Attachment';
}

export interface ImageDownloadDialogProps extends BaseDownloadFileProps {
  fileType: 'Image';
  file: APIImage;
}

export type DownloadFileProps = ImageDownloadDialogProps;

const DownloadFileDialog = (props: DownloadFileProps) => {
  const { open, onClose, fileType, file } = props;

  const getDownloadFileQuery = getImageQuery;

  const queryClient = useQueryClient();

  const handleClick = React.useCallback(async () => {
    queryClient
      .fetchQuery(getDownloadFileQuery(file.id, false))
      .then((data: APIImageWithURL) => {
        downloadFileByLink(data.download_url, data.file_name);
        onClose();
      })
      .catch((error: AxiosError) => {
        handleIMS_APIError(error);
        onClose();
      });
  }, [file, queryClient, onClose, getDownloadFileQuery]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle>Download {fileType}?</DialogTitle>
      <DialogContent>
        Are you sure you want to download <strong>{file.file_name}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleClick}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadFileDialog;
