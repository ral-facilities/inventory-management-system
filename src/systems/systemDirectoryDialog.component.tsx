import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material';
import React from 'react';
import {
  useCopyToSystem,
  useMoveToSystem,
  useSystem,
  useSystems,
  useSystemsBreadcrumbs,
} from '../api/systems';
import { System } from '../app.types';
import handleTransferState from '../handleTransferState';
import Breadcrumbs from '../view/breadcrumbs.component';
import { SystemsTableView } from './systemsTableView.component';

export interface SystemDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedSystems: System[];
  onChangeSelectedSystems: (selectedSystems: System[]) => void;
  parentSystemId: string | null;
  type: 'moveTo' | 'copyTo';
}

export const SystemDirectoryDialog = (props: SystemDirectoryDialogProps) => {
  const { open, onClose, selectedSystems, onChangeSelectedSystems, type } =
    props;

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

  const { mutateAsync: moveToSystem } = useMoveToSystem();
  const { mutateAsync: copyToSystem } = useCopyToSystem();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleMoveTo = React.useCallback(() => {
    // Either ensure finished loading, or moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetSystemLoading || parentSystemId === null) {
      moveToSystem({
        selectedSystems: selectedSystems,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetSystem: targetSystem || null,
      }).then((response) => {
        handleTransferState(response);
        onChangeSelectedSystems([]);
        handleClose();
      });
    }
  }, [
    handleClose,
    moveToSystem,
    onChangeSelectedSystems,
    parentSystemId,
    selectedSystems,
    targetSystem,
    targetSystemLoading,
  ]);

  const handleCopyTo = React.useCallback(() => {
    console.log(systemsData);
    if ((!targetSystemLoading || parentSystemId === null) && systemsData) {
      const existingSystemCodes = systemsData.map((system) => system.code);

      copyToSystem({
        selectedSystems: selectedSystems,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetSystem: targetSystem || null,
        existingSystemCodes: existingSystemCodes,
      }).then((response) => {
        handleTransferState(response);
        onChangeSelectedSystems([]);
        handleClose();
      });
    }
  }, [
    copyToSystem,
    handleClose,
    onChangeSelectedSystems,
    parentSystemId,
    selectedSystems,
    systemsData,
    targetSystem,
    targetSystemLoading,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{ sx: { height: '632px' } }}
      fullWidth
    >
      <DialogTitle marginLeft={2}>
        <Grid container spacing={2}>
          <Grid item>
            <>
              {type === 'moveTo' ? 'Move ' : 'Copy '}
              {selectedSystems.length > 1
                ? `${selectedSystems.length} systems`
                : '1 system'}{' '}
              to a different system
            </>
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
          selectedSystems={selectedSystems}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            // Disable when not moving anywhere different
            selectedSystems.length > 0 &&
            selectedSystems[0].parent_id === parentSystemId &&
            type === 'moveTo'
          }
          onClick={type === 'moveTo' ? handleMoveTo : handleCopyTo}
        >
          {type === 'moveTo' ? 'Move' : 'Copy'} here
        </Button>
      </DialogActions>
    </Dialog>
  );
};
