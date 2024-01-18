import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import React from 'react';
import { useDeleteItem } from '../api/item';
import { Item } from '../app.types';
import { AxiosError } from 'axios';
import { useSystem } from '../api/systems';
import { Link } from 'react-router-dom';

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

  const { data: systemData } = useSystem(item?.system_id ?? null);
  const { mutateAsync: deleteItem } = useDeleteItem();

  const handleClose = React.useCallback(() => {
    onClose();
    setError(false);
    setErrorMessage('');
  }, [onClose]);
  const handleDeleteItem = React.useCallback(() => {
    if (item) {
      deleteItem(item)
        .then((response) => {
          onClose();
          onChangeItem(undefined);
        })
        .catch((error: AxiosError) => {
          setError(true);
          setErrorMessage('Please refresh and try again');
        });
    } else {
      setError(true);
      setErrorMessage('No data provided, Please refresh and try again');
    }
  }, [deleteItem, item, onChangeItem, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <DialogTitle>Delete Item</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex' }}>
          {systemData && (
            <Typography sx={{ pr: '4px' }}>
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
            Are you sure you want to delete this item with{' '}
            <strong data-testid={`delete-item-${item?.id}`}>
              {`ID: ${item?.id} `}
            </strong>
            ?
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDeleteItem} disabled={error}>
          Continue
        </Button>
      </DialogActions>
      {error && (
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

export default DeleteItemDialog;
