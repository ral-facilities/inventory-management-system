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
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../api/api.types';
import { useDeleteItem } from '../api/items';
import { useGetSystem } from '../api/systems';
import handleIMS_APIError from '../handleIMS_APIError';

export interface DeleteItemDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item | undefined;
  onChangeItem: (Item: Item | undefined) => void;
}

const DeleteItemDialog = (props: DeleteItemDialogProps) => {
  const { open, onClose, item, onChangeItem } = props;

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { data: systemData } = useGetSystem(item?.system_id);
  const { mutateAsync: deleteItem, isPending: isDeletePending } =
    useDeleteItem();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage('');
  }, [onClose]);
  const handleDeleteItem = React.useCallback(() => {
    if (item) {
      deleteItem(item)
        .then(() => {
          onClose();
          onChangeItem(undefined);
        })
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [deleteItem, item, onChangeItem, onClose]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Item
      </DialogTitle>
      <DialogContent>
        {systemData && (
          <Typography sx={{ pr: 0.5, pb: 1 }}>
            This item is currently in the{' '}
            <MuiLink
              underline="hover"
              component={Link}
              to={`/systems/${systemData.id}`}
            >
              {systemData.name}
            </MuiLink>{' '}
            system.
          </Typography>
        )}
        <Typography>
          Are you sure you want to permanently delete this item with{' '}
          <strong data-testid={`delete-item-${item?.id}`}>
            {`Serial Number: ${item?.serial_number ?? 'No serial number'}`}
          </strong>
          ?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDeleteItem}
          disabled={isDeletePending || error}
          endIcon={isDeletePending ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
      {error && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 3,
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

export default DeleteItemDialog;
