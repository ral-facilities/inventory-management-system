import { zodResolver } from '@hookform/resolvers/zod';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DatePicker, DateValidationError } from '@mui/x-date-pickers';
import { AxiosError } from 'axios';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  CatalogueCategory,
  CatalogueCategoryProperty,
  CatalogueItem,
  Item,
  ItemPatch,
  ItemPost,
  UsageStatus,
} from '../api/api.types';
import { useGetCatalogueCategory } from '../api/catalogueCategories';
import { usePatchItem, usePostItem, usePostItems } from '../api/items';
import { useGetRules } from '../api/rules';
import {
  useGetSystem,
  useGetSystems,
  useGetSystemsBreadcrumbs,
} from '../api/systems';
import { useGetUsageStatuses } from '../api/usageStatuses';
import {
  ItemDetailsStep,
  ItemDetailsStepPost,
  PropertiesStep,
} from '../app.types';
import {
  convertToPropertyPost,
  convertToPropertyValueList,
} from '../catalogue/items/catalogueItemsDialog.component';
import {
  FLEX_CONTAINER_PROPS,
  FORM_WITH_STEPPER_DIALOG_PROPS,
} from '../common/consts';
import MRTTopTableAlert from '../common/mrtTopTableAlert.component';
import {
  DATE_PICKER_MAX_DATE,
  DATE_PICKER_MIN_DATE,
  DATE_TODAY,
  INVALID_DATE_FORMAT_MESSAGE,
  ItemDetailsStepSchema,
  PropertiesStepSchema,
  RequestType,
} from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';
import handleTransferState from '../handleTransferState';
import { useAppSelector } from '../state/hook';
import { selectSettings } from '../state/slices/configSlice';
import { SystemsTableView } from '../systems/systemsTableView.component';
import Breadcrumbs from '../view/breadcrumbs.component';

function toItemDetailsStep(
  item: Item | undefined,
  catalogueCategory: CatalogueCategory | undefined,
  serialNumberPrefillEnabled: boolean
): ItemDetailsStep {
  if (!item) {
    return {
      purchase_order_number: '',
      is_defective: 'false',
      usage_status_id: '',
      warranty_end_date: null,
      asset_number: '',
      serial_number: {
        serial_number:
          (serialNumberPrefillEnabled && catalogueCategory?.name + ' %s') || '',
        starting_value: '',
        quantity: '',
      },
      delivered_date: null,
      notes: '',
    };
  }

  return {
    purchase_order_number: item.purchase_order_number ?? '',
    is_defective: String(item.is_defective),
    usage_status_id: item.usage_status_id,
    warranty_end_date: item.warranty_end_date,
    asset_number: item.asset_number ?? '',
    serial_number: {
      serial_number: item.serial_number ?? '',
      starting_value: '',
      quantity: '',
    },
    delivered_date: item.delivered_date,
    notes: item.notes ?? '',
  };
}

function convertToItemDetailsStepPost(
  item: ItemDetailsStep
): ItemDetailsStepPost {
  return {
    purchase_order_number: item.purchase_order_number ?? null,
    is_defective: item.is_defective ? true : false,
    usage_status_id: item.usage_status_id,
    warranty_end_date: item.warranty_end_date
      ? new Date(item.warranty_end_date).toISOString()
      : null,
    asset_number: item.asset_number ?? null,
    serial_number: item.serial_number.serial_number ?? null,
    delivered_date: item.delivered_date
      ? new Date(item.delivered_date).toISOString()
      : null,
    notes: item.notes ?? null,
  };
}

const dateErrorMessageHandler = (props: {
  minDate: Date;
  maxDate: Date;
  error: DateValidationError;
}): string => {
  const { minDate, maxDate, error } = props;
  switch (error) {
    case 'invalidDate':
      return INVALID_DATE_FORMAT_MESSAGE;
    case 'minDate':
      return `Date cannot be earlier than ${minDate.toLocaleDateString()}.`;
    case 'maxDate':
      return `Date cannot be later than ${maxDate.toLocaleDateString()}.`;
    default:
      return '';
  }
};

export interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  requestType: RequestType;
  duplicate?: boolean;
  catalogueItem?: CatalogueItem;
  catalogueCategory?: CatalogueCategory;
  selectedItem?: Item;
  isAdminMode: boolean;
}

