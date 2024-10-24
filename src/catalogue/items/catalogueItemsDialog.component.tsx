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
  Property,
  PropertyPost,
} from '../../api/api.types';
import {
  usePatchCatalogueItem,
  usePostCatalogueItem,
} from '../../api/catalogueItems';
import { useGetManufacturers } from '../../api/manufacturers';
import {
  CatalogueItemDetailsStep,
  CatalogueItemDetailsStepPost,
  PropertiesStep,
  PropertyValue,
} from '../../app.types';
import {
  CatalogueItemDetailsStepSchema,
  PropertiesStepSchema,
  RequestType,
} from '../../form.schemas';
import handleIMS_APIError from '../../handleIMS_APIError';
import ManufacturerDialog from '../../manufacturer/manufacturerDialog.component';
import { sortDataList } from '../../utils';

const RECENT_MANUFACTURER_CUTOFF_TIME = 10 * 60 * 1000;

function toCatalogueItemDetailsStep(
  item: CatalogueItem | undefined
): CatalogueItemDetailsStep {
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
      expected_lifetime_days: '',
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
    expected_lifetime_days:
      item.expected_lifetime_days !== null
        ? String(item.expected_lifetime_days)
        : '',
    item_model_number: item.item_model_number ?? '',
    notes: item.notes ?? '',
  };
}

