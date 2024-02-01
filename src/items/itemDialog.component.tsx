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
  StepButton,
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
  CatalogueItemProperty,
  EditItem,
  Item,
  ItemDetailsPlaceholder,
  UsageStatusType,
} from '../app.types';
import { DatePicker } from '@mui/x-date-pickers';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { matchCatalogueItemProperties } from '../catalogue/catalogue.component';
import { useAddItem, useEditItem } from '../api/item';
import { AxiosError } from 'axios';
import { SystemsTableView } from '../systems/systemsTableView.component';
import { useSystem, useSystems, useSystemsBreadcrumbs } from '../api/systems';
import Breadcrumbs from '../view/breadcrumbs.component';
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

  const [catchAllError, setCatchAllError] = React.useState(false);

  const [propertyValues, setPropertyValues] = React.useState<(string | null)[]>(
    []
  );

  const [propertyErrors, setPropertyErrors] = React.useState(
    new Array(parentCatalogueItemPropertiesInfo.length).fill(false)
  );

  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const { mutateAsync: addItem } = useAddItem();
  const { mutateAsync: editItem } = useEditItem();

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
        warranty_end_date:
          selectedItem.warranty_end_date &&
          isValidDateTime(selectedItem.warranty_end_date)
            ? new Date(selectedItem.warranty_end_date)
            : null,
        asset_number: selectedItem.asset_number,
        serial_number: selectedItem.serial_number,
        delivered_date:
          selectedItem.delivered_date &&
          isValidDateTime(selectedItem.delivered_date)
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

  const handlePropertyChange = (
    index: number,
    name: string,
    value: string | null
  ) => {
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
    setPropertyValues([]);
    setPropertyErrors(
      new Array(parentCatalogueItemPropertiesInfo.length).fill(false)
    );
  }, [onClose, parentCatalogueItemPropertiesInfo]);

  const handleFormErrorStates = React.useCallback(() => {
    let hasErrors = false;

    if (
      itemDetails.warranty_end_date &&
      !isValidDateTime(itemDetails.warranty_end_date)
    ) {
      hasErrors = true;
    }

    if (
      itemDetails.delivered_date &&
      !isValidDateTime(itemDetails.delivered_date)
    ) {
      hasErrors = true;
    }

    // Check properties
    const updatedPropertyErrors = [...propertyErrors];

    const updatedProperties = parentCatalogueItemPropertiesInfo.map(
      (property, index) => {
        if (property.mandatory && !propertyValues[index]) {
          updatedPropertyErrors[index] = true;
          hasErrors = true;
        } else {
          updatedPropertyErrors[index] = false;
        }

        if (
          propertyValues[index] &&
          property.type === 'number' &&
          isNaN(Number(propertyValues[index]))
        ) {
          updatedPropertyErrors[index] = true;
          hasErrors = true;
        }

        if (!propertyValues[index]) return null;

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

    return { hasErrors, updatedProperties };
  }, [
    propertyErrors,
    parentCatalogueItemPropertiesInfo,
    propertyValues,
    itemDetails,
  ]);

  const details = React.useMemo(() => {
    return {
      catalogue_item_id: catalogueItem?.id ?? '',
      system_id: itemDetails.system_id ?? null,
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

  const { data: targetSystem } = useSystem(parentSystemId);

  const handleAddItem = React.useCallback(() => {
    const { hasErrors, updatedProperties } = handleFormErrorStates();

    if (hasErrors) {
      return; // Do not proceed with saving if there are errors
    }

    const filteredProperties = updatedProperties.filter(
      (property) => property !== null
    ) as CatalogueItemProperty[];

    const item: AddItem = {
      ...details,
      properties: filteredProperties,
    };

    addItem(item)
      .then((response) => handleClose())
      .catch((error: AxiosError) => {
        setCatchAllError(true);
      });
  }, [handleFormErrorStates, details, addItem, handleClose]);

  const handleEditItem = React.useCallback(() => {
    if (selectedItem) {
      const { hasErrors, updatedProperties } = handleFormErrorStates();

      if (hasErrors) {
        return; // Do not proceed with saving if there are errors
      }

      const filteredProperties = updatedProperties.filter(
        (property) => property !== null
      ) as CatalogueItemProperty[];

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
        JSON.stringify(filteredProperties) !==
        JSON.stringify(
          selectedItem.properties.map(({ unit, ...rest }) => rest)
        );

      const isSystemIdUpdated = details.system_id !== selectedItem.system_id;

      let item: EditItem = {
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
      isCatalogueItemPropertiesUpdated &&
        (item.properties = filteredProperties);
      isSystemIdUpdated && (item.system_id = details.system_id);

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
        editItem(item)
          .then((response) => handleClose())
          .catch((error: AxiosError) => {
            setCatchAllError(true);
          });
      } else {
        setFormErrorMessage('Please edit a form entry before clicking save');
      }
    }
  }, [selectedItem, handleFormErrorStates, details, editItem, handleClose]);

  // Stepper
  const STEPS = [
    (type === 'edit' ? 'Edit' : 'Add') + ' item details',
    (type === 'edit' ? 'Edit' : 'Add') + ' item properties',
    'Select system',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [systemSelected, setSystemSelected] = React.useState<boolean>(false);

  const handleNext = () => {
    const { hasErrors } = handleFormErrorStates();

    if (hasErrors) {
      return; // Do not proceed with next if there are errors
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 2 && targetSystem !== undefined) {
      setSystemSelected(false);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            <Grid item xs={12}>
              <Typography variant="h6">Details</Typography>
            </Grid>
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

            <Grid item xs={12}>
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
          </Grid>
        );
      case 1:
        return (
          <Grid item xs={12}>
            {parentCatalogueItemPropertiesInfo.length >= 1 && (
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Typography variant="h6">Properties</Typography>
                </Grid>
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
                                    property.name,
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
                                  property.name,
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
                                      'This field is mandatory'
                                    : property.type === 'number' &&
                                      isNaN(Number(propertyValues[index])) &&
                                      'Please enter a valid number' // If 'property' is of type 'number' and 'propertyValues[index]' is not a valid number, return an invalid number error message
                                  : // If 'propertyErrors[index]' is falsy, return an empty string (no error)
                                    ''
                              }
                            />
                          )}
                        </Grid>
                        <Grid item xs={1} sx={{ display: 'flex' }}>
                          <Tooltip
                            sx={{ alignItems: 'center' }}
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
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid item xs={12}>
            <SystemsTableView
              systemsData={systemsData}
              systemsDataLoading={systemsDataLoading}
              onChangeParentId={setParentSystemId}
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
      onClose={handleClose}
      maxWidth="xl"
      PaperProps={{ sx: { height: '658px' } }}
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
          {STEPS.map((label, index) => (
            <Step key={label}>
              <StepButton onClick={() => setActiveStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        {activeStep === 2 && (
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
        )}
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
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
          <>
            {!systemSelected ? (
              <Button
                disabled={targetSystem === undefined}
                onClick={(event) => {
                  if (targetSystem) {
                    handleItemDetails('system_id', targetSystem.id);
                    setSystemSelected(true);
                  } else {
                    setFormErrorMessage('Please select a system');
                  }
                }}
                sx={{ mr: 3 }}
              >
                Move here
              </Button>
            ) : (
              <Button
                disabled={
                  catchAllError ||
                  propertyErrors.some((value) => {
                    return value === true;
                  }) ||
                  (!!itemDetails.warranty_end_date &&
                    !isValidDateTime(itemDetails.warranty_end_date)) ||
                  (!!itemDetails.delivered_date &&
                    !isValidDateTime(itemDetails.delivered_date))
                }
                onClick={type === 'edit' ? handleEditItem : handleAddItem}
                sx={{ mr: 3 }}
              >
                Finish
              </Button>
            )}
          </>
        ) : (
          <Button
            disabled={
              catchAllError ||
              propertyErrors.some((value) => {
                return value === true;
              }) ||
              (!!itemDetails.warranty_end_date &&
                !isValidDateTime(itemDetails.warranty_end_date)) ||
              (!!itemDetails.delivered_date &&
                !isValidDateTime(itemDetails.delivered_date))
            }
            onClick={handleNext}
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
      {catchAllError && (
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
            Please refresh and try again
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
}

export default ItemDialog;
