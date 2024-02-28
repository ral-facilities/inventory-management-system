import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tooltip,
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
import { MRT_RowSelectionState } from 'material-react-table';

export interface SystemDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedSystems: System[];
  onChangeSelectedSystems: (selectedSystems: MRT_RowSelectionState) => void;
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

  const { mutateAsync: moveToSystem, isPending: isMovePending } =
    useMoveToSystem();
  const { mutateAsync: copyToSystem, isPending: isCopyPending } =
    useCopyToSystem();

  const handleClose = React.useCallback(() => {
    onClose();
    setParentSystemId(props.parentSystemId);
  }, [onClose, props.parentSystemId]);

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
        onChangeSelectedSystems({});
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
    if (
      (!targetSystemLoading || parentSystemId === null) &&
      systemsData !== undefined
    ) {
      const existingSystemNames = systemsData.map((system) => system.name);

      copyToSystem({
        selectedSystems: selectedSystems,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetSystem: targetSystem || null,
        existingSystemNames: existingSystemNames,
      }).then((response) => {
        handleTransferState(response);
        onChangeSelectedSystems({});
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
      PaperProps={{ sx: { height: '692px' } }}
      fullWidth
    >
      <DialogTitle marginLeft={2}>
        <Grid container spacing={2}>
          <Grid item>
            <Box
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
            >
              <>
                {type === 'moveTo' ? 'Move ' : 'Copy '}
                {selectedSystems.length > 1
                  ? `${selectedSystems.length} systems`
                  : '1 system'}{' '}
                to a different system
              </>
              {type === 'copyTo' && (
                <Tooltip
                  title={
                    'Only the system details will be copied; no subsystems or items within the system will be included.'
                  }
                  placement="top"
                  enterTouchDelay={0}
                  arrow
                  aria-label={'Copy Warning'}
                  sx={{ mx: 2 }}
                >
                  <InfoOutlinedIcon />
                </Tooltip>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Breadcrumbs
              breadcrumbsInfo={parentSystemBreadcrumbs}
              onChangeNode={setParentSystemId}
              onChangeNavigateHome={() => setParentSystemId(null)}
              navigateHomeAriaLabel={'navigate to systems home'}
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <SystemsTableView
          systemsData={systemsData}
          systemsDataLoading={systemsDataLoading}
          systemParentId={parentSystemId ?? undefined}
          onChangeParentId={setParentSystemId}
          selectedSystems={selectedSystems}
          type={type}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            isCopyPending ||
            isMovePending ||
            // Disable when not moving anywhere different
            (props.parentSystemId === parentSystemId && type === 'moveTo')
          }
          onClick={type === 'moveTo' ? handleMoveTo : handleCopyTo}
        >
          {type === 'moveTo' ? 'Move' : 'Copy'} here
        </Button>
      </DialogActions>
    </Dialog>
  );
};
