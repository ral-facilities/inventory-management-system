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
import { AxiosError } from 'axios';
import React from 'react';
import { AttachmentMetadata } from '../../api/api.types';
import { useDeleteAttachment } from '../../api/attachments';
import handleIMS_APIError from '../../handleIMS_APIError';

export interface DeleteAttachmentProps {
  open: boolean;
  onClose: () => void;
  attachment: AttachmentMetadata;
}

const DeleteAttachmentDialog = (props: DeleteAttachmentProps) => {
  const { open, onClose, attachment } = props;

  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { mutateAsync: deleteAttachent, isPending: isDeletePending } =
    useDeleteAttachment();

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  const handleDeleteAttachment = React.useCallback(() => {
    if (attachment) {
      deleteAttachent(attachment.id)
        .then(() => {
          onClose();
        })
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    } else {
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [attachment, deleteAttachent, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Attachment
      </DialogTitle>
      <DialogContent>
        Are you sure you want to permanently delete{' '}
        <strong data-testid="delete-attachment-name">{attachment.file_name}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteAttachment}
          disabled={isDeletePending || errorMessage != undefined}
          endIcon={isDeletePending ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
      {errorMessage != undefined && (
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
            {errorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default DeleteAttachmentDialog;
