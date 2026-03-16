import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from '@mui/material';
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
import MRTTopTableAlert from '../common/mrtTopTableAlert.component';
import handleTransferState from '../handleTransferState';
import {
  flexContainerProps,
  formWithStepperDialogProps,
  tableDialogProps,
} from '../utils';
import Breadcrumbs from '../view/breadcrumbs.component';
import { SystemItemsUsageStatusTable } from './systemItemsUsageStatuses.component';
import { SystemsTableView } from './systemsTableView.component';

export interface SystemItemsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItems: Item[];
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
  parentSystemId: string | null;
  isAdminMode: boolean;
}

export interface UsageStatusesType {
  item_id: string;
  catalogue_item_id: string;
  usage_status_id: string;
}

export interface UsageStatusesErrorType extends Omit<
  UsageStatusesType,
  'usageStatus'
> {
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
  const { open, onClose, selectedItems, onChangeSelectedItems, isAdminMode } =
    props;

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
  const { data: selectedRules, isLoading: isSelectedRulesLoading } =
    useGetRules(srcSystemTypeId, dstSystemTypeId);

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

  // Stepper
  const STEPS = ['Place into a system', 'Confirm usage statuses'];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const populateUsageStatuses = React.useCallback(() => {
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
    setUsageStatuses([]);
    setPlaceIntoSystemError(undefined);
    setActiveStep(0);
    setParentSystemId(props.parentSystemId);
    onClose();
  }, [onClose, props.parentSystemId, setActiveStep]);

  const hasSystemErrors =
    // Disable when not moving anywhere different
    // or when attempting to move to root i.e. no system
    props.parentSystemId === parentSystemId || parentSystemId === null;

  const handleMoveTo = React.useCallback(() => {
    if (hasSystemErrors) {
      setPlaceIntoSystemError(
        'Please move items from current location or root to another system.'
      );
      return;
    }

    // Ensure finished loading and not moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetSystemLoading && targetSystem !== undefined) {
      if (isAdminMode) {
        moveItemsToSystem({
          mode: 'multiple',
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
      } else {
        moveItemsToSystem({
          mode: 'single',
          usageStatusId:
            srcSystemTypeId === dstSystemTypeId || selectedRules?.length === 0
              ? undefined
              : selectedRules?.[0]?.dst_usage_status?.id,
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
    }
  }, [
    hasSystemErrors,
    usageStatuses,
    srcSystemTypeId,
    dstSystemTypeId,
    selectedRules,
    targetSystemLoading,
    targetSystem,
    moveItemsToSystem,
    isAdminMode,
    selectedItems,
    onChangeSelectedItems,
    handleClose,
  ]);

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
    [hasSystemErrors, populateUsageStatuses, setActiveStep]
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const shouldShowMissingRuleWarning =
    !selectedRules?.[0] && srcSystemTypeId !== dstSystemTypeId;
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack sx={{ height: '100%' }} spacing={1.5}>
            <Breadcrumbs
              breadcrumbsInfo={parentSystemBreadcrumbs}
              onChangeNode={changeParentSystemId}
              onChangeNavigateHome={() => {
                changeParentSystemId(null);
              }}
              homeLocation="Systems"
            />

            <Box sx={{ p: 1, ...flexContainerProps, minHeight: '500px' }}>
              {parentSystemId &&
                selectedItems.length !== 0 &&
                !isSelectedRulesLoading &&
                !systemsDataLoading && (
                  <MRTTopTableAlert
                    title={
                      shouldShowMissingRuleWarning
                        ? `WARNING: No rule exists for moving ${selectedItems.length > 1 ? 'these items' : 'this item'} between these system types`
                        : 'Item Moving Rule Applied'
                    }
                    showInfoTooltip={!shouldShowMissingRuleWarning}
                    infoTooltipTitle={
                      selectedRules && selectedRules[0]
                        ? `The ${selectedItems.length > 1 ? "items' usage statuses" : "item's usage status"} will be updated to ${selectedRules[0].dst_usage_status?.value}, according to the rules`
                        : `The ${selectedItems.length > 1 ? "items' usage statuses" : "item's usage status"} will remain the same, according to the rules`
                    }
                    alertProps={{
                      elevation: 1,
                      color: shouldShowMissingRuleWarning ? 'warning' : 'info',
                    }}
                  />
                )}
              <SystemsTableView
                systemsData={systemsData}
                systemsDataLoading={systemsDataLoading}
                onChangeParentId={changeParentSystemId}
                systemParentId={parentSystemId ?? undefined}
                isSystemSelectable={(system) => {
                  if (isAdminMode) return true;
                  const matchesSrc = system?.type_id === srcSystemTypeId;
                  const matchesAnyDstRule =
                    Array.isArray(tableRules) &&
                    tableRules.some(
                      (rule) => rule?.dst_system_type?.id === system?.type_id
                    );
                  return matchesSrc || matchesAnyDstRule;
                }}
                // Use most unrestricted variant (i.e. copy with no selection)
                selectedSystems={[]}
                type="copyTo"
              />
            </Box>
          </Stack>
        );
      case 1:
        return (
          <Box
            sx={{
              p: 1,
              ...flexContainerProps,
              height: '100%',
              minHeight: '500px',
            }}
          >
            <SystemItemsUsageStatusTable
              items={selectedItems}
              onChangeUsageStatuses={setUsageStatuses}
              usageStatuses={usageStatuses}
            />
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      {...(isAdminMode ? formWithStepperDialogProps : tableDialogProps)}
    >
      <DialogTitle
        sx={{ display: 'inline-flex', alignItems: 'center', paddingBottom: 0 }}
      >
        Move{' '}
        {selectedItems.length > 1 ? `${selectedItems.length} items` : '1 item'}{' '}
        to a different system{isAdminMode ? ' as Admin' : ''}
        {isAdminMode && (
          <Tooltip
            title="As an admin, you can bypass rules that restrict item placement for other users, and you can modify the item's usage status"
            data-testid={'admin-status-tooltip'}
            placement="top"
            enterTouchDelay={0}
            arrow
            sx={{ mx: 2 }}
          >
            <InfoOutlinedIcon />
          </Tooltip>
        )}
      </DialogTitle>
      <DialogContent
        sx={{
          height: `calc(100% - 16px ${isAdminMode ? '- 40px' : ''})`,
        }}
      >
        {isAdminMode && (
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

              if (placeIntoSystemError !== undefined && index == 0) {
                labelProps.optional = (
                  <Typography variant="caption" color="error">
                    {
                      'Move items from current location or root to another system'
                    }
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
        <Box sx={{ marginTop: 2, height: 'inherit' }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ mr: 'auto' }}>
          Cancel
        </Button>
        {isAdminMode && (
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
        )}
        {isAdminMode ? (
          activeStep === STEPS.length - 1 ? (
            <Button
              disabled={
                isMovePending ||
                // Disable when not moving anywhere different
                // or when attempting to move to root i.e. no system
                placeIntoSystemError !== undefined ||
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
              disabled={
                placeIntoSystemError !== undefined ||
                !(parentSystemId === null
                  ? true
                  : !targetSystemLoading && targetSystem !== undefined)
              }
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
