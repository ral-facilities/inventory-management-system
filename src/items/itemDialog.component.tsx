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
  UsageStatusType,
} from '../app.types';
import { DatePicker } from '@mui/x-date-pickers';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAddItem, useEditItem } from '../api/item';
import { AxiosError } from 'axios';
import handleIMS_APIError from '../handleIMS_APIError';
import { SystemsTableView } from '../systems/systemsTableView.component';
import { useSystems, useSystemsBreadcrumbs } from '../api/systems';
import Breadcrumbs from '../view/breadcrumbs.component';
import { trimStringValues } from '../utils';
import { z } from 'zod';
import {
  PropertiesSchemaType,
  UnionSchema,
  transformPropertiesData,
} from '../catalogue/items/catalogueItemsDialog.component';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface AddItemSchemaType extends ItemDetails {
  properties: PropertiesSchemaType[];
}
const maxDate = new Date('2100-01-01');
const minDate = new Date('1900-01-01');

const ItemSchema = () => {
  const itemDetailsSchema = z.object({
    serial_number: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
    asset_number: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
    purchase_order_number: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
    warranty_end_date: z
      .date({
        errorMap: (issue, { defaultError }) => ({
          message:
            issue.code === 'invalid_date'
              ? 'Date format: dd/MM/yyyy'
              : defaultError,
        }),
      })
      .max(maxDate, { message: 'Exceeded maximum date' })
      .min(minDate, { message: 'Below minimum date' })
      .nullable()
      .transform((val) => (!val ? null : val.toISOString())),

    delivered_date: z
      .date({
        errorMap: (issue, { defaultError }) => ({
          message:
            issue.code === 'invalid_date'
              ? 'Date format: dd/MM/yyyy'
              : defaultError,
        }),
      })
      .max(maxDate, { message: 'Exceeded maximum date' })
      .min(minDate, { message: 'Below minimum date' })
      .nullable()
      .transform((val) => (!val ? null : val.toISOString())),
    is_defective: z
      .string()
      .min(1, { message: 'Please select either True or False' })
      .transform((val) => (!val ? null : JSON.parse(val)))
      .pipe(
        z.boolean({
          required_error: 'Please select either True or False',
          invalid_type_error: 'Please select either True or False',
        })
      ),
    usage_status: z.nativeEnum(UsageStatusType),
    notes: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
  });
  return itemDetailsSchema.extend({
    properties: z.array(UnionSchema), // Use the accumulated properties
  });
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

  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const isNotCreating = type !== 'create' && !!selectedItem;
  const emptyCatalogueItem = {
    serial_number: '',
    asset_number: '',
    purchase_order_number: '',
    warranty_end_date: null,
    delivered_date: null,
    is_defective: 'false',
    usage_status: UsageStatusType.new,
    notes: '',
    properties: [],
    catalogue_item_id: undefined,
  };

  const initialItem = isNotCreating
    ? {
        ...selectedItem,
        warranty_end_date: selectedItem.warranty_end_date
          ? new Date(selectedItem.warranty_end_date)
          : null,
        delivered_date: selectedItem.delivered_date
          ? new Date(selectedItem.delivered_date)
          : null,
        is_defective: String(selectedItem.is_defective),
      }
    : emptyCatalogueItem;
  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    watch,
  } = useForm({
    resolver: zodResolver(ItemSchema()),
    defaultValues: {
      ...initialItem,
      properties: transformPropertiesData(
        parentCatalogueItemPropertiesInfo,
        selectedItem?.properties || catalogueItem?.properties || []
      ),
    },
    shouldUnregister: false,
    mode: 'onChange',
  });

  // If any field value changes, clear the state
  React.useEffect(() => {
    if (selectedItem) {
      const subscription = watch(() => setFormErrorMessage(undefined));
      return () => subscription.unsubscribe();
    }
  }, [selectedItem, watch]);

  const { mutateAsync: addItem, isPending: isAddPending } = useAddItem();
  const { mutateAsync: editItem, isPending: isEditPending } = useEditItem();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  //move to systems
  const [parentSystemId, setParentSystemId] = React.useState<string | null>(
    selectedItem?.system_id ?? null
  );

  const { data: systemsData, isLoading: systemsDataLoading } = useSystems(
    parentSystemId === null ? 'null' : parentSystemId
  );

  const { data: parentSystemBreadcrumbs } =
    useSystemsBreadcrumbs(parentSystemId);

  const handleAddItem = React.useCallback(
    (item: AddItem) => {
      addItem(trimStringValues(item))
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    },
    [addItem, handleClose]
  );

  const handleEditItem = React.useCallback(
    (itemData: AddItem) => {
      if (selectedItem) {
        const isPurchaseOrderNumberUpdated =
          itemData.purchase_order_number !== selectedItem.purchase_order_number;

        const isIsDefectiveUpdated =
          itemData.is_defective !== selectedItem.is_defective;

        const isUsageStatusUpdated =
          itemData.usage_status !== selectedItem.usage_status;

        const isWarrantyEndDateUpdated =
          itemData.warranty_end_date !== selectedItem.warranty_end_date;

        const isAssetNumberUpdated =
          itemData.asset_number !== selectedItem.asset_number;

        const isSerialNumberUpdated =
          itemData.serial_number !== selectedItem.serial_number;

        const isDeliveredDateUpdated =
          itemData.delivered_date !== selectedItem.delivered_date;

        const isNotesUpdated = itemData.notes !== selectedItem.notes;

        const isCatalogueItemPropertiesUpdated =
          JSON.stringify(itemData.properties) !==
          JSON.stringify(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            selectedItem.properties.map(({ unit, ...rest }) => rest)
          );

        const isSystemIdUpdated = itemData.system_id !== selectedItem.system_id;

        const item: EditItem = {
          id: selectedItem.id,
        };

        isSerialNumberUpdated && (item.serial_number = itemData.serial_number);
        isPurchaseOrderNumberUpdated &&
          (item.purchase_order_number = itemData.purchase_order_number);
        isIsDefectiveUpdated && (item.is_defective = itemData.is_defective);
        isUsageStatusUpdated && (item.usage_status = itemData.usage_status);
        isWarrantyEndDateUpdated &&
          (item.warranty_end_date = itemData.warranty_end_date);
        isAssetNumberUpdated && (item.asset_number = itemData.asset_number);
        isSerialNumberUpdated && (item.serial_number = itemData.serial_number);
        isDeliveredDateUpdated &&
          (item.delivered_date = itemData.delivered_date);
        isNotesUpdated && (item.notes = itemData.notes);
        isSystemIdUpdated && (item.system_id = itemData.system_id);
        isCatalogueItemPropertiesUpdated &&
          (item.properties = itemData.properties);

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
    },
    [selectedItem, editItem, handleClose]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    if (parentSystemId && catalogueItem) {
      const itemData: AddItemSchemaType = data;
      type === 'edit'
        ? handleEditItem({
            ...itemData,
            system_id: parentSystemId,
            properties: itemData.properties.map(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ({ key, unit, ...rest }) => rest
            ),
          })
        : handleAddItem({
            ...itemData,
            system_id: parentSystemId,
            catalogue_item_id: catalogueItem.id,
            properties: itemData.properties.map(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ({ key, unit, ...rest }) => rest
            ),
          });
    }
  };

  // Stepper

  const STEPS = [
    (type === 'edit' ? 'Edit' : 'Add') + ' item details',
    (type === 'edit' ? 'Edit' : 'Add') + ' item properties',
    'Place into a system',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handleNext = React.useCallback((step: number) => {
    switch (step) {
      default:
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, []);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const propertiesErrors = errors.properties;

  // Spread Method to clone errors
  const itemDetailsErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => key !== 'properties')
  );

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return Object.values(itemDetailsErrors).length !== 0;
        case 1:
          return propertiesErrors !== undefined;
        case 2:
          return false;
      }
    },
    [itemDetailsErrors, propertiesErrors]
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
                {...register('serial_number')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Asset number"
                size="small"
                {...register('asset_number')}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Purchase order number"
                size="small"
                {...register('purchase_order_number')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="warranty_end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Warranty end date"
                    {...field}
                    slotProps={{
                      actionBar: { actions: ['clear'] },
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!errors.warranty_end_date,
                        helperText: errors.warranty_end_date?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="delivered_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Delivered date"
                    {...field}
                    slotProps={{
                      actionBar: { actions: ['clear'] },
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!errors.delivered_date,
                        helperText: errors.delivered_date?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Controller
                  name="is_defective"
                  control={control}
                  render={({ field }) => (
                    <>
                      <InputLabel
                        required={true}
                        size="small"
                        id="is-defective"
                      >
                        Is defective
                      </InputLabel>

                      <Select
                        labelId="is-defective"
                        size="small"
                        {...field}
                        value={field.value ?? 'false'}
                        required={true}
                        label="Is defective"
                      >
                        <MenuItem value={'true'}>Yes</MenuItem>
                        <MenuItem value={'false'}>No</MenuItem>
                      </Select>
                    </>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <Controller
                  name="usage_status"
                  control={control}
                  render={({ field }) => (
                    <>
                      <InputLabel required={true} id="usage-status">
                        Usage status
                      </InputLabel>
                      <Select
                        required={true}
                        labelId="usage-status"
                        size="small"
                        {...field}
                        label="Usage status"
                      >
                        <MenuItem value={UsageStatusType.new}>New</MenuItem>
                        <MenuItem value={UsageStatusType.inUse}>
                          In Use
                        </MenuItem>
                        <MenuItem value={UsageStatusType.used}>Used</MenuItem>
                        <MenuItem value={UsageStatusType.scrapped}>
                          Scrapped
                        </MenuItem>
                      </Select>
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item container xs={12} sx={{ display: 'flex' }}>
              <Grid item xs={11}>
                <TextField
                  label="Notes"
                  size="small"
                  multiline
                  minRows={5}
                  {...register('notes')}
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
                  (property: CatalogueCategoryFormData, index: number) => {
                    return (
                      <Grid item xs={12} key={index}>
                        <Grid container spacing={1.5}>
                          <Grid item xs={11} sx={{ display: 'flex' }}>
                            {property.type === 'boolean' ? (
                              <FormControl fullWidth>
                                <Controller
                                  control={control}
                                  name={`properties.${index}.value`}
                                  render={({ field }) => {
                                    const booleanFieldValue = field.value ?? '';
                                    return (
                                      <>
                                        <InputLabel
                                          required={property.mandatory ?? false}
                                          error={
                                            !!errors.properties?.[index]?.value
                                          }
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
                                          required={property.mandatory ?? false}
                                          size="small"
                                          error={
                                            !!errors.properties?.[index]?.value
                                          }
                                          labelId={`catalogue-item-property-${property.name.replace(
                                            /\s+/g,
                                            '-'
                                          )}`}
                                          {...field}
                                          value={booleanFieldValue}
                                          label={property.name}
                                          sx={{ alignItems: 'center' }}
                                          fullWidth
                                        >
                                          <MenuItem value="">None</MenuItem>
                                          <MenuItem value="true">True</MenuItem>
                                          <MenuItem value="false">
                                            False
                                          </MenuItem>
                                        </Select>
                                        {!!errors.properties?.[index]
                                          ?.value && (
                                          <FormHelperText error>
                                            {
                                              errors.properties?.[index]?.value
                                                ?.message
                                            }
                                          </FormHelperText>
                                        )}
                                      </>
                                    );
                                  }}
                                />
                              </FormControl>
                            ) : property.allowed_values ? (
                              <FormControl fullWidth>
                                <Controller
                                  control={control}
                                  name={`properties.${index}.value`}
                                  render={({ field }) => {
                                    const currentValue = field.value ?? '';
                                    return (
                                      <>
                                        <InputLabel
                                          required={property.mandatory ?? false}
                                          error={
                                            !!errors.properties?.[index]?.value
                                          }
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
                                          required={property.mandatory ?? false}
                                          size="small"
                                          error={
                                            !!errors.properties?.[index]?.value
                                          }
                                          labelId={`catalogue-item-property-${property.name.replace(
                                            /\s+/g,
                                            '-'
                                          )}`}
                                          {...field}
                                          value={currentValue}
                                          label={property.name}
                                          sx={{ alignItems: 'center' }}
                                          fullWidth
                                        >
                                          <MenuItem key={0} value={''}>
                                            {'None'}
                                          </MenuItem>
                                          {property.allowed_values?.values.map(
                                            (value, index) => (
                                              <MenuItem
                                                key={index + 1}
                                                value={String(value)}
                                              >
                                                {value}
                                              </MenuItem>
                                            )
                                          )}
                                        </Select>
                                        {!!errors.properties?.[index]
                                          ?.value && (
                                          <FormHelperText error>
                                            {
                                              errors.properties?.[index]?.value
                                                ?.message
                                            }
                                          </FormHelperText>
                                        )}
                                      </>
                                    );
                                  }}
                                />
                              </FormControl>
                            ) : (
                              <Controller
                                control={control}
                                name={`properties.${index}.value`}
                                render={({ field }) => (
                                  <TextField
                                    label={`${property.name} ${
                                      property.unit ? `(${property.unit})` : ''
                                    }`}
                                    size="small"
                                    required={property.mandatory ?? false}
                                    {...field}
                                    value={field.value ?? ''}
                                    error={!!errors.properties?.[index]?.value}
                                    helperText={
                                      errors.properties?.[index]?.value?.message
                                    }
                                    fullWidth
                                  />
                                )}
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
                    );
                  }
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
      onClose={handleClose}
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
              formErrorMessage !== undefined ||
              Object.values(errors).length !== 0 ||
              !parentSystemId
            }
            onClick={handleSubmit(onSubmit)}
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
