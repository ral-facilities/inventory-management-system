import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MRT_RowSelectionState } from 'material-react-table';
import React from 'react';
import { Item } from '../api/api.types';
import { useMoveItemsToSystem } from '../api/items';
import { useGetRules } from '../api/rules';
import {
  useGetSystem,
  useGetSystems,
  useGetSystemsBreadcrumbs,
} from '../api/systems';
import { MoveItemsToSystemUsageStatus } from '../app.types';
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

export interface UsageStatusesType {
  item_id: string;
  catalogue_item_id: string;
  usage_status_id: string;
}

export interface UsageStatusesErrorType
  extends Omit<UsageStatusesType, 'usageStatus'> {
  error: boolean;
}

export interface ItemUsageStatusesErrorStateType {
  [item_id: string]: { message: string; catalogue_item_id: string };
}

const convertToSystemUsageStatuses = (
  selectedItems: Item[],
  usage_status_id: string
): MoveItemsToSystemUsageStatus[] => {
  return selectedItems.map((item) => ({
    item_id: item.id,
    usage_status_id: usage_status_id,
  }));
};

const SystemItemsDialog = React.memo((props: SystemItemsDialogProps) => {
  const { open, onClose, selectedItems, onChangeSelectedItems } = props;

  // Store here and update only if changed to reduce re-renders and allow
  // navigation
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    props.parentSystemId
  );

  const { data: dstSystem } = useGetSystem(parentSystemId);
  const { data: srcSystem } = useGetSystem(props.parentSystemId);
  const srcSystemTypeId = srcSystem?.type_id ?? 'null';

  const dstSystemTypeId = dstSystem?.type_id ?? 'null';
  const { data: tableRules } = useGetRules(srcSystemTypeId);

  // This should be a list of 1 rule
  const { data: SelectedRule } = useGetRules(srcSystemTypeId, dstSystemTypeId);

  const [placeIntoSystemError, setPlaceIntoSystemError] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    setParentSystemId(props.parentSystemId);
  }, [props.parentSystemId]);

  const changeParentSystemId = (newParentSystemId: string | null) => {
    setParentSystemId(newParentSystemId);
    setPlaceIntoSystemError(undefined);
  };

  const { data: parentSystemBreadcrumbs } =
    useGetSystemsBreadcrumbs(parentSystemId);

  const { data: systemsData, isLoading: systemsDataLoading } = useGetSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: targetSystem, isLoading: targetSystemLoading } =
    useGetSystem(parentSystemId);

  const { mutateAsync: moveItemsToSystem, isPending: isMovePending } =
    useMoveItemsToSystem();

  const handleClose = React.useCallback(() => {
    setPlaceIntoSystemError(undefined);
    setParentSystemId(props.parentSystemId);
    onClose();
  }, [onClose, props.parentSystemId]);

  const hasSystemErrors =
    // Disable when not moving anywhere different
    // or when attempting to move to root i.e. no system
    props.parentSystemId === parentSystemId || parentSystemId === null;

  const handleMoveTo = React.useCallback(() => {
    if (hasSystemErrors) {
      if (hasSystemErrors)
        setPlaceIntoSystemError(
          'Please move items from current location or root to another system.'
        );
      return;
    }

    // Ensure finished loading and not moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetSystemLoading && targetSystem !== undefined) {
      moveItemsToSystem({
        usageStatuses: convertToSystemUsageStatuses(
          selectedItems,
          SelectedRule?.[0].dst_usage_status?.id ?? ''
        ),
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
    SelectedRule,
    handleClose,
    hasSystemErrors,
    moveItemsToSystem,
    onChangeSelectedItems,
    selectedItems,
    targetSystem,
    targetSystemLoading,
  ]);

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle marginLeft={2}>
        <Grid container spacing={2}>
          <Grid>
            Move{' '}
            {selectedItems.length > 1
              ? `${selectedItems.length} items`
              : '1 item'}{' '}
            to a different system
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1.5} size={12}>
          <Grid size={12}>
            <Breadcrumbs
              breadcrumbsInfo={parentSystemBreadcrumbs}
              onChangeNode={changeParentSystemId}
              onChangeNavigateHome={() => {
                changeParentSystemId(null);
              }}
              homeLocation="Systems"
            />
          </Grid>
          <Grid size={12}>
            <SystemsTableView
              systemsData={systemsData}
              systemsDataLoading={systemsDataLoading}
              onChangeParentId={changeParentSystemId}
              systemParentId={parentSystemId ?? undefined}
              isSystemSelectable={(system) => {
                return (
                  tableRules?.some(
                    (rule) => rule.dst_system_type?.id === system.type_id
                  ) || false
                );
              }}
              // Use most unrestricted variant (i.e. copy with no selection)
              selectedSystems={[]}
              type="copyTo"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ mr: 'auto' }}>
          Cancel
        </Button>

        <Button
          disabled={
            isMovePending ||
            // Disable when not moving anywhere different
            // or when attempting to move to root i.e. no system
            !!placeIntoSystemError ||
            !(parentSystemId === null
              ? true
              : !targetSystemLoading && targetSystem !== undefined)
          }
          onClick={handleMoveTo}
          sx={{ mr: 3 }}
        >
          Move here
        </Button>
      </DialogActions>
      {placeIntoSystemError && (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <FormHelperText sx={{ mb: 4 }} error>
            {placeIntoSystemError}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
});
SystemItemsDialog.displayName = 'SystemItemsDialog';

export default SystemItemsDialog;
