import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MRT_RowSelectionState } from 'material-react-table';
import React from 'react';
import { System } from '../api/api.types';
import {
  useCopyToSystem,
  useGetSystem,
  useGetSystems,
  useGetSystemsBreadcrumbs,
  useMoveToSystem,
} from '../api/systems';
import handleTransferState from '../handleTransferState';
import Breadcrumbs from '../view/breadcrumbs.component';
import { SystemsTableView } from './systemsTableView.component';

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

  const { data: parentSystem } = useGetSystem(props.parentSystemId);

  const parentSystemTypeId = React.useMemo(() => {
    if (parentSystem) {
      return parentSystem.type_id;
    }
    return null;
  }, [parentSystem]);

  // Store here and update only if changed to reduce re-renders and allow
  // navigation
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    props.parentSystemId
  );
  React.useEffect(() => {
    setParentSystemId(props.parentSystemId);
  }, [props.parentSystemId]);

  const { data: parentSystemBreadcrumbs } =
    useGetSystemsBreadcrumbs(parentSystemId);

  const { data: systemsData, isLoading: systemsDataLoading } = useGetSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: targetSystem, isLoading: targetSystemLoading } =
    useGetSystem(parentSystemId);

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
      const existingSystemCodes = systemsData.map((system) => system.code);

      copyToSystem({
        selectedSystems: selectedSystems,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetSystem: targetSystem || null,
        existingSystemCodes: existingSystemCodes,
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
      maxWidth="lg"
      slotProps={{ paper: { sx: { height: '692px' } } }}
      fullWidth
    >
      <DialogTitle marginLeft={2}>
        <Grid container spacing={2}>
          <Grid>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
          <Grid size={12}>
            <Breadcrumbs
              breadcrumbsInfo={parentSystemBreadcrumbs}
              onChangeNode={setParentSystemId}
              onChangeNavigateHome={() => setParentSystemId(null)}
              homeLocation="Systems"
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
          isSystemSelectable={(system: System) => {
            return parentSystemTypeId === system.type_id;
          }}
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
            (props.parentSystemId === parentSystemId && type === 'moveTo') ||
            // Either ensure finished loading, or moving to root (move to)
            !(!targetSystemLoading || parentSystemId === null) ||
            // Either ensure finished loading, or moving to root and system data is defined (copy to)
            !(
              (!targetSystemLoading || parentSystemId === null) &&
              systemsData !== undefined
            )
          }
          onClick={type === 'moveTo' ? handleMoveTo : handleCopyTo}
        >
          {type === 'moveTo' ? 'Move' : 'Copy'} here
        </Button>
      </DialogActions>
    </Dialog>
  );
};
