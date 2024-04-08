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
import { useSystem, useSystems, useSystemsBreadcrumbs } from '../api/systems';
import {
  Item,
  MoveItemsToSystemUsageStatus,
  UsageStatusType,
} from '../app.types';
import handleTransferState from '../handleTransferState';
import Breadcrumbs from '../view/breadcrumbs.component';
import { SystemsTableView } from './systemsTableView.component';
import { SystemItemsTable } from './systemItemsTable.component';

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
  usageStatus: UsageStatusType | '';
}

export interface UsageStatusesErrorType
  extends Omit<UsageStatusesType, 'usageStatus'> {
  error: boolean;
}

const convertToSystemUsageStatuses = (
  list: UsageStatusesType[]
): MoveItemsToSystemUsageStatus[] => {
  return list
    .filter((item) => item.usageStatus !== '') // Exclude items with empty usageStatus
    .map((item) => ({
      item_id: item.item_id,
      usage_status: item.usageStatus as UsageStatusType,
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

  const [usageStatusesErrors, setUsageStatusesErrors] = React.useState<
    UsageStatusesErrorType[]
  >([]);

  const [aggregatedCellUsageStatus, setAggregatedCellUsageStatus] =
    React.useState<Omit<UsageStatusesType, 'item_id'>[]>([]);

  const [placeIntoSystemError, setPlaceIntoSystemError] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      const initialUsageStatuses: UsageStatusesType[] = selectedItems.map(
        (item) => ({
          item_id: item.id,
          catalogue_item_id: item.catalogue_item_id,
          usageStatus: '',
        })
      );

      const initialUsageStatusesErrors: UsageStatusesErrorType[] =
        selectedItems.map((item) => ({
          item_id: item.id,
          catalogue_item_id: item.catalogue_item_id,
          error: false,
        }));
      setUsageStatuses(initialUsageStatuses);
      setUsageStatusesErrors(initialUsageStatusesErrors);
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
    useSystemsBreadcrumbs(parentSystemId);

  const { data: systemsData, isLoading: systemsDataLoading } = useSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: targetSystem, isLoading: targetSystemLoading } =
    useSystem(parentSystemId);

  const { mutateAsync: moveItemsToSystem, isPending: isMovePending } =
    useMoveItemsToSystem();

  const errorUsageStatusesItemId = usageStatusesErrors
    .map((status) => {
      if (status.error) {
        return status.item_id;
      }
      return null;
    })
    .filter((errorItemId) => errorItemId !== null);

  const validateUsageStatus = React.useCallback(() => {
    const errorItemId = usageStatuses
      .map((status) => {
        if (status.usageStatus === '') {
          return status.item_id;
        }
        return null;
      })
      .filter((errorItemId) => errorItemId !== null);

    setUsageStatusesErrors((prevErrors) =>
      prevErrors.map((error) => {
        const index = errorItemId.indexOf(error.item_id);
        if (index !== -1) {
          return { ...error, error: true }; // Set error status to true if item_id exists in errorItemId
        }
        return error; // Return unchanged error object if item_id doesn't exist in errorItemId
      })
    );
    return errorItemId.length !== 0;
  }, [usageStatuses]);

  const handleClose = React.useCallback(() => {
    setAggregatedCellUsageStatus([]);
    setUsageStatuses([]);
    setUsageStatusesErrors([]);
    setPlaceIntoSystemError(false);
    setActiveStep(0);
    onClose();
  }, [onClose]);

  const hasSystemErrors =
    // Disable when not moving anywhere different
    // or when attempting to move to root i.e. no system
    props.parentSystemId === parentSystemId ||
    parentSystemId === null ||
    !(!targetSystemLoading && targetSystem !== undefined);

  const handleMoveTo = React.useCallback(() => {
    const hasUsageStatusErrors = validateUsageStatus();
    if (hasSystemErrors || hasUsageStatusErrors) {
      hasSystemErrors && setPlaceIntoSystemError(hasSystemErrors);
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
          return errorUsageStatusesItemId.length !== 0;
      }
    },
    [errorUsageStatusesItemId.length, placeIntoSystemError]
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
            onChangeUsageStatusesErrors={setUsageStatusesErrors}
            usageStatusesErrors={usageStatusesErrors}
            aggregatedCellUsageStatus={aggregatedCellUsageStatus}
            onChangeAggregatedCellUsageStatus={setAggregatedCellUsageStatus}
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
              errorUsageStatusesItemId.length !== 0 ||
              !(!targetSystemLoading && targetSystem !== undefined)
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
