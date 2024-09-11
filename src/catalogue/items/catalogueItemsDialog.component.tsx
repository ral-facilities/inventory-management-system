import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
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
import { AxiosError } from 'axios';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  APIError,
  CatalogueCategory,
  CatalogueCategoryProperty,
  CatalogueItem,
  CatalogueItemPatch,
  CatalogueItemPost,
  Manufacturer,
  PropertyPost,
} from '../../api/api.types';
import {
  usePatchCatalogueItem,
  usePostCatalogueItem,
} from '../../api/catalogueItems';
import { useGetManufacturers } from '../../api/manufacturers';
import {
  CatalogueItemStep1,
  CatalogueItemStep1Post,
  PropertiesStep,
  PropertyValue,
} from '../../app.types';
import {
  CatalogueItemSchemaStep1,
  PropertiesStepSchema,
  RequestType,
} from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';
import ManufacturerDialog from '../../manufacturer/manufacturerDialog.component';

function toCatalogueItemStep1(
  item: CatalogueItem | undefined
): CatalogueItemStep1 {
  if (!item) {
    return {
      manufacturer_id: '',
      name: '',
      description: '',
      cost_gbp: '',
      cost_to_rework_gbp: '',
      days_to_replace: '',
      days_to_rework: '',
      drawing_number: '',
      drawing_link: '',
      item_model_number: '',
      notes: '',
    };
  }

  return {
    manufacturer_id: item.manufacturer_id,
    name: item.name,
    description: item.description ?? '',
    cost_gbp: String(item.cost_gbp),
    cost_to_rework_gbp:
      item.cost_to_rework_gbp !== null ? String(item.cost_to_rework_gbp) : '',
    days_to_replace: String(item.days_to_replace),
    days_to_rework:
      item.days_to_rework !== null ? String(item.days_to_rework) : '',
    drawing_number: item.drawing_number ?? '',
    drawing_link: item.drawing_link ?? '',
    item_model_number: item.item_model_number ?? '',
    notes: item.notes ?? '',
  };
}

function convertToPropertyValueList(
  catalogueCategory?: CatalogueCategory,
  catalogueItem?: CatalogueItem
): PropertyValue[] {
  const catalogueCategoryProperties = catalogueCategory?.properties || [];
  const properties = catalogueItem?.properties || [];
  return catalogueCategoryProperties.map((property) => {
    // Find the matching property for this property by id
    const matchingCategoryProperty = properties?.find(
      (catProp) => catProp.id === property.id
    );

    const valueType = `${property.type}_${property.mandatory}`;

    return {
      valueType: valueType,
      value: {
        av_placement_id: property.id,
        value:
          matchingCategoryProperty && matchingCategoryProperty.value !== null
            ? String(matchingCategoryProperty.value)
            : '',
      },
    };
  });
}

function convertToPropertyPost(
  propertyValues: PropertyValue[]
): PropertyPost[] {
  return propertyValues.map((propertyValue) => {
    return {
      id: propertyValue.value.av_placement_id,
      value: propertyValue.value.value ?? null,
    };
  });
}

function convertToCatalogueItemStep1Post(
  item: CatalogueItemStep1
): CatalogueItemStep1Post {
  return {
    manufacturer_id: item.manufacturer_id,
    name: item.name,
    description: item.description ?? null,
    cost_gbp: Number(item.cost_gbp), // Convert string to number
    cost_to_rework_gbp: item.cost_to_rework_gbp
      ? Number(item.cost_to_rework_gbp)
      : null, // Convert if not null
    days_to_replace: Number(item.days_to_replace), // Convert string to number
    days_to_rework: item.days_to_rework ? Number(item.days_to_rework) : null, // Convert if not null
    drawing_number: item.drawing_number ?? null,
    drawing_link: item.drawing_link ?? null,
    item_model_number: item.item_model_number ?? null,
    notes: item.notes ?? null,
  };
}
export interface CatalogueItemsDialogProps {
  open: boolean;
  onClose: () => void;
  parentInfo: CatalogueCategory | undefined;
  selectedCatalogueItem?: CatalogueItem;
  requestType: RequestType;
  duplicate?: boolean;
}

