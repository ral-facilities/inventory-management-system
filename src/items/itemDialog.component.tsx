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
  Grid,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
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
import { usePatchItem, usePostItem, usePostItems } from '../api/items';
import { useGetSystems, useGetSystemsBreadcrumbs } from '../api/systems';
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
  ItemDetailsStepSchema,
  PropertiesStepSchema,
  RequestType,
} from '../form.schemas';
import handleIMS_APIError from '../handleIMS_APIError';
import handleTransferState from '../handleTransferState';
import { SystemsTableView } from '../systems/systemsTableView.component';
import {
  datePickerMaxDate,
  datePickerMinDate,
  invalidDateFormatMessage,
  trimStringValues,
} from '../utils';
import Breadcrumbs from '../view/breadcrumbs.component';

function toItemDetailsStep(item: Item | undefined): ItemDetailsStep {
  if (!item) {
    return {
      purchase_order_number: '',
      is_defective: 'false',
      usage_status_id: '',
      warranty_end_date: null,
      asset_number: '',
      serial_number: {
        serial_number: '',
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
      return invalidDateFormatMessage;
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
}

function ItemDialog(props: ItemDialogProps) {
  const {
    open,
    onClose,
    requestType,
    duplicate,
    catalogueItem,
    catalogueCategory,
    selectedItem,
  } = props;
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

  //move to systems
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    selectedItem?.system_id ?? null
  );

  const { data: systemsData, isLoading: systemsDataLoading } = useGetSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: parentSystemBreadcrumbs } =
    useGetSystemsBreadcrumbs(parentSystemId);

  const ItemDetailsStepFormMethods = useForm<ItemDetailsStep>({
    resolver: zodResolver(ItemDetailsStepSchema(requestType)),
    defaultValues: toItemDetailsStep(selectedItem),
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
    resetDetailsStep(toItemDetailsStep(selectedItem));
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
    if (parentSystemId !== selectedItem?.system_id)
      clearErrorsPropertiesStep('root.formError');
  }, [clearErrorsPropertiesStep, parentSystemId, selectedItem?.system_id]);

  React.useEffect(() => {
    if (
      !serialNumberAdvancedOptions.quantity &&
      !serialNumberAdvancedOptions.starting_value
    ) {
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

        const isCatalogueItemPropertiesUpdated =
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
        if (isCatalogueItemPropertiesUpdated) item.properties = data.properties;

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
            isCatalogueItemPropertiesUpdated ||
            isSystemIdUpdated)
        ) {
          editItem({ id: selectedItem.id, item: trimStringValues(item) })
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
    (requestType === 'patch' ? 'Edit' : 'Add') + ' item details',
    (requestType === 'patch' ? 'Edit' : 'Add') + ' item properties',
    'Place into a system',
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
        case 0:
          return handleSubmitDetailsStep(() => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          })(event);

        case 1: {
          const { hasErrors } = await handlePropertiesStep(event);
          if (hasErrors) return;
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          break;
        }
        default:
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
    [handlePropertiesStep, handleSubmitDetailsStep]
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = React.useCallback(
    async (event: React.SyntheticEvent) => {
      const { detailsStepData, propertiesStepData } =
        await handlePropertiesStep(event);

      if (detailsStepData && propertiesStepData) {
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
      catalogueItem?.id,
      duplicate,
      handleAddItem,
      handleEditItem,
      handlePropertiesStep,
      parentSystemId,
      requestType,
    ]
  );

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return Object.values(errorsDetailsStep).length !== 0;
        case 1:
          return (
            Object.keys(errorsPropertiesStep).filter((val) => val !== 'root')
              .length !== 0
          );
        case 2:
          return !parentSystemId;
      }
    },
    [errorsDetailsStep, errorsPropertiesStep, parentSystemId]
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            <Grid item container xs={12}>
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

              {requestType !== 'patch' && (
                <>
                  <Grid
                    item
                    onClick={() =>
                      setShowAdvancedSerialNumberOptions(
                        !showAdvancedSerialNumberOptions
                      )
                    }
                  >
                    <Typography
                      ml={1}
                      mb={0}
                      variant="caption"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {showAdvancedSerialNumberOptions
                        ? 'Close advanced options'
                        : 'Show advanced options'}
                    </Typography>
                  </Grid>
                  <Grid container item xs={12}>
                    <Collapse
                      sx={{ width: '100%' }}
                      in={showAdvancedSerialNumberOptions}
                    >
                      <Grid item container mt={0.25} spacing={1.5} xs={12}>
                        <Grid item xs={6}>
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
                        <Grid item xs={6}>
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
            <Grid item xs={12}>
              <TextField
                id="item-asset-input"
                label="Asset number"
                size="small"
                {...registerDetailsStep('asset_number')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="item-purchase-order-input"
                label="Purchase order number"
                size="small"
                {...registerDetailsStep('purchase_order_number')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
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
                    maxDate={datePickerMaxDate}
                    minDate={datePickerMinDate}
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
                        minDate: datePickerMinDate,
                        maxDate: datePickerMaxDate,
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
            <Grid item xs={12}>
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
                    maxDate={datePickerMaxDate}
                    minDate={datePickerMinDate}
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
                        minDate: datePickerMinDate,
                        maxDate: datePickerMaxDate,
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <Controller
                control={controlDetailsStep}
                name="usage_status_id"
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    disableClearable={value != null}
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
                        label="Usage status"
                        error={!!errorsDetailsStep.usage_status_id}
                        helperText={errorsDetailsStep.usage_status_id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item container xs={12} sx={{ display: 'flex' }}>
              <Grid item xs={11}>
                <TextField
                  id="item-notes-input"
                  label="Notes"
                  size="small"
                  multiline
                  minRows={5}
                  {...registerDetailsStep('notes')}
                  fullWidth
                />
              </Grid>
              <Grid item xs={1}>
                <Tooltip
                  sx={{ alignItems: 'center' }}
                  title={
                    <div>
                      <Typography>Catalogue item note:</Typography>
                      <Typography whiteSpace="pre-line">
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
      case 1:
        return (
          <Grid item xs={12}>
            {parentCatalogueItemPropertiesInfo.length >= 1 ? (
              <Grid container spacing={1.5}>
                {parentCatalogueItemPropertiesInfo.map(
                  (property: CatalogueCategoryProperty, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={11} sx={{ display: 'flex' }}>
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
                                    option.toLowerCase() ==
                                      value.toLowerCase() || value == ''
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
                                        errorsPropertiesStep?.properties?.[
                                          index
                                        ]?.value?.value?.message as string
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
                                  onChange={(_event, value) => {
                                    onChange(String(value));
                                  }}
                                  sx={{ alignItems: 'center' }}
                                  fullWidth
                                  options={
                                    property.allowed_values?.values ?? []
                                  }
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
                                        property.unit
                                          ? `(${property.unit})`
                                          : ''
                                      }`}
                                      error={
                                        !!errorsPropertiesStep?.properties?.[
                                          index
                                        ]?.value?.value
                                      }
                                      helperText={
                                        errorsPropertiesStep?.properties?.[
                                          index
                                        ]?.value?.value?.message as string
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
                                !!errorsPropertiesStep?.properties?.[index]
                                  ?.value?.value
                              }
                              helperText={
                                errorsPropertiesStep?.properties?.[index]?.value
                                  ?.value?.message as string
                              }
                            />
                          )}
                        </Grid>
                        <Grid
                          item
                          xs={1}
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
      case 2:
        return (
          <Grid item xs={12}>
            <Breadcrumbs
              breadcrumbsInfo={parentSystemBreadcrumbs}
              onChangeNode={setParentSystemId}
              onChangeNavigateHome={() => {
                setParentSystemId(null);
              }}
              homeLocation="Systems"
            />
            <SystemsTableView
              systemsData={systemsData}
              systemsDataLoading={systemsDataLoading}
              onChangeParentId={setParentSystemId}
              systemParentId={parentSystemId ?? undefined}
              // Use most unrestricted variant (i.e. copy with no selection)
              selectedSystems={[]}
              type="copyTo"
            />
          </Grid>
        );
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      PaperProps={{ sx: { height: '770px' } }}
      fullWidth
    >
      <DialogTitle>
        <Grid
          item
          xs={12}
        >{`${requestType === 'patch' ? 'Edit' : 'Add'} Item`}</Grid>
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
                  {index === 1 && 'Invalid item properties'}
                  {index === 0 && 'Invalid item details'}
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
              isAddItemsPending ||
              isAddItemPending ||
              isEditItemPending ||
              Object.keys(errorsPropertiesStep).filter((val) => val !== 'root')
                .length !== 0 ||
              Object.values(errorsDetailsStep).length !== 0 ||
              !parentSystemId
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
