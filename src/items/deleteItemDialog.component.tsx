import WarningIcon from '@mui/icons-material/Warning';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  Link as MuiLink,
  Tooltip,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { Link } from 'react-router';
import { Item } from '../api/api.types';
import { useDeleteItem } from '../api/items';
import { useGetRules } from '../api/rules';
import { useGetSystem } from '../api/systems';
import handleIMS_APIError from '../handleIMS_APIError';

export interface DeleteItemDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item;
  onChangeItem: (Item: Item | undefined) => void;
  isAdminUser: boolean;
}

const DeleteItemDialog = (props: DeleteItemDialogProps) => {
  const { open, onClose, item, onChangeItem, isAdminUser } = props;
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const { data: systemData } = useGetSystem(item?.system_id);

  // This should be a list of 1 rule
  const { data: selectedRules } = useGetRules(
    systemData?.type_id ?? 'null',
    'null'
  );

  const { data: deletionRules } = useGetRules(undefined, 'null');

  const { mutateAsync: deleteItem, isPending: isDeletePending } =
    useDeleteItem();

  const handleClose = React.useCallback(() => {
    onClose();
    setErrorMessage(undefined);
  }, [onClose]);

  const handleDeleteItem = React.useCallback(() => {
    const allowedSystemTypes: string[] =
      deletionRules
        ?.map((rule) => rule.src_system_type?.value ?? '')
        .filter((value): value is string => value !== '') || [];

    if ((selectedRules && selectedRules.length > 0) || isAdminUser) {
      deleteItem(item)
        .then(() => {
          onClose();
          onChangeItem(undefined);
        })
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    } else {
      setErrorMessage(
        `Please move item to a system with Type: ${allowedSystemTypes.join(', ')} before trying to delete.`
      );
    }
  }, [
    selectedRules,
    deleteItem,
    deletionRules,
    isAdminUser,
    item,
    onChangeItem,
    onClose,
  ]);

  return (
    <Dialog open={open} maxWidth="lg">
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <WarningIcon sx={{ marginRight: 1 }} />
        Delete Item {isAdminUser ? 'as admin' : ''}
        {isAdminUser && (
          <Tooltip
            title={
              <h4>
                As an admin, you can bypass system rules that prevent other
                users from deleting an item
              </h4>
            }
            disableHoverListener={false}
            aria-label={'admin-status-tooltip'}
          >
            <IconButton
              disableRipple
              sx={{ backgroundColor: 'transparent' }}
              size="large"
            >
              <InfoOutlinedIcon
                sx={{
                  color: '#003088',
                }}
              />
            </IconButton>
          </Tooltip>
        )}
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
          disabled={isDeletePending || !!errorMessage}
          endIcon={isDeletePending ? <CircularProgress size={20} /> : null}
        >
          Continue
        </Button>
      </DialogActions>
      {errorMessage && (
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
