import { Dialog, DialogTitle } from '@mui/material';
import React from 'react';
import { Item } from '../app.types';

export interface SystemItemsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: Item[];
}

const SystemItemsDialog = React.memo((props: SystemItemsDialogProps) => {
  const { open, onClose, selectedItems } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Move{' '}
        {selectedItems.length > 1 ? `${selectedItems.length} items` : '1 item'}{' '}
        to a different system
      </DialogTitle>
    </Dialog>
  );
});

export default SystemItemsDialog;
