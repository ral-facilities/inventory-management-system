import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
import handleTransferState from '../handleTransferState';
import Breadcrumbs from '../view/breadcrumbs.component';
import { SystemsTableView } from './systemsTableView.component';
import { SystemItemsUsageStatusTable } from './systemItemsUsageStatuses.component';
import { MoveItemsToSystemUsageStatus } from '../app.types';

export interface SystemItemsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: Item[];
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
  parentSystemId: string | null;
  isPrivilegedUser: boolean;
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
  const {
    open,
    onClose,
    selectedItems,
    onChangeSelectedItems,
    isPrivilegedUser,
  } = props;

  // Store here and update only if changed to reduce re-renders and allow
  // navigation
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    props.parentSystemId
  );
  const [usageStatuses, setUsageStatuses] = React.useState<UsageStatusesType[]>(
    []
  );

  const { data: dstSystem } = useGetSystem(parentSystemId);
  const { data: srcSystem } = useGetSystem(props.parentSystemId);
  const srcSystemTypeId = srcSystem?.type_id ?? 'null';

  const dstSystemTypeId = dstSystem?.type_id ?? 'null';
  const { data: tableRules } = useGetRules(srcSystemTypeId);

  // This should be a list of 1 rule
  const { data: selectedRules } = useGetRules(srcSystemTypeId, dstSystemTypeId);
  const [aggregatedCellUsageStatus, setAggregatedCellUsageStatus] =
    React.useState<Omit<UsageStatusesType, 'item_id'>[]>([]);
  const [placeIntoSystemError, setPlaceIntoSystemError] = React.useState<
    string | undefined
  >(undefined);

  React.useEffect(() => {
    if (open) {
      const initialUsageStatuses: UsageStatusesType[] = selectedItems.map(
        (item) => ({
          item_id: item.id,
          catalogue_item_id: item.catalogue_item_id,
          usage_status_id: item.usage_status_id,
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
    setPlaceIntoSystemError(undefined);
    populateUsageStatuses();
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

  const populateUsageStatuses = React.useCallback(() => {
    setItemUsageStatusesErrorState({});

    const usageStatusId =
      srcSystemTypeId === dstSystemTypeId || selectedRules?.length === 0
        ? undefined
        : selectedRules?.[0]?.dst_usage_status?.id;

    setUsageStatuses(
      usageStatuses.map((usage_status) => {
        return {
          ...usage_status,
          usage_status_id:
            usageStatusId ??
            selectedItems.find((item) => item.id == usage_status.item_id)
              ?.usage_status_id ??
            '',
        };
      })
    );
  }, [
    dstSystemTypeId,
    selectedItems,
    selectedRules,
    srcSystemTypeId,
    usageStatuses,
  ]);

  const handleClose = React.useCallback(() => {
    setAggregatedCellUsageStatus([]);
    setUsageStatuses([]);
    setItemUsageStatusesErrorState({});
    setPlaceIntoSystemError(undefined);
    setActiveStep(0);
    setParentSystemId(props.parentSystemId);
    onClose();
  }, [onClose, props.parentSystemId]);

  const hasSystemErrors =
    // Disable when not moving anywhere different
    // or when attempting to move to root i.e. no system
    props.parentSystemId === parentSystemId || parentSystemId === null;

  const handleMoveTo = React.useCallback(() => {
    const hasUsageStatusErrors = isPrivilegedUser
      ? validateUsageStatus()
      : false;

    if (hasSystemErrors || hasUsageStatusErrors) {
      if (hasSystemErrors) {
        setPlaceIntoSystemError(
          'Please move items from current location or root to another system.'
        );
      }
      return;
    }
    // The configuration of usage statuses depends on if the user is privileged
    // If they are, then it should be a list, as the usage statuses may not have been prepopulated.
    // This assumption is made as one would think a user would 'move as Admin' to bypass a rule, which means that there is no dst_usage_status specified for the move.

    const usageStatusConfig = isPrivilegedUser
      ? convertToSystemUsageStatuses(usageStatuses)
      : srcSystemTypeId === dstSystemTypeId || selectedRules?.length === 0
        ? undefined
        : selectedRules?.[0]?.dst_usage_status?.id;

    // Ensure finished loading and not moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetSystemLoading && targetSystem !== undefined) {
      moveItemsToSystem({
        usageStatusConfig: usageStatusConfig,
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
    isPrivilegedUser,
    validateUsageStatus,
    hasSystemErrors,
    usageStatuses,
    srcSystemTypeId,
    dstSystemTypeId,
    selectedRules,
    targetSystemLoading,
    targetSystem,
    moveItemsToSystem,
    selectedItems,
    onChangeSelectedItems,
    handleClose,
  ]);

  // Stepper
  const STEPS = ['Place into a system', 'Confirm usage statuses'];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handleNext = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0: {
          if (hasSystemErrors) {
            setPlaceIntoSystemError(
              'Please move items from current location or root to another system.'
            );
          } else {
            populateUsageStatuses();
          }
          return (
            !hasSystemErrors &&
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
          );
        }
      }
    },
    [hasSystemErrors, populateUsageStatuses]
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0: {
          return placeIntoSystemError !== undefined;
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
                    isPrivilegedUser ||
                    tableRules?.some(
                      (rule) =>
                        rule.dst_system_type?.id === system.type_id ||
                        system.type_id === srcSystemTypeId
                    ) ||
                    false
                  );
                }}
                // Use most unrestricted variant (i.e. copy with no selection)
                selectedSystems={[]}
                type="copyTo"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <SystemItemsUsageStatusTable
            items={selectedItems}
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
    <Dialog open={open} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'inline-flex', alignItems: 'center' }}>
        Move{' '}
        {selectedItems.length > 1 ? `${selectedItems.length} items` : '1 item'}{' '}
        to a different system{isPrivilegedUser ? ' as Admin' : ''}
        {isPrivilegedUser && (
          <Tooltip
            title={
              "As an admin, you can bypass rules that restrict item placement for other users, and you can modify the item's usage status"
            }
            disableHoverListener={false}
            data-testid={'admin-status-tooltip'}
          >
            <IconButton
              disableRipple
              sx={{ backgroundColor: 'transparent' }}
              size="large"
            >
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>
      <DialogContent>
        {isPrivilegedUser && (
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
                    {index === 1 &&
                      'Please select a usage status for all items'}
                    {index === 0 &&
                      'Move items from current location or root to another system'}
                  </Typography>
                );
                labelProps.error = true;
              }

              return (
                <Step sx={{ cursor: 'pointer' }} key={label}>
                  <StepLabel
                    {...labelProps}
                    onClick={() => setActiveStep(index)}
                  >
                    {label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        )}
        <Box sx={{ marginTop: 2 }}>{renderStepContent(activeStep)}</Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ mr: 'auto' }}>
          Cancel
        </Button>
        {isPrivilegedUser && (
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
        )}
        {isPrivilegedUser ? (
          activeStep === STEPS.length - 1 ? (
            <Button
              disabled={
                isMovePending ||
                // Disable when not moving anywhere different
                // or when attempting to move to root i.e. no system
                placeIntoSystemError !== undefined ||
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
          )
        ) : (
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
        )}
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
