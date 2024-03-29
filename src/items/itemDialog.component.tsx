import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddItem,
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueItem,
  EditItem,
  Item,
  ItemDetails,
  ItemDetailsPlaceholder,
  UsageStatusType,
} from '../app.types';
import { DatePicker } from '@mui/x-date-pickers';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { matchCatalogueItemProperties } from '../catalogue/catalogue.component';
import { useAddItem, useEditItem } from '../api/items';
import { AxiosError } from 'axios';
import handleIMS_APIError from '../handleIMS_APIError';
import { SystemsTableView } from '../systems/systemsTableView.component';
import { useSystems, useSystemsBreadcrumbs } from '../api/systems';
import Breadcrumbs from '../view/breadcrumbs.component';
import { trimStringValues } from '../utils';
const maxYear = 2100;
export function isValidDateTime(input: Date | string | null) {
  // Attempt to create a Date object from the input
  let dateObj: Date;
  if (input instanceof Date) {
    dateObj = input;
  } else if (typeof input === 'string') {
    dateObj = new Date(input);
  } else {
    // Handle null or other non-supported types
    dateObj = new Date('');
  }

  // Check if the Date object is valid and the string was successfully parsed
  // Also, check if the original string is not equal to 'Invalid Date'
  // Check if the date is larger than the year 2100, the maximum date of the date picker
  return (
    !isNaN(dateObj.getTime()) &&
    dateObj.toString() !== 'Invalid Date' &&
    !(dateObj.getUTCFullYear() >= maxYear)
  );
}

const CustomTextField: React.FC<TextFieldProps> = (renderProps) => {
  const { id, ...inputProps } = renderProps.inputProps ?? {};
  let helperText = 'Date format: dd/MM/yyyy';

  if (
    renderProps.value &&
    Number((renderProps.value as string).split('/')[2]) >= maxYear
  ) {
    helperText = 'Exceeded maximum date';
  }
  return (
    <TextField
      {...renderProps}
      fullWidth
      id={id}
      size="small"
      inputProps={{
        ...inputProps,
      }}
      error={renderProps.error}
      {...(renderProps.error && { helperText: helperText })}
    />
  );
};

export interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'create' | 'edit' | 'save as';
  catalogueItem?: CatalogueItem;
  catalogueCategory?: CatalogueCategory;
  selectedItem?: Item;
}

