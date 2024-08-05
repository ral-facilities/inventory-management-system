import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { MRT_RowSelectionState } from 'material-react-table';
import React from 'react';
import { useMoveItemsToSystem } from '../api/items';
import {
  useGetSystem,
  useGetSystems,
  useGetSystemsBreadcrumbs,
} from '../api/systems';
import { Item, MoveItemsToSystemUsageStatus } from '../app.types';
import handleTransferState from '../handleTransferState';
import Breadcrumbs from '../view/breadcrumbs.component';
import { SystemItemsTable } from './systemItemsTable.component';
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
  list: UsageStatusesType[]
): MoveItemsToSystemUsageStatus[] => {
  return list
    .filter((item) => item.usage_status_id !== '') // Exclude items with empty usageStatus
    .map((item) => ({
      item_id: item.item_id,
      usage_status_id: item.usage_status_id,
    }));
};

const SystemItemsDialog = React.memo((props: SystemItemsDialogProps) => {
  const { open, onClose, selectedItems, onChangeSelectedItems } = props;

  // Store here and update only if changed to reduce re-renders and allow
  // navigation
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    props.parentSystemId
  );
  const [usageStatuses, setUsageStatuses] = React.useState<UsageStatusesType[]>(
    []
  );

  const [aggregatedCellUsageStatus, setAggregatedCellUsageStatus] =
    React.useState<Omit<UsageStatusesType, 'item_id'>[]>([]);

  const [placeIntoSystemError, setPlaceIntoSystemError] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      const initialUsageStatuses: UsageStatusesType[] = selectedItems.map(
        (item) => ({
          item_id: item.id,
          catalogue_item_id: item.catalogue_item_id,
          usage_status_id: '',
        })
      );

      setUsageStatuses(initialUsageStatuses);
    }
  }, [open, selectedItems]);

  React.useEffect(() => {
    setParentSystemId(props.parentSystemId);
  }, [props.parentSystemId]);

  const changeParentSystemId = (newParentSystemId: string | null) => {
    setParentSystemId(newParentSystemId);
    setPlaceIntoSystemError(false);
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

  const [itemUsageStatusesErrorState, setItemUsageStatusesErrorState] =
    React.useState<ItemUsageStatusesErrorStateType>({});

  const validateUsageStatus = React.useCallback(() => {
    let hasUsageStatusErrors: boolean = false;
    usageStatuses.forEach((status) => {
      if (status.usage_status_id === '') {
        setItemUsageStatusesErrorState((prev) => ({
          ...prev,
          [status.item_id]: {
            message: 'Please select a usage status',
            catalogue_item_id: status.catalogue_item_id,
          },
        }));

        hasUsageStatusErrors = true;
      }
    });
    return hasUsageStatusErrors;
  }, [usageStatuses]);

  const handleClose = React.useCallback(() => {
    setAggregatedCellUsageStatus([]);
    setUsageStatuses([]);
    setItemUsageStatusesErrorState({});
    setPlaceIntoSystemError(false);
    setActiveStep(0);
    setParentSystemId(props.parentSystemId);
    onClose();
  }, [onClose, props.parentSystemId]);

  const hasSystemErrors =
    // Disable when not moving anywhere different
    // or when attempting to move to root i.e. no system
    props.parentSystemId === parentSystemId || parentSystemId === null;

  const handleMoveTo = React.useCallback(() => {
    const hasUsageStatusErrors = validateUsageStatus();
    if (hasSystemErrors || hasUsageStatusErrors) {
      if (hasSystemErrors) setPlaceIntoSystemError(hasSystemErrors);
      return;
    }

    // Ensure finished loading and not moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetSystemLoading && targetSystem !== undefined) {
      moveItemsToSystem({
        usageStatuses: convertToSystemUsageStatuses(usageStatuses),
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
    hasSystemErrors,
    moveItemsToSystem,
    onChangeSelectedItems,
    selectedItems,
    targetSystem,
    targetSystemLoading,
    usageStatuses,
    validateUsageStatus,
  ]);

  // Stepper
  const STEPS = ['Place into a system', 'Set usage statuses'];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handleNext = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0: {
          setPlaceIntoSystemError(hasSystemErrors);
          return (
            !hasSystemErrors &&
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
          );
        }
      }
    },
    [hasSystemErrors]
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0: {
          return placeIntoSystemError;
        }
        case 1:
          return Object.keys(itemUsageStatusesErrorState).length !== 0;
      }
    },
    [itemUsageStatusesErrorState, placeIntoSystemError]
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            <Grid item xs={12}>
              <Breadcrumbs
                breadcrumbsInfo={parentSystemBreadcrumbs}
                onChangeNode={changeParentSystemId}
                onChangeNavigateHome={() => {
                  changeParentSystemId(null);
                }}
                navigateHomeAriaLabel={'navigate to systems home'}
              />
            </Grid>
            <Grid item xs={12}>
              <SystemsTableView
                systemsData={systemsData}
                systemsDataLoading={systemsDataLoading}
                onChangeParentId={changeParentSystemId}
                systemParentId={parentSystemId ?? undefined}
                // Use most unrestricted variant (i.e. copy with no selection)
                selectedSystems={[]}
                type="copyTo"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <SystemItemsTable
            moveToSelectedItems={selectedItems}
            type="usageStatus"
            onChangeUsageStatuses={setUsageStatuses}
            usageStatuses={usageStatuses}
            aggregatedCellUsageStatus={aggregatedCellUsageStatus}
            onChangeAggregatedCellUsageStatus={setAggregatedCellUsageStatus}
            itemUsageStatusesErrorState={itemUsageStatusesErrorState}
            onChangeItemUsageStatusesErrorState={setItemUsageStatusesErrorState}
          />
        );
    }
  };

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogTitle marginLeft={2}>
        <Grid container spacing={2}>
          <Grid item>
            Move{' '}
            {selectedItems.length > 1
              ? `${selectedItems.length} items`
              : '1 item'}{' '}
            to a different system
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Stepper
          nonLinear
          activeStep={activeStep}
          orientation="horizontal"
          sx={{ marginTop: 2 }}
        >
          {STEPS.map((label, index) => {
            const labelProps: {
              optional?: React.ReactNode;
              error?: boolean;
            } = {};

            if (isStepFailed(index)) {
              labelProps.optional = (
                <Typography variant="caption" color="error">
                  {index === 1 && 'Please select a usage status for all items'}
                  {index === 0 &&
                    'Move items from current location or root to another system'}
                </Typography>
              );
              labelProps.error = true;
            }

            return (
              <Step sx={{ cursor: 'pointer' }} key={label}>
                <StepLabel {...labelProps} onClick={() => setActiveStep(index)}>
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        <Box sx={{ marginTop: 2 }}>{renderStepContent(activeStep)}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ mr: 'auto' }}>
          Cancel
        </Button>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>

        {activeStep === STEPS.length - 1 ? (
          <Button
            disabled={
              isMovePending ||
              // Disable when not moving anywhere different
              // or when attempting to move to root i.e. no system
              placeIntoSystemError ||
              Object.keys(itemUsageStatusesErrorState).length !== 0 ||
              !(parentSystemId === null
                ? true
                : !targetSystemLoading && targetSystem !== undefined)
            }
            onClick={handleMoveTo}
            sx={{ mr: 3 }}
          >
            Finish
          </Button>
        ) : (
          <Button
            disabled={isStepFailed(activeStep)}
            onClick={() => handleNext(activeStep)}
            sx={{ mr: 3 }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});
SystemItemsDialog.displayName = 'SystemItemsDialog';

export default SystemItemsDialog;