function CatalogueItemsDialog(props: CatalogueItemsDialogProps) {
  const {
    open,
    onClose,
    parentInfo,
    selectedCatalogueItem,
    requestType,
    duplicate,
  } = props;
  const parentId = parentInfo?.id ?? null;
  const parentCatalogueItemPropertiesInfo = React.useMemo(
    () => parentInfo?.properties ?? [],
    [parentInfo]
  );

  const catalogueItemStep1FormMethods = useForm<CatalogueItemStep1>({
    resolver: zodResolver(CatalogueItemSchemaStep1(requestType)),
    defaultValues: toCatalogueItemStep1(selectedCatalogueItem),
  });

  const {
    handleSubmit: handleSubmitStep1,
    register: registerStep1,
    formState: { errors: errorsStep1 },
    control: controlStep1,
    clearErrors: clearErrorsStep1,
    reset: resetStep1,
    watch: watchStep1,
  } = catalogueItemStep1FormMethods;

  const catalogueItemStep2FormMethods = useForm<PropertiesStep>({
    resolver: zodResolver(PropertiesStepSchema),
    defaultValues: {
      properties: convertToPropertyValueList(parentInfo, selectedCatalogueItem),
    },
  });

  const {
    handleSubmit: handleSubmitStep2,
    register: registerStep2,
    formState: { errors: errorsStep2 },
    control: controlStep2,
    clearErrors: clearErrorsStep2,
    reset: resetStep2,
    watch: watchStep2,
    setError: setErrorStep2,
  } = catalogueItemStep2FormMethods;

  const handleClose = React.useCallback(() => {
    resetStep1();
    clearErrorsStep1();
    resetStep2();
    clearErrorsStep2();
    setActiveStep(0);
    onClose();
  }, [clearErrorsStep1, clearErrorsStep2, onClose, resetStep1, resetStep2]);

  // Load the values for editing.
  React.useEffect(() => {
    resetStep1(toCatalogueItemStep1(selectedCatalogueItem));
    resetStep2({
      properties: convertToPropertyValueList(parentInfo, selectedCatalogueItem),
    });
  }, [parentInfo, resetStep1, resetStep2, selectedCatalogueItem]);

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    const subscription1 = watchStep1(() => clearErrorsStep2('root.formError'));

    return () => subscription1.unsubscribe();
  }, [clearErrorsStep2, watchStep1]);

  React.useEffect(() => {
    const subscription = watchStep2(() => clearErrorsStep2('root.formError'));
    return () => subscription.unsubscribe();
  }, [clearErrorsStep2, watchStep2]);

  const { mutateAsync: postCatalogueItem, isPending: isAddPending } =
    usePostCatalogueItem();
  const { mutateAsync: patchCatalogueItem, isPending: isEditPending } =
    usePatchCatalogueItem();

  const { data: manufacturerList } = useGetManufacturers();

  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const handleAddCatalogueItem = React.useCallback(
    (catalogueItem: CatalogueItemPost) => {
      postCatalogueItem(catalogueItem)
        .then(() => handleClose())
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    },
    [postCatalogueItem, handleClose]
  );

  const handleEditCatalogueItem = React.useCallback(
    (data: CatalogueItemPost) => {
      if (selectedCatalogueItem) {
        const isNameUpdated = data.name !== selectedCatalogueItem.name;

        const isDescriptionUpdated =
          data.description !== selectedCatalogueItem.description;

        const isCostGbpUpdated =
          data.cost_gbp !== selectedCatalogueItem.cost_gbp;

        const isCostToReworkGbpUpdated =
          data.cost_to_rework_gbp !== selectedCatalogueItem.cost_to_rework_gbp;

        const isDaysToReplaceUpdated =
          data.days_to_replace !== selectedCatalogueItem.days_to_replace;

        const isDaysToReworkUpdated =
          data.days_to_rework !== selectedCatalogueItem.days_to_rework;

        const isDrawingNumberUpdated =
          data.drawing_number !== selectedCatalogueItem.drawing_number;

        const isDrawingLinkUpdated =
          data.drawing_link !== selectedCatalogueItem.drawing_link;

        const isModelNumberUpdated =
          data.item_model_number !== selectedCatalogueItem.item_model_number;

        const isCatalogueItemPropertiesUpdated =
          JSON.stringify(data.properties) !==
          JSON.stringify(
            selectedCatalogueItem.properties.map(({ unit, name, ...rest }) => ({
              id: rest.id,
              value: rest.value,
            }))
          );

        const isManufacturerUpdated =
          JSON.stringify(data.manufacturer_id) !==
          JSON.stringify(selectedCatalogueItem.manufacturer_id);
        const catalogueItem: CatalogueItemPatch = {};

        const isNotesUpdated = data.notes !== selectedCatalogueItem.notes;

        if (isNameUpdated) catalogueItem.name = data.name;
        if (isDescriptionUpdated) catalogueItem.description = data.description;
        if (isCostGbpUpdated) catalogueItem.cost_gbp = data.cost_gbp;
        if (isCostToReworkGbpUpdated)
          catalogueItem.cost_to_rework_gbp = data.cost_to_rework_gbp;
        if (isDaysToReplaceUpdated)
          catalogueItem.days_to_replace = data.days_to_replace;
        if (isDaysToReworkUpdated)
          catalogueItem.days_to_rework = data.days_to_rework;
        if (isDrawingNumberUpdated)
          catalogueItem.drawing_number = data.drawing_number;
        if (isDrawingLinkUpdated)
          catalogueItem.drawing_link = data.drawing_link;
        if (isModelNumberUpdated)
          catalogueItem.item_model_number = data.item_model_number;
        if (isCatalogueItemPropertiesUpdated) {
          catalogueItem.properties = data.properties;
        }
        if (isManufacturerUpdated)
          catalogueItem.manufacturer_id = data.manufacturer_id;
        if (isNotesUpdated) catalogueItem.notes = data.notes;

        if (
          selectedCatalogueItem.id &&
          (isNameUpdated ||
            isDescriptionUpdated ||
            isCostGbpUpdated ||
            isCostToReworkGbpUpdated ||
            isDaysToReplaceUpdated ||
            isDaysToReworkUpdated ||
            isDrawingNumberUpdated ||
            isDrawingLinkUpdated ||
            isModelNumberUpdated ||
            isCatalogueItemPropertiesUpdated ||
            isManufacturerUpdated ||
            isNotesUpdated)
        ) {
          patchCatalogueItem({
            id: selectedCatalogueItem.id,
            catalogueItem: catalogueItem,
          })
            .then(() => handleClose())
            .catch((error: AxiosError) => {
              const response = error.response?.data as APIError;

              if (response && error.response?.status === 409) {
                if (response.detail.includes('child elements')) {
                  setErrorStep2('root.formError', {
                    message: response.detail,
                  });
                }
                return;
              }
              handleIMS_APIError(error);
            });
        } else {
          setErrorStep2('root.formError', {
            message:
              "There have been no changes made. Please change a field's value or press Cancel to exit.",
          });
        }
      }
    },
    [selectedCatalogueItem, patchCatalogueItem, handleClose, setErrorStep2]
  );

  // Stepper
  const STEPS = [
    (requestType === 'patch' ? 'Edit' : 'Add') + ' catalogue item details',
    (requestType === 'patch' ? 'Edit' : 'Add') + ' catalogue item properties',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handleNext = React.useCallback(
    (event: React.SyntheticEvent, activeStep: number) => {
      switch (activeStep) {
        case 0:
          return handleSubmitStep1(() => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          })(event);
        case 1:
          return false;
      }
    },
    [handleSubmitStep1]
  );

  const handleFinish = React.useCallback(
    async (event: React.SyntheticEvent) => {
      let step1Data: CatalogueItemStep1 | undefined;
      let step2Data: PropertiesStep | undefined;

      // Wrap the handleSubmit call for Step 1 in a promise
      await handleSubmitStep1((validData) => {
        step1Data = validData; // If valid, set the data
      })(event);

      await handleSubmitStep2((validData) => {
        step2Data = validData; // If valid, set the data
      })(event);

      if (!step1Data) return;
      if (!step2Data) return;

      const data: CatalogueItemPost = {
        ...convertToCatalogueItemStep1Post(step1Data),
        properties: convertToPropertyPost(step2Data.properties),
        catalogue_category_id: parentId ?? '',
        is_obsolete: false,
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      };
      if (requestType === 'post' || duplicate) {
        handleAddCatalogueItem(data);
      } else {
        handleEditCatalogueItem(data);
      }
    },
    [
      duplicate,
      handleAddCatalogueItem,
      handleEditCatalogueItem,
      handleSubmitStep1,
      handleSubmitStep2,
      parentId,
      requestType,
    ]
  );

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return Object.values(errorsStep1).length !== 0;
        case 1: {
          return (
            Object.keys(errorsStep2).filter((val) => val !== 'root').length !==
            0
          );
        }
      }
    },
    [errorsStep1, errorsStep2]
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            <Grid item xs={12}>
              <TextField
                id="catalogue-item-name-input"
                label="Name"
                size="small"
                required={true}
                {...registerStep1('name')}
                fullWidth
                error={!!errorsStep1.name}
                helperText={errorsStep1.name?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="catalogue-item-description-input"
                label="Description"
                size="small"
                {...registerStep1('description')}
                fullWidth
                multiline
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="catalogue-item-cost-input"
                label="Cost (£)"
                size="small"
                required={true}
                {...registerStep1('cost_gbp')}
                error={!!errorsStep1.cost_gbp}
                helperText={errorsStep1.cost_gbp?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-cost-rework-input"
                label="Cost to rework (£)"
                size="small"
                {...registerStep1('cost_to_rework_gbp')}
                error={!!errorsStep1.cost_to_rework_gbp}
                helperText={errorsStep1.cost_to_rework_gbp?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-replace-input"
                label="Time to replace (days)"
                size="small"
                required={true}
                {...registerStep1('days_to_replace')}
                error={!!errorsStep1.days_to_replace}
                helperText={errorsStep1.days_to_replace?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-rework-input"
                label="Time to rework (days)"
                size="small"
                {...registerStep1('days_to_rework')}
                error={!!errorsStep1.days_to_rework}
                helperText={errorsStep1.days_to_rework?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-drawing-number-input"
                label="Drawing number"
                size="small"
                {...registerStep1('drawing_number')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-drawing-link-input"
                label="Drawing link"
                size="small"
                {...registerStep1('drawing_link')}
                error={!!errorsStep1.drawing_link}
                helperText={errorsStep1.drawing_link?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-model-input"
                label="Model number"
                size="small"
                {...registerStep1('item_model_number')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} style={{ display: 'flex' }}>
              <Grid item xs={11}>
                <Controller
                  control={controlStep1}
                  name="manufacturer_id"
                  render={({ field: { value, onChange } }) => (
                    <Autocomplete
                      value={
                        manufacturerList?.find(
                          (manufacturer) => manufacturer.id === value
                        ) || null
                      }
                      onChange={(
                        _event: React.SyntheticEvent,
                        newManufacturer: Manufacturer | null
                      ) => {
                        onChange(newManufacturer?.id);
                      }}
                      id="catalogue-item-manufacturer-input"
                      options={manufacturerList ?? []}
                      size="small"
                      isOptionEqualToValue={(option, value) =>
                        option.name === value.name
                      }
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required={true}
                          label="Manufacturer"
                          error={!!errorsStep1.manufacturer_id}
                          helperText={errorsStep1.manufacturer_id?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                <Tooltip title="Add Manufacturer">
                  <span>
                    <IconButton
                      sx={{ mx: '4px', my: '2px' }}
                      onClick={() => setAddManufacturerDialogOpen(true)}
                      aria-label="add manufacturer"
                    >
                      <AddIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
            <ManufacturerDialog
              open={addManufacturerDialogOpen}
              onClose={() => setAddManufacturerDialogOpen(false)}
              type="post"
            />

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-notes-input"
                label="Notes"
                size="small"
                {...registerStep1('notes')}
                multiline
                minRows={5}
                fullWidth
              />
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
                              control={controlStep2}
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
                                        !!errorsStep2?.properties?.[index]
                                          ?.value?.value
                                      }
                                      helperText={
                                        errorsStep2?.properties?.[index]?.value
                                          ?.value?.message as string
                                      }
                                    />
                                  )}
                                />
                              )}
                            />
                          ) : property.allowed_values ? (
                            <Controller
                              control={controlStep2}
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
                                        !!errorsStep2?.properties?.[index]
                                          ?.value?.value
                                      }
                                      helperText={
                                        errorsStep2?.properties?.[index]?.value
                                          ?.value?.message as string
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
                              {...registerStep2(
                                `properties.${index}.value.value`
                              )}
                              required={property.mandatory ?? false}
                              fullWidth
                              error={
                                !!errorsStep2?.properties?.[index]?.value?.value
                              }
                              helperText={
                                errorsStep2?.properties?.[index]?.value?.value
                                  ?.message as string
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
                  No catalogue item properties
                </Typography>
                <Typography sx={{ textAlign: 'center' }}>
                  Please click the Finish button
                </Typography>
              </Box>
            )}
          </Grid>
        );
    }
  };
  return (
    <Dialog
      PaperProps={{ sx: { height: '850px' } }}
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>{`${
        requestType === 'patch' ? 'Edit' : 'Add'
      } Catalogue Item`}</DialogTitle>
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
                  {index === 1 && 'Invalid catalogue item properties'}
                  {index === 0 && 'Invalid details'}
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
              isEditPending ||
              isAddPending ||
              Object.values(errorsStep1).length !== 0 ||
              Object.values(errorsStep2).length !== 0
            }
            onClick={handleFinish}
            sx={{ mr: 3 }}
            endIcon={
              isAddPending || isEditPending ? (
                <CircularProgress size={16} />
              ) : null
            }
          >
            Finish
          </Button>
        ) : (
          <Button
            disabled={Object.values(errorsStep1).length !== 0}
            onClick={(event) => handleNext(event, activeStep)}
            sx={{ mr: 3 }}
          >
            Next
          </Button>
        )}
      </DialogActions>
      <Box
        sx={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {errorsStep2.root?.formError && (
          <FormHelperText sx={{ marginBottom: 2, textAlign: 'center' }} error>
            {errorsStep2.root?.formError.message}
          </FormHelperText>
        )}
      </Box>
    </Dialog>
  );
}

export default CatalogueItemsDialog;