function ItemDialog(props: ItemDialogProps) {
  const {
    open,
    onClose,
    type,
    catalogueItem,
    catalogueCategory,
    selectedItem,
  } = props;
  const parentCatalogueItemPropertiesInfo = React.useMemo(
    () => catalogueCategory?.catalogue_item_properties ?? [],
    [catalogueCategory]
  );

  const [itemDetails, setItemDetails] = React.useState<ItemDetailsPlaceholder>({
    catalogue_item_id: null,
    system_id: null,
    purchase_order_number: null,
    is_defective: null,
    usage_status: null,
    warranty_end_date: null,
    asset_number: null,
    serial_number: null,
    delivered_date: null,
    notes: null,
  });

  const [hasDateErrors, setHasDateErrors] = React.useState<{
    warranty_end_date: boolean;
    delivered_date: boolean;
  }>({ warranty_end_date: false, delivered_date: false });

  const [propertyValues, setPropertyValues] = React.useState<(string | null)[]>(
    []
  );

  const [propertyErrors, setPropertyErrors] = React.useState(
    new Array(parentCatalogueItemPropertiesInfo.length).fill(false)
  );

  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const { mutateAsync: addItem, isPending: isAddPending } = useAddItem();
  const { mutateAsync: editItem, isPending: isEditPending } = useEditItem();

  React.useEffect(() => {
    if (type === 'create' && open) {
      setPropertyValues(
        matchCatalogueItemProperties(
          parentCatalogueItemPropertiesInfo,
          catalogueItem?.properties ?? []
        )
      );
    }
  }, [parentCatalogueItemPropertiesInfo, catalogueItem, open, type]);

  React.useEffect(() => {
    if (selectedItem && open) {
      setItemDetails({
        catalogue_item_id: null,
        system_id: null,
        purchase_order_number: selectedItem.purchase_order_number,
        is_defective: selectedItem.is_defective ? 'true' : 'false',
        usage_status: UsageStatusType[selectedItem.usage_status],
        warranty_end_date: selectedItem.warranty_end_date
          ? new Date(selectedItem.warranty_end_date)
          : null,
        asset_number: selectedItem.asset_number,
        serial_number: selectedItem.serial_number,
        delivered_date: selectedItem.delivered_date
          ? new Date(selectedItem.delivered_date)
          : null,
        notes: selectedItem.notes,
      });

      setPropertyValues(
        matchCatalogueItemProperties(
          parentCatalogueItemPropertiesInfo,
          selectedItem.properties ?? []
        )
      );
    }
  }, [parentCatalogueItemPropertiesInfo, selectedItem, open]);

  const handlePropertyChange = (index: number, value: string | null) => {
    const updatedPropertyValues = [...propertyValues];

    if (value === null || (typeof value === 'string' && value.trim() === '')) {
      updatedPropertyValues[index] = null;
    } else {
      updatedPropertyValues[index] = value;
    }
    setPropertyValues(updatedPropertyValues);
    // Clear the error state for the changed property
    const updatedPropertyErrors = [...propertyErrors];
    updatedPropertyErrors[index] = false;
    setPropertyErrors(updatedPropertyErrors);
    setFormErrorMessage(undefined);
  };

  const handleItemDetails = React.useCallback(
    (field: keyof ItemDetailsPlaceholder, value: string | Date | null) => {
      const updatedItemDetails = { ...itemDetails };

      switch (field) {
        case 'delivered_date':
        case 'warranty_end_date':
          updatedItemDetails[field] = value as Date | null;
          break;
        default:
          if (
            value === null ||
            (typeof value === 'string' && value.trim() === '')
          ) {
            updatedItemDetails[field] = null;
          } else {
            updatedItemDetails[field] = value as string;
          }
          break;
      }

      setItemDetails(updatedItemDetails);
      setFormErrorMessage(undefined);
    },
    [itemDetails]
  );
  const handleClose = React.useCallback(() => {
    onClose();
    setItemDetails({
      catalogue_item_id: null,
      system_id: null,
      purchase_order_number: null,
      is_defective: null,
      usage_status: null,
      warranty_end_date: null,
      asset_number: null,
      serial_number: null,
      delivered_date: null,
      notes: null,
    });
    setActiveStep(0);
    setPropertyValues([]);
    setPropertyErrors(
      new Array(parentCatalogueItemPropertiesInfo.length).fill(false)
    );
  }, [onClose, parentCatalogueItemPropertiesInfo]);

  const handleFormPropertiesErrorStates = React.useCallback(() => {
    let hasPropertiesErrors = false;

    // Check properties
    const updatedPropertyErrors = [...propertyErrors];

    const updatedProperties = parentCatalogueItemPropertiesInfo.map(
      (property, index) => {
        if (property.mandatory && !propertyValues[index]) {
          updatedPropertyErrors[index] = true;
          hasPropertiesErrors = true;
        } else {
          updatedPropertyErrors[index] = false;
        }

        if (
          propertyValues[index] &&
          property.type === 'number' &&
          isNaN(Number(propertyValues[index]))
        ) {
          updatedPropertyErrors[index] = true;
          hasPropertiesErrors = true;
        }

        if (!propertyValues[index])
          return {
            name: property.name,
            value: null,
          };

        let typedValue: string | number | boolean | null =
          propertyValues[index]; // Assume it's a string by default

        // Check if the type of the 'property' is boolean
        if (property.type === 'boolean') {
          // If the type is boolean, then check the type of 'propertyValues[index]'
          typedValue = propertyValues[index] === 'true' ? true : false;
        } else if (property.type === 'number') {
          typedValue = Number(propertyValues[index]);
        }

        return {
          name: property.name,
          value: typedValue,
        };
      }
    );

    setPropertyErrors(updatedPropertyErrors);

    return { hasPropertiesErrors, updatedProperties };
  }, [propertyErrors, parentCatalogueItemPropertiesInfo, propertyValues]);

  const details: ItemDetails = React.useMemo(() => {
    return {
      catalogue_item_id: catalogueItem?.id ?? '',
      system_id: itemDetails.system_id ?? '',
      purchase_order_number: itemDetails.purchase_order_number,
      is_defective: itemDetails.is_defective === 'true' ? true : false,
      usage_status: itemDetails.usage_status
        ? UsageStatusType[
            itemDetails.usage_status as keyof typeof UsageStatusType
          ]
        : UsageStatusType.new,
      warranty_end_date:
        itemDetails.warranty_end_date &&
        isValidDateTime(itemDetails.warranty_end_date)
          ? itemDetails.warranty_end_date.toISOString()
          : null,
      asset_number: itemDetails.asset_number,
      serial_number: itemDetails.serial_number,
      delivered_date:
        itemDetails.delivered_date &&
        isValidDateTime(itemDetails.delivered_date)
          ? itemDetails.delivered_date.toISOString()
          : null,
      notes: itemDetails.notes,
    };
  }, [itemDetails, catalogueItem]);

  //move to systems
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    selectedItem?.system_id ?? null
  );

  const { data: systemsData, isLoading: systemsDataLoading } = useSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: parentSystemBreadcrumbs } =
    useSystemsBreadcrumbs(parentSystemId);

  const handleAddItem = React.useCallback(() => {
    const { updatedProperties, hasPropertiesErrors } =
      handleFormPropertiesErrorStates();

    if (hasPropertiesErrors) return;

    const item: AddItem = {
      ...details,
      properties: updatedProperties,
    };

    addItem(trimStringValues(item))
      .then(() => handleClose())
      .catch((error: AxiosError) => {
        handleIMS_APIError(error);
      });
  }, [handleFormPropertiesErrorStates, details, addItem, handleClose]);

  const handleEditItem = React.useCallback(() => {
    if (selectedItem) {
      const { updatedProperties, hasPropertiesErrors } =
        handleFormPropertiesErrorStates();

      if (hasPropertiesErrors) return;

      const isPurchaseOrderNumberUpdated =
        details.purchase_order_number !== selectedItem.purchase_order_number;

      const isIsDefectiveUpdated =
        details.is_defective !== selectedItem.is_defective;

      const isUsageStatusUpdated =
        details.usage_status !== selectedItem.usage_status;

      const isWarrantyEndDateUpdated =
        details.warranty_end_date !== selectedItem.warranty_end_date;

      const isAssetNumberUpdated =
        details.asset_number !== selectedItem.asset_number;

      const isSerialNumberUpdated =
        details.serial_number !== selectedItem.serial_number;

      const isDeliveredDateUpdated =
        details.delivered_date !== selectedItem.delivered_date;

      const isNotesUpdated = details.notes !== selectedItem.notes;

      const isCatalogueItemPropertiesUpdated =
        JSON.stringify(updatedProperties) !==
        JSON.stringify(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          selectedItem.properties.map(({ unit, ...rest }) => rest)
        );

      const isSystemIdUpdated = details.system_id !== selectedItem.system_id;

      const item: EditItem = {
        id: selectedItem.id,
      };

      isSerialNumberUpdated && (item.serial_number = details.serial_number);
      isPurchaseOrderNumberUpdated &&
        (item.purchase_order_number = details.purchase_order_number);
      isIsDefectiveUpdated && (item.is_defective = details.is_defective);
      isUsageStatusUpdated && (item.usage_status = details.usage_status);
      isWarrantyEndDateUpdated &&
        (item.warranty_end_date = details.warranty_end_date);
      isAssetNumberUpdated && (item.asset_number = details.asset_number);
      isSerialNumberUpdated && (item.serial_number = details.serial_number);
      isDeliveredDateUpdated && (item.delivered_date = details.delivered_date);
      isNotesUpdated && (item.notes = details.notes);
      isSystemIdUpdated && (item.system_id = details.system_id);
      isCatalogueItemPropertiesUpdated && (item.properties = updatedProperties);

      if (
        item.id &&
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
        editItem(trimStringValues(item))
          .then(() => handleClose())
          .catch((error: AxiosError) => {
            handleIMS_APIError(error);
          });
      } else {
        setFormErrorMessage('Please edit a form entry before clicking save');
      }
    }
  }, [
    selectedItem,
    handleFormPropertiesErrorStates,
    details,
    editItem,
    handleClose,
  ]);

  // Stepper
  const STEPS = [
    (type === 'edit' ? 'Edit' : 'Add') + ' item details',
    (type === 'edit' ? 'Edit' : 'Add') + ' item properties',
    'Place into a system',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handleNext = React.useCallback(
    (step: number) => {
      switch (step) {
        case 1: {
          const { hasPropertiesErrors } = handleFormPropertiesErrorStates();
          return (
            !hasPropertiesErrors &&
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
          );
        }
        default:
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
    [handleFormPropertiesErrorStates]
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  React.useEffect(() => {
    setItemDetails((prev) => ({
      ...prev,
      system_id: parentSystemId,
    }));
    setFormErrorMessage(undefined);
  }, [parentSystemId]);

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return Object.values(hasDateErrors).some(
            (value: boolean) => value === true
          );
        case 1:
          return propertyErrors.some((value) => value === true);
        case 2:
          return false;
      }
    },
    [hasDateErrors, propertyErrors]
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            <Grid item xs={12}>
              <TextField
                label="Serial number"
                size="small"
                value={itemDetails.serial_number ?? ''}
                onChange={(event) => {
                  handleItemDetails('serial_number', event.target.value);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Asset number"
                size="small"
                value={itemDetails.asset_number ?? ''}
                onChange={(event) => {
                  handleItemDetails('asset_number', event.target.value);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Purchase order number"
                size="small"
                value={itemDetails.purchase_order_number ?? ''}
                onChange={(event) => {
                  handleItemDetails(
                    'purchase_order_number',
                    event.target.value
                  );
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <DatePicker
                label="Warranty end date"
                value={itemDetails.warranty_end_date}
                onChange={(date) =>
                  handleItemDetails('warranty_end_date', date ? date : null)
                }
                slots={{ textField: CustomTextField }}
                slotProps={{
                  actionBar: { actions: ['clear'] },
                }}
                onError={(error) => {
                  setHasDateErrors((prev) => ({
                    ...prev,
                    warranty_end_date: error ? true : false,
                  }));
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Delivered date"
                value={itemDetails.delivered_date}
                onChange={(date) =>
                  handleItemDetails('delivered_date', date ? date : null)
                }
                slotProps={{
                  actionBar: { actions: ['clear'] },
                }}
                slots={{ textField: CustomTextField }}
                onError={(error) => {
                  setHasDateErrors((prev) => ({
                    ...prev,
                    delivered_date: error ? true : false,
                  }));
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel required={true} size="small" id="is-defective">
                  Is defective
                </InputLabel>

                <Select
                  labelId="is-defective"
                  value={itemDetails.is_defective ?? 'false'}
                  size="small"
                  onChange={(e) =>
                    handleItemDetails('is_defective', e.target.value)
                  }
                  required={true}
                  label="Is defective"
                >
                  <MenuItem value={'true'}>Yes</MenuItem>
                  <MenuItem value={'false'}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <InputLabel required={true} id="usage-status">
                  Usage status
                </InputLabel>
                <Select
                  required={true}
                  labelId="usage-status"
                  value={itemDetails.usage_status ?? 'new'}
                  size="small"
                  onChange={(e) =>
                    handleItemDetails('usage_status', e.target.value)
                  }
                  label="Usage status"
                >
                  <MenuItem value={'new'}>New</MenuItem>
                  <MenuItem value={'inUse'}>In Use</MenuItem>
                  <MenuItem value={'used'}>Used</MenuItem>
                  <MenuItem value={'scrapped'}>Scrapped</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item container xs={12} sx={{ display: 'flex' }}>
              <Grid item xs={11}>
                <TextField
                  label="Notes"
                  size="small"
                  multiline
                  minRows={5}
                  value={itemDetails.notes ?? ''}
                  onChange={(event) => {
                    handleItemDetails('notes', event.target.value);
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={1}>
                <Tooltip
                  sx={{ alignItems: 'center' }}
                  title={
                    <div>
                      <Typography>Catalogue item note:</Typography>
                      <Typography>{catalogueItem?.notes ?? 'None'}</Typography>
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
                  (property: CatalogueCategoryFormData, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Grid container spacing={1.5}>
                        <Grid item xs={11} sx={{ display: 'flex' }}>
                          {property.type === 'boolean' ? (
                            <FormControl fullWidth>
                              <InputLabel
                                required={property.mandatory ?? false}
                                error={propertyErrors[index]}
                                id={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                size="small"
                                sx={{ alignItems: 'center' }}
                              >
                                {property.name}
                              </InputLabel>
                              <Select
                                value={(propertyValues[index] as string) ?? ''}
                                required={property.mandatory ?? false}
                                size="small"
                                error={propertyErrors[index]}
                                labelId={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                onChange={(event) =>
                                  handlePropertyChange(
                                    index,
                                    event.target.value as string
                                  )
                                }
                                label={property.name}
                                sx={{ alignItems: 'center' }}
                                fullWidth
                              >
                                <MenuItem value="">None</MenuItem>
                                <MenuItem value="true">True</MenuItem>
                                <MenuItem value="false">False</MenuItem>
                              </Select>
                              {propertyErrors[index] && (
                                <FormHelperText error>
                                  Please select either True or False
                                </FormHelperText>
                              )}
                            </FormControl>
                          ) : property.allowed_values ? (
                            <FormControl fullWidth>
                              <InputLabel
                                required={property.mandatory ?? false}
                                error={propertyErrors[index]}
                                id={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                size="small"
                                sx={{ alignItems: 'center' }}
                              >
                                {property.name}
                              </InputLabel>
                              <Select
                                value={(propertyValues[index] as string) ?? ''}
                                required={property.mandatory ?? false}
                                size="small"
                                error={propertyErrors[index]}
                                labelId={`catalogue-item-property-${property.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`}
                                onChange={(event) =>
                                  handlePropertyChange(
                                    index,
                                    event.target.value as string
                                  )
                                }
                                label={property.name}
                                sx={{ alignItems: 'center' }}
                                fullWidth
                              >
                                <MenuItem key={0} value={''}>
                                  {'None'}
                                </MenuItem>
                                {property.allowed_values.values.map(
                                  (value, index) => (
                                    <MenuItem key={index + 1} value={value}>
                                      {value}
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              label={`${property.name} ${
                                property.unit ? `(${property.unit})` : ''
                              }`}
                              size="small"
                              required={property.mandatory ?? false}
                              value={propertyValues[index] || ''}
                              onChange={(event) =>
                                handlePropertyChange(
                                  index,
                                  event.target.value ? event.target.value : null
                                )
                              }
                              fullWidth
                              error={propertyErrors[index]}
                              helperText={
                                // Check if 'propertyErrors[index]' exists and evaluate its value
                                propertyErrors[index]
                                  ? // If 'propertyErrors[index]' is truthy, perform the following checks:
                                    property.mandatory && !propertyValues[index]
                                    ? // If 'property' is mandatory and 'propertyValues[index]' is empty, return a mandatory field error message
                                      'Please enter a valid value as this field is mandatory'
                                    : property.type === 'number' &&
                                      isNaN(Number(propertyValues[index])) &&
                                      'Please enter a valid number' // If 'property' is of type 'number' and 'propertyValues[index]' is not a valid number, return an invalid number error message
                                  : // If 'propertyErrors[index]' is falsy, return an empty string (no error)
                                    ''
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
                            title={
                              <div>
                                <Typography>Name: {property.name}</Typography>
                                <Typography>Unit: {property.unit}</Typography>
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
              navigateHomeAriaLabel={'navigate to systems home'}
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
      PaperProps={{ sx: { height: '705px' } }}
      fullWidth
    >
      <DialogTitle>
        <Grid item xs={12}>{`${type === 'edit' ? 'Edit' : 'Add'} Item`}</Grid>
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
                  {index === 0 && 'Invalid date'}
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
              isAddPending ||
              isEditPending ||
              !itemDetails.system_id ||
              formErrorMessage !== undefined ||
              propertyErrors.some((value) => value === true) ||
              Object.values(hasDateErrors).some(
                (value: boolean) => value === true
              )
            }
            onClick={type === 'edit' ? handleEditItem : handleAddItem}
            sx={{ mr: 3 }}
          >
            Finish
          </Button>
        ) : (
          <Button
            disabled={
              (activeStep === 1 &&
                propertyErrors.some((value) => value === true)) ||
              (activeStep === 0 &&
                Object.values(hasDateErrors).some(
                  (value: boolean) => value === true
                ))
            }
            onClick={() => handleNext(activeStep)}
            sx={{ mr: 3 }}
          >
            Next
          </Button>
        )}
      </DialogActions>
      {formErrorMessage && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ maxWidth: '100%', fontSize: '1rem' }} error>
            {formErrorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
}

export default ItemDialog;
