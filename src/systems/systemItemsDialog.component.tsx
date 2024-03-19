import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import { MRT_RowSelectionState } from 'material-react-table';
import React from 'react';
import { useMoveItemsToSystem } from '../api/item';
import { useSystem, useSystems, useSystemsBreadcrumbs } from '../api/systems';
import { Item } from '../app.types';
import handleTransferState from '../handleTransferState';
import Breadcrumbs from '../view/breadcrumbs.component';
import { SystemsTableView } from './systemsTableView.component';

export interface SystemItemsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: Item[];
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
  parentSystemId: string | null;
}

const SystemItemsDialog = React.memo((props: SystemItemsDialogProps) => {
  const { open, onClose, selectedItems, onChangeSelectedItems } = props;

  // Store here and update only if changed to reduce re-renders and allow
  // navigation
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    props.parentSystemId
  );
  React.useEffect(() => {
    setParentSystemId(props.parentSystemId);
  }, [props.parentSystemId]);

  const { data: parentSystemBreadcrumbs } =
    useSystemsBreadcrumbs(parentSystemId);

  const { data: systemsData, isLoading: systemsDataLoading } = useSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: targetSystem, isLoading: targetSystemLoading } =
    useSystem(parentSystemId);

  const { mutateAsync: moveItemsToSystem, isPending: isMovePending } =
    useMoveItemsToSystem();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleMoveTo = React.useCallback(() => {
    // Ensure finished loading and not moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetSystemLoading && targetSystem !== undefined) {
      moveItemsToSystem({
        selectedItems: selectedItems,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetSystem: targetSystem,
      }).then((response) => {
        handleTransferState(response);
        onChangeSelectedItems({});
        handleClose();
      });
    }
  }, [
    handleClose,
    moveItemsToSystem,
    onChangeSelectedItems,
    selectedItems,
    targetSystem,
    targetSystemLoading,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle marginLeft={2}>
        <Grid container spacing={2}>
          <Grid item>
            Move{' '}
            {selectedItems.length > 1
              ? `${selectedItems.length} items`
              : '1 item'}{' '}
            to a different system
          </Grid>
          <Grid item xs={12}>
            <Breadcrumbs
              breadcrumbsInfo={parentSystemBreadcrumbs}
              onChangeNode={setParentSystemId}
              onChangeNavigateHome={() => {
                setParentSystemId(null);
              }}
              navigateHomeAriaLabel={'navigate to systems home'}
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <SystemsTableView
          systemsData={systemsData}
          systemsDataLoading={systemsDataLoading}
          onChangeParentId={setParentSystemId}
          systemParentId={parentSystemId ?? undefined}
          // Use most unrestricted variant (i.e. copy with no selection)
          selectedSystems={[]}
          type="copyTo"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={
            isMovePending ||
            // Disable when not moving anywhere different
            // or when attempting to move to root i.e. no system
            props.parentSystemId === parentSystemId ||
            parentSystemId === null ||
            // Ensure finished loading and not moving to root
            !(!targetSystemLoading && targetSystem !== undefined)
          }
          onClick={handleMoveTo}
        >
          Move here
        </Button>
      </DialogActions>
    </Dialog>
  );
});
SystemItemsDialog.displayName = 'SystemItemsDialog';

export default SystemItemsDialog;