export function convertToPropertyValueList(
  catalogueCategory?: CatalogueCategory,
  properties?: Property[]
): PropertyValue[] {
  const catalogueCategoryProperties = catalogueCategory?.properties || [];
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

export function convertToPropertyPost(
  propertyValues: PropertyValue[]
): PropertyPost[] {
  return propertyValues.map((propertyValue) => {
    return {
      id: propertyValue.value.av_placement_id,
      value: propertyValue.value.value ?? null,
    };
  });
}

function convertToCatalogueItemDetailsStepPost(
  item: CatalogueItemDetailsStep
): CatalogueItemDetailsStepPost {
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
    expected_lifetime_days: item.expected_lifetime_days
      ? Number(item.expected_lifetime_days)
      : null, // Convert if not null
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

  const CatalogueItemDetailsStepFormMethods = useForm<CatalogueItemDetailsStep>(
    {
      resolver: zodResolver(CatalogueItemDetailsStepSchema(requestType)),
      defaultValues: toCatalogueItemDetailsStep(selectedCatalogueItem),
    }
  );

  const {
    handleSubmit: handleSubmitDetailsStep,
    register: registerDetailsStep,
    formState: { errors: errorsDetailsStep },
    control: controlDetailsStep,
    clearErrors: clearErrorsDetailsStep,
    reset: resetDetailsStep,
    watch: watchDetailsStep,
  } = CatalogueItemDetailsStepFormMethods;

  const catalogueItemPropertiesStepFormMethods = useForm<PropertiesStep>({
    resolver: zodResolver(PropertiesStepSchema),
    defaultValues: {
      properties: convertToPropertyValueList(
        parentInfo,
        selectedCatalogueItem?.properties
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
  } = catalogueItemPropertiesStepFormMethods;

  const handleClose = React.useCallback(() => {
    resetDetailsStep();
    clearErrorsDetailsStep();
    resetPropertiesStep();
    clearErrorsPropertiesStep();
    setActiveStep(0);
    onClose();
  }, [
    clearErrorsDetailsStep,
    clearErrorsPropertiesStep,
    onClose,
    resetDetailsStep,
    resetPropertiesStep,
  ]);

  // Load the values for editing.
  React.useEffect(() => {
    resetDetailsStep(toCatalogueItemDetailsStep(selectedCatalogueItem));
    resetPropertiesStep({
      properties: convertToPropertyValueList(
        parentInfo,
        selectedCatalogueItem?.properties
      ),
    });
  }, [
    parentInfo,
    resetDetailsStep,
    resetPropertiesStep,
    selectedCatalogueItem,
    selectedCatalogueItem?.properties,
  ]);

  // Clears form errors when a value has been changed
  React.useEffect(() => {
    const subscription1 = watchDetailsStep(() =>
      clearErrorsPropertiesStep('root.formError')
    );
    return () => subscription1.unsubscribe();
  }, [clearErrorsPropertiesStep, watchDetailsStep]);

  React.useEffect(() => {
    const subscription = watchPropertiesStep(() =>
      clearErrorsPropertiesStep('root.formError')
    );
    return () => subscription.unsubscribe();
  }, [clearErrorsPropertiesStep, watchPropertiesStep]);

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

        const isExpectedLifetimeDaysUpdated =
          data.expected_lifetime_days !==
          selectedCatalogueItem.expected_lifetime_days;

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
        if (isExpectedLifetimeDaysUpdated)
          catalogueItem.expected_lifetime_days = data.expected_lifetime_days;
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
                  setErrorPropertiesStep('root.formError', {
                    message: response.detail,
                  });
                }
                return;
              }
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
    [
      selectedCatalogueItem,
      patchCatalogueItem,
      handleClose,
      setErrorPropertiesStep,
    ]
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
          return handleSubmitDetailsStep(() => {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
          })(event);
        case 1:
          return false;
      }
    },
    [handleSubmitDetailsStep]
  );

  const handleFinish = React.useCallback(
    async (event: React.SyntheticEvent) => {
      let DetailsStepData: CatalogueItemDetailsStep | undefined;
      let PropertiesStepData: PropertiesStep | undefined;

      // Wrap the handleSubmit call for Step 1 in a promise
      await handleSubmitDetailsStep((validData) => {
        DetailsStepData = validData; // If valid, set the data
      })(event);

      await handleSubmitPropertiesStep((validData) => {
        PropertiesStepData = validData; // If valid, set the data
      })(event);

      if (!DetailsStepData) return;
      if (!PropertiesStepData) return;

      const data: CatalogueItemPost = {
        ...convertToCatalogueItemDetailsStepPost(DetailsStepData),
        properties: convertToPropertyPost(PropertiesStepData.properties),
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
      handleSubmitDetailsStep,
      handleSubmitPropertiesStep,
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
          return Object.values(errorsDetailsStep).length !== 0;
        case 1: {
          return (
            Object.keys(errorsPropertiesStep).filter((val) => val !== 'root')
              .length !== 0
          );
        }
      }
    },
    [errorsDetailsStep, errorsPropertiesStep]
  );

  const options = (): Array<Manufacturer & { isRecent: string }> => {
    const classifiedManufacturers = manufacturerList
      ? manufacturerList.map((option) => {
          return {
            ...option,
            isRecent: 'A-Z',
          };
        })
      : [];

    //duplicating the recent manufacturers, so that they appear twice.
    const currentDate = new Date().getTime();
    const recentManufacturers = classifiedManufacturers
      .filter((option) => {
        const createdDate = new Date(option.created_time).getTime();
        const isRecent =
          currentDate - RECENT_MANUFACTURER_CUTOFF_TIME <= createdDate;
        return isRecent;
      })
      .map((option) => {
        return {
          ...option,
          isRecent: 'Recently Added',
        };
      });

    /*returns them in reverse alphabetical order, since they will be sorted by "isRecent",
    and then reversed to put "Recently Added" section first */
    return sortDataList(recentManufacturers, 'name')
      .reverse()
      .concat(sortDataList(classifiedManufacturers, 'name').reverse());
  };

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
                {...registerDetailsStep('name')}
                fullWidth
                error={!!errorsDetailsStep.name}
                helperText={errorsDetailsStep.name?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="catalogue-item-description-input"
                label="Description"
                size="small"
                {...registerDetailsStep('description')}
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
                {...registerDetailsStep('cost_gbp')}
                error={!!errorsDetailsStep.cost_gbp}
                helperText={errorsDetailsStep.cost_gbp?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-cost-rework-input"
                label="Cost to rework (£)"
                size="small"
                {...registerDetailsStep('cost_to_rework_gbp')}
                error={!!errorsDetailsStep.cost_to_rework_gbp}
                helperText={errorsDetailsStep.cost_to_rework_gbp?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-replace-input"
                label="Time to replace (days)"
                size="small"
                required={true}
                {...registerDetailsStep('days_to_replace')}
                error={!!errorsDetailsStep.days_to_replace}
                helperText={errorsDetailsStep.days_to_replace?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-rework-input"
                label="Time to rework (days)"
                size="small"
                {...registerDetailsStep('days_to_rework')}
                error={!!errorsDetailsStep.days_to_rework}
                helperText={errorsDetailsStep.days_to_rework?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-drawing-number-input"
                label="Drawing number"
                size="small"
                {...registerDetailsStep('drawing_number')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-drawing-link-input"
                label="Drawing link"
                size="small"
                {...registerDetailsStep('drawing_link')}
                error={!!errorsDetailsStep.drawing_link}
                helperText={errorsDetailsStep.drawing_link?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-expected-lifetime-days-input"
                label="Expected Lifetime (days)"
                size="small"
                {...registerDetailsStep('expected_lifetime_days')}
                error={!!errorsDetailsStep.expected_lifetime_days}
                helperText={errorsDetailsStep.expected_lifetime_days?.message}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="catalogue-item-model-input"
                label="Model number"
                size="small"
                {...registerDetailsStep('item_model_number')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} style={{ display: 'flex' }}>
              <Grid item xs={11}>
                <Controller
                  control={controlDetailsStep}
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
                      disableClearable
                      options={
                        sortDataList(options(), 'isRecent').reverse() ?? []
                      }
                      groupBy={(option) => option.isRecent}
                      size="small"
                      isOptionEqualToValue={(option, value) =>
                        option.name === value.name
                      }
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          label="Manufacturer"
                          error={!!errorsDetailsStep.manufacturer_id}
                          helperText={
                            errorsDetailsStep.manufacturer_id?.message
                          }
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
                {...registerDetailsStep('notes')}
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
              Object.values(errorsDetailsStep).length !== 0 ||
              Object.values(errorsPropertiesStep).length !== 0
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
            disabled={Object.values(errorsDetailsStep).length !== 0}
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
        {errorsPropertiesStep.root?.formError && (
          <FormHelperText sx={{ marginBottom: 2, textAlign: 'center' }} error>
            {errorsPropertiesStep.root?.formError.message}
          </FormHelperText>
        )}
      </Box>
    </Dialog>
  );
}

export default CatalogueItemsDialog;