function ItemDialog(props: ItemDialogProps) {
  const {
    open,
    onClose,
    requestType,
    duplicate,
    catalogueItem,
    selectedItem,
    isAdminMode,
  } = props;

  const {
    settings: { serialNumberPrefillEnabled },
  } = useAppSelector(selectSettings);

  // Fetch the catalogue category if it hasn't already been given (as required to know what properties are available)
  const { data: fetchedCatalogueCategory } = useGetCatalogueCategory(
    props.catalogueCategory ? undefined : catalogueItem?.catalogue_category_id
  );
  const catalogueCategory = React.useMemo(
    () => props.catalogueCategory || fetchedCatalogueCategory,
    [fetchedCatalogueCategory, props.catalogueCategory]
  );

  const parentCatalogueItemPropertiesInfo = React.useMemo(
    () => catalogueCategory?.properties ?? [],
    [catalogueCategory]
  );

  const [showAdvancedSerialNumberOptions, setShowAdvancedSerialNumberOptions] =
    React.useState(false);

  const { data: usageStatuses } = useGetUsageStatuses();

  const { mutateAsync: addItem, isPending: isAddItemPending } = usePostItem();
  const { mutateAsync: postItems, isPending: isAddItemsPending } =
    usePostItems();
  const { mutateAsync: editItem, isPending: isEditItemPending } =
    usePatchItem();

  const handleClose = React.useCallback(() => {
    onClose();
    setActiveStep(0);
  }, [onClose]);

  // Move to systems
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    selectedItem?.system_id ?? null
  );

  // Rules
  const { data: dstSystem } = useGetSystem(parentSystemId);
  const { data: srcSystem } = useGetSystem(selectedItem?.system_id);
  const srcSystemTypeId =
    requestType === 'post' ? 'null' : (srcSystem?.type_id ?? 'null');

  const dstSystemTypeId = dstSystem?.type_id ?? 'null';
  const { data: tableRules } = useGetRules(srcSystemTypeId);

  // This should be a list of 1 rule
  const { data: selectedRules, isLoading: isSelectedRulesLoading } =
    useGetRules(srcSystemTypeId, dstSystemTypeId);

  const isDstSystemTypeSameAsSrcSystemType = React.useMemo(() => {
    if (!dstSystem || !srcSystem) return false;
    return dstSystemTypeId === srcSystemTypeId;
  }, [dstSystemTypeId, srcSystemTypeId, dstSystem, srcSystem]);

  const [parentSystemIdError, setParentSystemIdError] = React.useState<
    string | undefined
  >(undefined);

  const { data: systemsData, isLoading: systemsDataLoading } = useGetSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: parentSystemBreadcrumbs } =
    useGetSystemsBreadcrumbs(parentSystemId);

  const ItemDetailsStepFormMethods = useForm<ItemDetailsStep>({
    resolver: zodResolver(
      ItemDetailsStepSchema(requestType, isAdminMode && parentSystemId !== null)
    ),
    defaultValues: toItemDetailsStep(
      selectedItem,
      catalogueCategory,
      serialNumberPrefillEnabled
    ),
  });

  const {
    handleSubmit: handleSubmitDetailsStep,
    register: registerDetailsStep,
    formState: { errors: errorsDetailsStep },
    control: controlDetailsStep,
    clearErrors: clearErrorsDetailsStep,
    reset: resetDetailsStep,
    watch: watchDetailsStep,
    setError: setErrorDetailsStep,
  } = ItemDetailsStepFormMethods;

  const itemPropertiesStepFormMethods = useForm<PropertiesStep>({
    resolver: zodResolver(PropertiesStepSchema),
    defaultValues: {
      properties: convertToPropertyValueList(
        catalogueCategory,
        selectedItem?.properties
      ),
    },
  });

  const {
    handleSubmit: handleSubmitPropertiesStep,
    register: registerPropertiesStep,
    formState: { errors: errorsPropertiesStep },
    control: controlPropertiesStep,
    clearErrors: clearErrorsPropertiesStep,
    reset: resetPropertiesStep,
    watch: watchPropertiesStep,
    setError: setErrorPropertiesStep,
  } = itemPropertiesStepFormMethods;

  const itemDetails = watchDetailsStep();
  const serialNumberAdvancedOptions = itemDetails.serial_number;
  // Load the values for editing.
  React.useEffect(() => {
    resetDetailsStep(
      toItemDetailsStep(
        selectedItem,
        catalogueCategory,
        serialNumberPrefillEnabled
      )
    );
    resetPropertiesStep({
      properties: convertToPropertyValueList(
        catalogueCategory,
        requestType === 'post' && !duplicate
          ? catalogueItem?.properties
          : selectedItem?.properties
      ),
    });
  }, [
    catalogueCategory,
    catalogueItem?.properties,
    duplicate,
    requestType,
    resetDetailsStep,
    resetPropertiesStep,
    selectedItem,
    selectedItem?.properties,
    serialNumberPrefillEnabled,
  ]);

  // Set usage status based on the selected Rule
  React.useEffect(() => {
    if (selectedRules && selectedRules.length > 0) {
      const usageStatus = usageStatuses?.find(
        (status) => status.id === selectedRules[0].dst_usage_status?.id
      );
      if (usageStatus && srcSystemTypeId !== dstSystemTypeId) {
        ItemDetailsStepFormMethods.setValue('usage_status_id', usageStatus.id, {
          shouldValidate: true,
        });
      }
    } else if (isAdminMode) {
      ItemDetailsStepFormMethods.setValue(
        'usage_status_id',
        selectedItem?.usage_status_id ?? '', // sets to current usage status if editing or duplicating item
        {
          shouldValidate: false, // so error does not instantly appear
        }
      );
    }
  }, [
    selectedRules,
    usageStatuses,
    ItemDetailsStepFormMethods,
    srcSystemTypeId,
    dstSystemTypeId,
    isAdminMode,
    selectedItem?.usage_status_id,
  ]);

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    const subscription = watchDetailsStep(() =>
      clearErrorsPropertiesStep('root.formError')
    );
    return () => subscription.unsubscribe();
  }, [clearErrorsPropertiesStep, watchDetailsStep]);

  React.useEffect(() => {
    const subscription = watchPropertiesStep(() =>
      clearErrorsPropertiesStep('root.formError')
    );
    return () => subscription.unsubscribe();
  }, [clearErrorsPropertiesStep, watchPropertiesStep]);

  React.useEffect(() => {
    if (parentSystemId !== selectedItem?.system_id) {
      clearErrorsPropertiesStep('root.formError');

      // Clears usage status error if admin user as they may be selecting
      // a system with no rule, and so no usage status. Therefore we want to
      // ensure the error is always cleared to behave as other dialogs.
      if (isAdminMode) {
        clearErrorsDetailsStep(['usage_status_id']);
      }
    }
  }, [
    clearErrorsDetailsStep,
    clearErrorsPropertiesStep,
    isAdminMode,
    parentSystemId,
    selectedItem?.system_id,
  ]);

  React.useEffect(() => {
    const neitherProvided =
      !serialNumberAdvancedOptions.quantity &&
      !serialNumberAdvancedOptions.starting_value;
    const bothProvided =
      serialNumberAdvancedOptions.quantity ||
      serialNumberAdvancedOptions.starting_value;

    if (neitherProvided || bothProvided) {
      clearErrorsDetailsStep([
        'serial_number.quantity',
        'serial_number.serial_number',
        'serial_number.starting_value',
      ]);
    }
  }, [
    clearErrorsDetailsStep,
    serialNumberAdvancedOptions.quantity,
    serialNumberAdvancedOptions.starting_value,
  ]);

  React.useEffect(() => {
    if (parentSystemId) {
      setParentSystemIdError(undefined);
    }
  }, [parentSystemId]);

  const handleAddItem = React.useCallback(
    (data: ItemPost, quantity?: number, starting_value?: number) => {
      const item: ItemPost = {
        ...data,
      };

      if (typeof quantity === 'number' && typeof starting_value === 'number') {
        postItems({
          quantity: quantity,
          starting_value: starting_value,
          item: item,
        }).then((response) => {
          handleTransferState(response);
          handleClose();
        });
      } else {
        addItem(item)
          .then(() => handleClose())
          .catch((error: AxiosError) => {
            handleIMS_APIError(error);
          });
      }
    },
    [postItems, handleClose, addItem]
  );

  const handleEditItem = React.useCallback(
    (data: ItemPost) => {
      if (selectedItem) {
        const isPurchaseOrderNumberUpdated =
          data.purchase_order_number !== selectedItem.purchase_order_number;

        const isIsDefectiveUpdated =
          data.is_defective !== selectedItem.is_defective;

        const isUsageStatusUpdated =
          data.usage_status_id !== selectedItem.usage_status_id;

        const isWarrantyEndDateUpdated =
          data.warranty_end_date !== selectedItem.warranty_end_date;

        const isAssetNumberUpdated =
          data.asset_number !== selectedItem.asset_number;

        const isSerialNumberUpdated =
          data.serial_number !== selectedItem.serial_number;

        const isDeliveredDateUpdated =
          data.delivered_date !== selectedItem.delivered_date;

        const isNotesUpdated = data.notes !== selectedItem.notes;

        const isItemPropertiesUpdated =
          JSON.stringify(data.properties) !==
          JSON.stringify(
            selectedItem.properties.map(({ unit, name, ...rest }) => ({
              id: rest.id,
              value: rest.value,
            }))
          );

        const isSystemIdUpdated = data.system_id !== selectedItem.system_id;

        const item: ItemPatch = {};

        if (isSerialNumberUpdated) item.serial_number = data.serial_number;
        if (isPurchaseOrderNumberUpdated)
          item.purchase_order_number = data.purchase_order_number;
        if (isIsDefectiveUpdated) item.is_defective = data.is_defective;
        if (isUsageStatusUpdated) item.usage_status_id = data.usage_status_id;
        if (isWarrantyEndDateUpdated)
          item.warranty_end_date = data.warranty_end_date;
        if (isAssetNumberUpdated) item.asset_number = data.asset_number;
        if (isDeliveredDateUpdated) item.delivered_date = data.delivered_date;
        if (isNotesUpdated) item.notes = data.notes;
        if (isSystemIdUpdated) item.system_id = data.system_id;
        if (isItemPropertiesUpdated) item.properties = data.properties;

        if (
          selectedItem.id &&
          (isSerialNumberUpdated ||
            isPurchaseOrderNumberUpdated ||
            isIsDefectiveUpdated ||
            isUsageStatusUpdated ||
            isWarrantyEndDateUpdated ||
            isAssetNumberUpdated ||
            isSerialNumberUpdated ||
            isDeliveredDateUpdated ||
            isNotesUpdated ||
            isItemPropertiesUpdated ||
            isSystemIdUpdated)
        ) {
          editItem({ id: selectedItem.id, item: item })
            .then(() => handleClose())
            .catch((error: AxiosError) => {
              handleIMS_APIError(error);
            });
        } else {
          setErrorPropertiesStep('root.formError', {
            message:
              "There have been no changes made. Please change a field's value or press Cancel to exit.",
          });
        }
      }
    },
    [selectedItem, editItem, handleClose, setErrorPropertiesStep]
  );

  // Stepper
  const STEPS = [
    'Place into a system',
    (requestType === 'patch' ? 'Edit' : 'Add') + ' item details',
    (requestType === 'patch' ? 'Edit' : 'Add') + ' item properties',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handlePropertiesStep = React.useCallback(
    async (
      event: React.SyntheticEvent
    ): Promise<{
      hasErrors: boolean;
      detailsStepData: ItemDetailsStep | undefined;
      propertiesStepData: PropertiesStep | undefined;
    }> => {
      let hasErrors: boolean = false;
      let detailsStepData: ItemDetailsStep | undefined;
      let propertiesStepData: PropertiesStep | undefined;

      // Handle the submission for Step 1
      await handleSubmitDetailsStep((validData) => {
        detailsStepData = validData; // Assign data if valid
      })(event);

      await handleSubmitPropertiesStep((validData) => {
        propertiesStepData = validData; // Assign data if valid
      })(event);

      // Ensure both data objects are set before proceeding
      if (!detailsStepData || !propertiesStepData) {
        hasErrors = true;
      }
      return { hasErrors, detailsStepData, propertiesStepData };
    },
    [handleSubmitDetailsStep, handleSubmitPropertiesStep]
  );

  const handleNext = React.useCallback(
    async (event: React.SyntheticEvent, step: number) => {
      switch (step) {
        case 0: {
          if (!parentSystemId) {
            setParentSystemIdError('Please select a parent system');
            return;
          } else if (
            !isDstSystemTypeSameAsSrcSystemType &&
            (!selectedRules || selectedRules.length === 0) &&
            !isAdminMode
          ) {
            const allowedDstSystemTypes =
              tableRules?.map((rule) => rule.dst_system_type?.value) || [];
            setParentSystemIdError(
              `Please select a valid parent system. Allowed types: ${allowedDstSystemTypes.join(', ')}.`
            );
            return;
          }
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          break;
        }
        case 1:
          return handleSubmitDetailsStep(() => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          })(event);

        default:
      }
    },
    [
      selectedRules,
      handleSubmitDetailsStep,
      isDstSystemTypeSameAsSrcSystemType,
      parentSystemId,
      tableRules,
      isAdminMode,
    ]
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = React.useCallback(
    async (event: React.SyntheticEvent) => {
      let hasErrors = false;
      const {
        detailsStepData,
        propertiesStepData,
        hasErrors: hasErrorProperties,
      } = await handlePropertiesStep(event);

      if (!parentSystemId) {
        setParentSystemIdError('Please select a parent system');
        hasErrors = true;
      } else if (
        !isDstSystemTypeSameAsSrcSystemType &&
        (!selectedRules || selectedRules.length === 0) &&
        !isAdminMode
      ) {
        const allowedDstSystemTypes =
          tableRules?.map((rule) => rule.dst_system_type?.value) || [];
        setParentSystemIdError(
          `Please select a valid parent system. Allowed types: ${allowedDstSystemTypes.join(', ')}.`
        );
        hasErrors = true;
      }
      if (hasErrorProperties) {
        hasErrors = true;
      }
      if (hasErrors) return;

      if (detailsStepData && propertiesStepData && parentSystemId) {
        const data: ItemPost = {
          ...convertToItemDetailsStepPost(detailsStepData),
          properties: convertToPropertyPost(propertiesStepData?.properties),
          catalogue_item_id: catalogueItem?.id ?? '',
          system_id: parentSystemId ?? '',
        };

        const startingValue = !isNaN(
          Number(detailsStepData.serial_number.starting_value)
        )
          ? Number(detailsStepData.serial_number.starting_value)
          : undefined;

        const quantity = !isNaN(Number(detailsStepData.serial_number.quantity))
          ? Number(detailsStepData.serial_number.quantity)
          : undefined;

        if (requestType === 'post' || duplicate) {
          handleAddItem(data, quantity, startingValue);
        } else {
          handleEditItem(data);
        }
      }
    },
    [
      selectedRules,
      catalogueItem?.id,
      duplicate,
      handleAddItem,
      handleEditItem,
      handlePropertiesStep,
      isDstSystemTypeSameAsSrcSystemType,
      parentSystemId,
      requestType,
      tableRules,
      isAdminMode,
    ]
  );

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return !!parentSystemIdError;
        case 1:
          return Object.values(errorsDetailsStep).length !== 0;
        case 2:
          return (
            Object.keys(errorsPropertiesStep).filter((val) => val !== 'root')
              .length !== 0
          );
      }
    },
    [errorsDetailsStep, errorsPropertiesStep, parentSystemIdError]
  );

  const shouldShowMissingRuleWarning =
    !selectedRules?.[0] && srcSystemTypeId !== dstSystemTypeId;

  const dstUsageStatus =
    selectedRules?.[0]?.dst_usage_status?.value ?? selectedItem?.usage_status;

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack sx={{ p: 1, height: '100%' }}>
            <Breadcrumbs
              breadcrumbsInfo={parentSystemBreadcrumbs}
              onChangeNode={setParentSystemId}
              onChangeNavigateHome={() => {
                setParentSystemId(null);
              }}
              homeLocation="Systems"
            />
            <Box sx={{ p: 1, ...FLEX_CONTAINER_PROPS, minHeight: '500px' }}>
              {parentSystemId &&
                !isSelectedRulesLoading &&
                !systemsDataLoading && (
                  <MRTTopTableAlert
                    title={
                      shouldShowMissingRuleWarning
                        ? `WARNING: No rule exists for ${requestType === 'post' ? `creating a new item within this system type` : 'moving this item between these system types'} `
                        : requestType === 'post'
                          ? 'Item Creation Rule Applied'
                          : 'Item Moving Rule Applied'
                    }
                    showInfoTooltip={!shouldShowMissingRuleWarning}
                    infoTooltipTitle={
                      requestType === 'post'
                        ? `The new item's usage status will be set to ${dstUsageStatus}, according to the rules`
                        : selectedItem?.system_id === parentSystemId
                          ? `The item's usage status will remain the same, according to the rules`
                          : `The item's usage status will be updated to ${dstUsageStatus}, according to the rules`
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
                onChangeParentId={setParentSystemId}
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
          <Grid container spacing={1.5} size={12}>
            <Grid
              container
              size={12}
              sx={{
                margin: 0,
              }}
            >
              <Grid size={12}>
                <TextField
                  id="item-serial-number-input"
                  label="Serial number"
                  size="small"
                  {...registerDetailsStep('serial_number.serial_number')}
                  fullWidth
                  error={!!errorsDetailsStep.serial_number?.serial_number}
                  helperText={
                    errorsDetailsStep.serial_number?.serial_number?.message ||
                    (itemDetails.serial_number.quantity &&
                      itemDetails.serial_number.starting_value &&
                      itemDetails.serial_number.serial_number &&
                      itemDetails.serial_number.serial_number
                        .trim()
                        .includes('%s') &&
                      `e.g. ${itemDetails.serial_number.serial_number?.replace(
                        '%s',
                        itemDetails.serial_number.starting_value
                      )}`)
                  }
                />
              </Grid>

              {requestType !== 'patch' && (
                <>
                  <Grid
                    onClick={() =>
                      setShowAdvancedSerialNumberOptions(
                        !showAdvancedSerialNumberOptions
                      )
                    }
                  >
                    <Box sx={{ alignItems: 'center', display: 'flex' }}>
                      <Tooltip
                        title={
                          <Box>
                            <Typography>
                              When adding multiple items, %s marks where the
                              generated number will appear. This number is based
                              on the Starting Value and Quantity.
                            </Typography>
                            <Typography sx={{ mt: 2 }}>Example: </Typography>
                            <Typography>
                              Serial number: item %s. Quantity: 2. Starting
                              value: 1
                            </Typography>
                            <Typography>
                              Resulting serial numbers: item 1, item 2
                            </Typography>
                          </Box>
                        }
                        aria-label="Serial Number Advanced Options Tooltip"
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </Tooltip>
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 1,
                          mb: 0,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {showAdvancedSerialNumberOptions
                          ? 'Close advanced options'
                          : 'Show advanced options'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid container size={12}>
                    <Collapse
                      sx={{ width: '100%' }}
                      in={showAdvancedSerialNumberOptions}
                    >
                      <Grid
                        container
                        spacing={1.5}
                        size={12}
                        sx={{
                          margin: 0,
                          mt: 0.25,
                        }}
                      >
                        <Grid
                          size={6}
                          sx={{
                            pl: 0,
                          }}
                        >
                          <TextField
                            id="item-quantity-input"
                            label="Quantity"
                            size="small"
                            fullWidth
                            {...registerDetailsStep('serial_number.quantity')}
                            error={!!errorsDetailsStep.serial_number?.quantity}
                            helperText={
                              errorsDetailsStep.serial_number?.quantity?.message
                            }
                          />
                        </Grid>
                        <Grid
                          size={6}
                          sx={{
                            pr: 0,
                          }}
                        >
                          <TextField
                            id="item-starting-value-input"
                            label="Starting value"
                            size="small"
                            fullWidth
                            {...registerDetailsStep(
                              'serial_number.starting_value'
                            )}
                            error={
                              !!errorsDetailsStep.serial_number?.starting_value
                            }
                            helperText={
                              errorsDetailsStep.serial_number?.starting_value
                                ?.message
                            }
                          />
                        </Grid>
                      </Grid>
                    </Collapse>
                  </Grid>
                </>
              )}
            </Grid>
            <Grid size={12}>
              <TextField
                id="item-asset-input"
                label="Asset number"
                size="small"
                {...registerDetailsStep('asset_number')}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <TextField
                id="item-purchase-order-input"
                label="Purchase order number"
                size="small"
                {...registerDetailsStep('purchase_order_number')}
                fullWidth
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="warranty_end_date"
                control={controlDetailsStep}
                render={({ field }) => (
                  <DatePicker
                    label="Warranty end date"
                    {...field}
                    value={
                      field.value && !isNaN(Date.parse(field.value))
                        ? new Date(field.value)
                        : null
                    }
                    maxDate={DATE_PICKER_MAX_DATE}
                    minDate={DATE_PICKER_MIN_DATE}
                    onChange={(value) => {
                      if (value && !isNaN(value.getTime())) {
                        // If the date is valid, convert it to ISO string
                        field.onChange(value.toISOString());
                      } else {
                        // If invalid, clear the value
                        field.onChange('');
                      }
                    }}
                    slotProps={{
                      actionBar: { actions: ['clear'] },
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!errorsDetailsStep.warranty_end_date,
                        helperText:
                          errorsDetailsStep.warranty_end_date?.message,
                      },
                      field: { clearable: true },
                      clearButton: { size: 'small' },
                    }}
                    onError={(error) => {
                      const errorMessage = dateErrorMessageHandler({
                        error,
                        minDate: DATE_PICKER_MIN_DATE,
                        maxDate: DATE_PICKER_MAX_DATE,
                      });
                      if (errorMessage !== '') {
                        setErrorDetailsStep('warranty_end_date', {
                          message: errorMessage,
                        });
                      } else {
                        clearErrorsDetailsStep('warranty_end_date');
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="delivered_date"
                control={controlDetailsStep}
                render={({ field }) => (
                  <DatePicker
                    label="Delivered date"
                    {...field}
                    value={
                      field.value && !isNaN(Date.parse(field.value))
                        ? new Date(field.value)
                        : null
                    }
                    maxDate={DATE_TODAY}
                    minDate={DATE_PICKER_MIN_DATE}
                    onChange={(value) => {
                      if (value && !isNaN(value.getTime())) {
                        // If the date is valid, convert it to ISO string
                        field.onChange(value.toISOString());
                      }
                    }}
                    slotProps={{
                      actionBar: { actions: ['clear'] },
                      textField: (props) => ({
                        ...props,
                        size: 'small',
                        fullWidth: true,
                        error: !!errorsDetailsStep.delivered_date,
                        helperText: errorsDetailsStep.delivered_date?.message,
                      }),
                      field: { clearable: true },
                      clearButton: { size: 'small' },
                    }}
                    onError={(error) => {
                      const errorMessage = dateErrorMessageHandler({
                        error,
                        minDate: DATE_PICKER_MIN_DATE,
                        maxDate: DATE_TODAY,
                      });
                      if (errorMessage !== '') {
                        setErrorDetailsStep('delivered_date', {
                          message: errorMessage,
                        });
                      } else {
                        clearErrorsDetailsStep('delivered_date');
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                control={controlDetailsStep}
                name="is_defective"
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    disableClearable={true}
                    id="item-is-defective-input"
                    value={value === 'true' ? 'Yes' : 'No'}
                    size="small"
                    onChange={(_event, value) =>
                      onChange(value === 'Yes' ? 'true' : 'false')
                    }
                    sx={{ alignItems: 'center' }}
                    fullWidth
                    options={['Yes', 'No']}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required={true}
                        label="Is defective"
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                control={controlDetailsStep}
                name="usage_status_id"
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    disableClearable={value != null}
                    disabled={!isAdminMode}
                    id="item-usage-status-input"
                    value={
                      usageStatuses?.find(
                        (usageStatus) => usageStatus.id == value
                      ) ?? null
                    }
                    size="small"
                    onChange={(_event, usageStatus: UsageStatus | null) => {
                      onChange(usageStatus?.id ?? null);
                    }}
                    sx={{ alignItems: 'center' }}
                    fullWidth
                    options={usageStatuses ?? []}
                    isOptionEqualToValue={(option, value) =>
                      option.id == value.id
                    }
                    getOptionLabel={(option) => option.value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required={true}
                        disabled={!isAdminMode}
                        label="Usage status"
                        error={!!errorsDetailsStep.usage_status_id}
                        helperText={errorsDetailsStep.usage_status_id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid container sx={{ display: 'flex' }} size={12}>
              <Grid size={11}>
                <TextField
                  id="item-notes-input"
                  label="Notes"
                  size="small"
                  multiline
                  minRows={10}
                  {...registerDetailsStep('notes')}
                  fullWidth
                />
              </Grid>
              <Grid size={1}>
                <Tooltip
                  sx={{ alignItems: 'center' }}
                  title={
                    <div>
                      <Typography>Catalogue item note:</Typography>
                      <Typography
                        sx={{
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {catalogueItem?.notes ?? 'None'}
                      </Typography>
                    </div>
                  }
                  placement="right"
                  enterTouchDelay={0}
                  aria-label={`Catalogue item note: ${catalogueItem?.notes ?? 'None'}`}
                >
                  <IconButton size="small">
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container size={12}>
            {parentCatalogueItemPropertiesInfo.length >= 1 ? (
              <Grid
                container
                size={12}
                spacing={1.5}
                sx={{
                  margin: 0,
                }}
              >
                {parentCatalogueItemPropertiesInfo.map(
                  (property: CatalogueCategoryProperty, index: number) => (
                    <Grid container spacing={1.5} key={index} size={12}>
                      <Grid size={11} sx={{ display: 'flex' }}>
                        {property.type === 'boolean' ? (
                          <Controller
                            control={controlPropertiesStep}
                            name={`properties.${index}.value.value`}
                            render={({
                              field: { value: propertyValue, onChange },
                            }) => (
                              <Autocomplete
                                disableClearable={property.mandatory ?? false}
                                id={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                value={
                                  propertyValue
                                    ? propertyValue.charAt(0).toUpperCase() +
                                      propertyValue.slice(1)
                                    : ''
                                }
                                size="small"
                                onChange={(_event, value) => {
                                  onChange(value);
                                }}
                                sx={{ alignItems: 'center' }}
                                fullWidth
                                options={['True', 'False']}
                                isOptionEqualToValue={(option, value) =>
                                  option.toLowerCase() == value.toLowerCase() ||
                                  value == ''
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    required={property.mandatory ?? false}
                                    label={property.name}
                                    error={
                                      !!errorsPropertiesStep?.properties?.[
                                        index
                                      ]?.value?.value
                                    }
                                    helperText={
                                      errorsPropertiesStep?.properties?.[index]
                                        ?.value?.value?.message as string
                                    }
                                  />
                                )}
                              />
                            )}
                          />
                        ) : property.allowed_values ? (
                          <Controller
                            control={controlPropertiesStep}
                            name={`properties.${index}.value.value`}
                            render={({
                              field: { value: propertyValue, onChange },
                            }) => (
                              <Autocomplete
                                disableClearable={property.mandatory ?? false}
                                id={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                value={(propertyValue as string) ?? ''}
                                size="small"
                                onChange={(_event, value) =>
                                  onChange(value !== null ? String(value) : '')
                                }
                                sx={{ alignItems: 'center' }}
                                fullWidth
                                options={property.allowed_values?.values ?? []}
                                getOptionLabel={(option) => option.toString()}
                                isOptionEqualToValue={(option, value) =>
                                  option.toString() === value.toString() ||
                                  value === ''
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    required={property.mandatory ?? false}
                                    label={`${property.name} ${
                                      property.unit ? `(${property.unit})` : ''
                                    }`}
                                    error={
                                      !!errorsPropertiesStep?.properties?.[
                                        index
                                      ]?.value?.value
                                    }
                                    helperText={
                                      errorsPropertiesStep?.properties?.[index]
                                        ?.value?.value?.message as string
                                    }
                                  />
                                )}
                              />
                            )}
                          />
                        ) : (
                          <TextField
                            id={`catalogue-item-${property.name}-input`}
                            label={`${property.name} ${
                              property.unit ? `(${property.unit})` : ''
                            }`}
                            size="small"
                            {...registerPropertiesStep(
                              `properties.${index}.value.value`
                            )}
                            required={property.mandatory ?? false}
                            fullWidth
                            error={
                              !!errorsPropertiesStep?.properties?.[index]?.value
                                ?.value
                            }
                            helperText={
                              errorsPropertiesStep?.properties?.[index]?.value
                                ?.value?.message as string
                            }
                          />
                        )}
                      </Grid>
                      <Grid
                        size={1}
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Tooltip
                          aria-label={`${property.name} details`}
                          title={
                            <div>
                              <Typography>Name: {property.name}</Typography>
                              <Typography>
                                Unit: {property.unit ?? 'None'}
                              </Typography>
                              <Typography>
                                Type:{' '}
                                {property.type === 'string'
                                  ? 'text'
                                  : property.type}
                              </Typography>
                            </div>
                          }
                          placement="right"
                          enterTouchDelay={0}
                        >
                          <IconButton size="small">
                            <InfoOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  )
                )}
              </Grid>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 3,
                }}
              >
                <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  No item properties
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                  Please navigate to the next step to select a system
                </Typography>
              </Box>
            )}
          </Grid>
        );
    }
  };

  return (
    <Dialog open={open} {...FORM_WITH_STEPPER_DIALOG_PROPS}>
      <DialogTitle
        sx={{ display: 'inline-flex', alignItems: 'center', paddingBottom: 0 }}
      >
        {`${requestType === 'patch' ? 'Edit' : 'Add'} Item${isAdminMode ? ' as Admin' : ''}`}

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

      <DialogContent sx={{ height: `calc(100% - 56px)` }}>
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
                  {index === 0 && parentSystemIdError}
                  {index === 2 && 'Invalid item properties'}
                  {index === 1 && 'Invalid item details'}
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

        <Box
          sx={{
            marginTop: 2,
            height: 'inherit',
          }}
        >
          {renderStepContent(activeStep)}
        </Box>
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
              isAddItemsPending ||
              isAddItemPending ||
              isEditItemPending ||
              Object.keys(errorsPropertiesStep).filter((val) => val !== 'root')
                .length !== 0 ||
              Object.values(errorsDetailsStep).length !== 0 ||
              !!parentSystemIdError
            }
            onClick={handleFinish}
            sx={{ mr: 3 }}
            endIcon={
              isAddItemsPending || isAddItemPending || isEditItemPending ? (
                <CircularProgress size={16} />
              ) : null
            }
          >
            Finish
          </Button>
        ) : (
          <Button
            disabled={isStepFailed(activeStep)}
            onClick={(event) => handleNext(event, activeStep)}
            sx={{ mr: 3 }}
          >
            Next
          </Button>
        )}
      </DialogActions>
      {errorsPropertiesStep.root?.formError && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ marginBottom: 2, textAlign: 'center' }} error>
            {errorsPropertiesStep.root?.formError.message}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
}

export default ItemDialog;
