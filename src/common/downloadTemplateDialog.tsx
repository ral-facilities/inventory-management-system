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
import { getTemplateQuery } from '../api/ingest';
import handleIMS_APIError from '../handleIMS_APIError';
import { downloadFileByLink } from '../utils';

export interface DownloadTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  collection: 'catalogue-items';
  name: string;
  id: string;
}

const mapToParentCollection = {
  'catalogue-items': 'catalogue-categories',
};

const DownloadTemplateDialog = (props: DownloadTemplateDialogProps) => {
  const { open, onClose, collection, name, id } = props;

  const queryClient = useQueryClient();

  const handleClick = React.useCallback(async () => {
    queryClient
      .fetchQuery(getTemplateQuery(mapToParentCollection[collection], id))
      .then((response) => {
        const blob = response.data;

        const contentDisposition = response.headers['content-disposition'];
        let filename = `${collection}-${name}.xlsx`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.*?)"?$/);
          if (match?.[1]) {
            filename = match[1];
          }
        }

        const url = window.URL.createObjectURL(blob);

        console.log(filename, url);
        downloadFileByLink(url, filename);

        onClose();
      })
      .catch((error: AxiosError) => {
        handleIMS_APIError(error);
        onClose();
      });
  }, [queryClient, collection, id, name, onClose]);

  return (
    <Dialog open={open} sx={{ zIndex: 1300 + 2 }} maxWidth="lg">
      <DialogTitle>Download Template</DialogTitle>
      <DialogContent>
        Download a template spreadsheet to create {collection.replace('-', ' ')}{' '}
        in <strong>{name}</strong>?
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleClick}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DownloadTemplateDialog;
