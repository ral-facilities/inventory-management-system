import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
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
import { AxiosError } from 'axios';
import React from 'react';
import {
  useAddCatalogueItem,
  useEditCatalogueItem,
} from '../../api/catalogueItem';
import {
  AddCatalogueItem,
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueItem,
  CatalogueItemDetails,
  CatalogueItemPropertyResponse,
  EditCatalogueItem,
  ErrorParsing,
  Manufacturer,
} from '../../app.types';
import { Autocomplete } from '@mui/material';
import { useManufacturers } from '../../api/manufacturer';
import ManufacturerDialog from '../../manufacturer/manufacturerDialog.component';
import handleIMS_APIError from '../../handleIMS_APIError';
import {
  booleanParser,
  numberParser,
  stringParser,
  trimStringValues,
} from '../../utils';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface CatalogueItemsDialogProps {
  open: boolean;
  onClose: () => void;
  parentInfo: CatalogueCategory;
  selectedCatalogueItem?: CatalogueItem;
  type: 'edit' | 'create' | 'save as';
}

interface PropertiesSchemaType {
  name: string;
  key: string;
  value?: string | number | boolean | null;
}

interface AddCatalogueSchemaType extends CatalogueItemDetails {
  properties: PropertiesSchemaType[];
}

function transformPropertiesData(
  formData: CatalogueCategoryFormData[],
  itemProperties: CatalogueItemPropertyResponse[]
): PropertiesSchemaType[] {
  const transformedData: PropertiesSchemaType[] = [];

  formData.forEach((category) => {
    const matchingProperty = itemProperties.find(
      (item) => item.name === category.name
    );

    if (matchingProperty) {
      transformedData.push({
        name: category.name,
        key: `${category.type}_${category.mandatory}`,
        value: matchingProperty.value,
      });
    } else {
      transformedData.push({
        name: category.name,
        key: `${category.type}_${category.mandatory}`,
        value: category.mandatory ? undefined : null,
      });
    }
  });

  return transformedData;
}
// Define schemas for different types of objects

const numberSchema = z.object({
  name: z.string(),
  key: z.literal('number_true'),
  value: z.number({
    invalid_type_error:
      'Please enter a valid number as this field is mandatory',
    required_error: 'Please enter a valid number as this field is mandatory',
  }),
});

const numberSchemaNullable = z.object({
  name: z.string(),
  key: z.literal('number_false'),
  value: z
    .number({
      invalid_type_error:
        'Please enter a valid number as this field is mandatory',
    })
    .nullable(),
});

const stringSchema = z.object({
  name: z.string(),
  key: z.literal('string_true'),
  value: z
    .string({
      required_error: 'Please enter a valid value as this field is mandatory',
      invalid_type_error:
        'Please enter a valid value as this field is mandatory',
    })
    .trim(),
});

const stringSchemaNullable = z.object({
  name: z.string(),
  key: z.literal('string_false'),
  value: z.string().trim().nullable(),
});

const booleanSchema = z.object({
  name: z.string(),
  key: z.literal('boolean_true'),
  value: z.boolean({
    required_error: 'Please select either True or False',
    invalid_type_error: 'Please select either True or False',
  }),
});

const booleanSchemaNullable = z.object({
  name: z.string(),
  key: z.literal('boolean_false'),
  value: z.boolean().nullable(),
});

// Define a union schema to handle both types of objects

const UnionSchema = z.discriminatedUnion('key', [
  stringSchema,
  stringSchemaNullable,
  numberSchema,
  numberSchemaNullable,
  booleanSchema,
  booleanSchemaNullable,
]);

const CatalogueItemSchema = () => {
  const catalogueItemDetailsSchema = z.object({
    name: z
      .string({ required_error: 'Please enter a name' })
      .trim()
      .min(1, { message: 'Please enter a name' }),
    description: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
    cost_gbp: z.number({
      invalid_type_error: 'Please enter a cost as a valid number',
      required_error: 'Please enter a cost as a valid number',
    }),
    cost_to_rework_gbp: z
      .number({
        invalid_type_error: 'Please enter a cost to rework as a valid number',
      })
      .nullable()
      .transform((val) => (!val ? null : val))
      .optional(),
    days_to_replace: z.number({
      invalid_type_error:
        'Please enter how many days it would take to replace as a valid number',
      required_error:
        'Please enter how many days it would take to replace as a valid number',
    }),
    days_to_rework: z
      .number({
        invalid_type_error:
          'Please enter how many days it would take to rework as a valid number',
      })
      .nullable()
      .transform((val) => (!val ? null : val))
      .optional(),
    drawing_number: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
    drawing_link: z
      .string()
      .trim()
      .url({
        message:
          'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted',
      })
      .optional()
      .nullable()
      .or(z.literal('').transform(() => null)),
    item_model_number: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
    manufacturer_id: z.string({
      required_error: 'Please choose a manufacturer, or add a new manufacturer',
    }),
    notes: z
      .string()
      .trim()
      .transform((val) => (val === '' ? null : val))
      .nullable(),
  });
  return [
    catalogueItemDetailsSchema,
    catalogueItemDetailsSchema.extend({
      properties: z.array(UnionSchema), // Use the accumulated properties
    }),
  ];
};

function CatalogueItemsDialog(props: CatalogueItemsDialogProps) {
  const { open, onClose, parentInfo, selectedCatalogueItem, type } = props;
  const parentId = parentInfo?.id ?? null;
  const parentCatalogueItemPropertiesInfo = React.useMemo(
    () => parentInfo?.catalogue_item_properties ?? [],
    [parentInfo]
  );

  const isNotCreating = type !== 'create' && !!selectedCatalogueItem;
  const emptyCatalogueItem = {
    name: undefined,
    description: null,
    cost_gbp: undefined,
    cost_to_rework_gbp: null,
    days_to_replace: undefined,
    days_to_rework: null,
    drawing_number: null,
    drawing_link: null,
    item_model_number: null,
    manufacturer_id: undefined,
    notes: null,
    properties: [],
    catalogue_category_id: undefined,
    is_obsolete: false,
    obsolete_replacement_catalogue_item_id: null,
    obsolete_reason: null,
  };
  const initialCatalogueItem = isNotCreating
    ? selectedCatalogueItem
    : emptyCatalogueItem;

  const [formErrorMessage, setFormErrorMessage] = React.useState<
    string | undefined
  >(undefined);

  const handleClose = React.useCallback(() => {
    setFormErrorMessage(undefined);
    onClose();
  }, [onClose]);

  // Stepper
  const STEPS = [
    (type === 'edit' ? 'Edit' : 'Add') + ' catalogue item details',
    (type === 'edit' ? 'Edit' : 'Add') + ' catalogue item properties',
  ];
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const {
    handleSubmit,
    formState: { errors },
    control,
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(CatalogueItemSchema()[activeStep]),
    defaultValues: {
      ...initialCatalogueItem,
      properties: transformPropertiesData(
        parentCatalogueItemPropertiesInfo,
        selectedCatalogueItem?.properties ?? []
      ),
    },
    shouldUnregister: false,
    mode: 'onChange',
  });

  // If any field value changes, clear the state
  React.useEffect(() => {
    if (selectedCatalogueItem) {
      const subscription = watch(() => setFormErrorMessage(undefined));
      return () => subscription.unsubscribe();
    }
  }, [selectedCatalogueItem, watch]);
  const { mutateAsync: addCatalogueItem, isPending: isAddPending } =
    useAddCatalogueItem();
  const { mutateAsync: editCatalogueItem, isPending: isEditPending } =
    useEditCatalogueItem();

  const handleAddCatalogueItem = React.useCallback(
    (catalogueItem: AddCatalogueItem) => {
      addCatalogueItem(catalogueItem)
        .then((response) => handleClose())
        .catch((error: AxiosError) => {
          handleIMS_APIError(error);
        });
    },
    [addCatalogueItem, handleClose]
  );

  const handleEditCatalogueItem = React.useCallback(
    (catalogueItemData: EditCatalogueItem) => {
      if (selectedCatalogueItem) {
        const isNameUpdated =
          catalogueItemData.name !== selectedCatalogueItem.name;

        const isDescriptionUpdated =
          catalogueItemData.description !== selectedCatalogueItem.description;

        const isCostGbpUpdated =
          catalogueItemData.cost_gbp !== selectedCatalogueItem.cost_gbp;

        const isCostToReworkGbpUpdated =
          catalogueItemData.cost_to_rework_gbp !==
          selectedCatalogueItem.cost_to_rework_gbp;

        const isDaysToReplaceUpdated =
          catalogueItemData.days_to_replace !==
          selectedCatalogueItem.days_to_replace;

        const isDaysToReworkUpdated =
          catalogueItemData.days_to_rework !==
          selectedCatalogueItem.days_to_rework;

        const isDrawingNumberUpdated =
          catalogueItemData.drawing_number !==
          selectedCatalogueItem.drawing_number;

        const isDrawingLinkUpdated =
          catalogueItemData.drawing_link !== selectedCatalogueItem.drawing_link;

        const isModelNumberUpdated =
          catalogueItemData.item_model_number !==
          selectedCatalogueItem.item_model_number;

        const isCatalogueItemPropertiesUpdated =
          JSON.stringify(catalogueItemData.properties) !==
          JSON.stringify(
            selectedCatalogueItem.properties.map(({ unit, ...rest }) => rest)
          );

        const isManufacturerUpdated =
          JSON.stringify(catalogueItemData.manufacturer_id) !==
          JSON.stringify(selectedCatalogueItem.manufacturer_id);
        let catalogueItem: EditCatalogueItem = {
          id: selectedCatalogueItem.id,
        };

        const isNotesUpdated =
          catalogueItemData.notes !== selectedCatalogueItem.notes;

        isNameUpdated && (catalogueItem.name = catalogueItemData.name);
        isDescriptionUpdated &&
          (catalogueItem.description = catalogueItemData.description);
        isCostGbpUpdated &&
          (catalogueItem.cost_gbp = catalogueItemData.cost_gbp);
        isCostToReworkGbpUpdated &&
          (catalogueItem.cost_to_rework_gbp =
            catalogueItemData.cost_to_rework_gbp);
        isDaysToReplaceUpdated &&
          (catalogueItem.days_to_replace = catalogueItemData.days_to_replace);
        isDaysToReworkUpdated &&
          (catalogueItem.days_to_rework = catalogueItemData.days_to_rework);
        isDrawingNumberUpdated &&
          (catalogueItem.drawing_number = catalogueItemData.drawing_number);
        isDrawingLinkUpdated &&
          (catalogueItem.drawing_link = catalogueItemData.drawing_link);
        isModelNumberUpdated &&
          (catalogueItem.item_model_number =
            catalogueItemData.item_model_number);
        isCatalogueItemPropertiesUpdated &&
          (catalogueItem.properties = catalogueItemData.properties);
        isManufacturerUpdated &&
          (catalogueItem.manufacturer_id = catalogueItemData.manufacturer_id);
        isNotesUpdated && (catalogueItem.notes = catalogueItemData.notes);

        if (
          catalogueItem.id &&
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
          editCatalogueItem(trimStringValues(catalogueItem))
            .then((response) => handleClose())
            .catch((error: AxiosError) => {
              const response = error.response?.data as ErrorParsing;

              if (response && error.response?.status === 409) {
                if (response.detail.includes('child elements')) {
                  setFormErrorMessage(response.detail);
                }
                return;
              }
              handleIMS_APIError(error);
            });
        } else {
          setFormErrorMessage('Please edit a form entry before clicking save');
        }
      }
    },
    [selectedCatalogueItem, editCatalogueItem, handleClose]
  );

  const { data: manufacturerList } = useManufacturers();

  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const handleNext = async () => {
    const isStepValid = await trigger([
      'name',
      'description',
      'cost_gbp',
      'cost_to_rework_gbp',
      'days_to_replace',
      'days_to_rework',
      'drawing_number',
      'drawing_link',
      'item_model_number',
      'manufacturer_id',
    ]);
    if (isStepValid) setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const propertiesErrors = errors.properties;

  // Spread Method to clone errors
  const catalogueItemDetailsErrors = Object.fromEntries(
    Object.entries(errors).filter(([key, _value]) => key !== 'properties')
  );

  const isStepFailed = React.useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return Object.values(catalogueItemDetailsErrors).length !== 0;
        case 1:
          return propertiesErrors !== undefined;
      }
    },
    [catalogueItemDetailsErrors, propertiesErrors]
  );

  const onSubmit = (data: any) => {
    const catalogueItemData: AddCatalogueSchemaType = data;
    type === 'edit'
      ? handleEditCatalogueItem({
          ...catalogueItemData,
          catalogue_category_id: parentId,
          properties: catalogueItemData.properties.map(
            ({ key, ...rest }) => rest
          ),
        } as EditCatalogueItem)
      : handleAddCatalogueItem({
          ...catalogueItemData,
          catalogue_category_id: parentId,
          is_obsolete: false,
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
          properties: catalogueItemData.properties.map(
            ({ key, ...rest }) => rest
          ),
        } as AddCatalogueItem);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid item container spacing={1.5} xs={12}>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    label="Name"
                    size="small"
                    required={true}
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextField
                    label="Description"
                    size="small"
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                    multiline
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="cost_gbp"
                render={({ field }) => (
                  <TextField
                    label="Cost (£)"
                    size="small"
                    required={true}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(numberParser.parse(event.target.value));
                    }}
                    error={!!errors.cost_gbp}
                    helperText={errors.cost_gbp?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="cost_to_rework_gbp"
                render={({ field }) => (
                  <TextField
                    label="Cost to rework (£)"
                    size="small"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(numberParser.parse(event.target.value));
                    }}
                    error={!!errors.cost_to_rework_gbp}
                    helperText={errors.cost_to_rework_gbp?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="days_to_replace"
                render={({ field }) => (
                  <TextField
                    label="Time to replace (days)"
                    size="small"
                    required={true}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(numberParser.parse(event.target.value));
                    }}
                    error={!!errors.days_to_replace}
                    helperText={errors.days_to_replace?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="days_to_rework"
                render={({ field }) => (
                  <TextField
                    label="Time to rework (days)"
                    size="small"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      field.onChange(numberParser.parse(event.target.value));
                    }}
                    error={!!errors.days_to_rework}
                    helperText={errors.days_to_rework?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="drawing_number"
                render={({ field }) => (
                  <TextField
                    label="Drawing number"
                    size="small"
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="drawing_link"
                render={({ field }) => (
                  <TextField
                    label="Drawing link"
                    size="small"
                    {...field}
                    value={field.value ?? ''}
                    error={!!errors.drawing_link}
                    helperText={errors.drawing_link?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                control={control}
                name="item_model_number"
                render={({ field }) => (
                  <TextField
                    label="Model number"
                    size="small"
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} style={{ display: 'flex' }}>
              <Grid item xs={11}>
                <Controller
                  control={control}
                  name="manufacturer_id"
                  render={({ field: { value, onChange } }) => (
                    <Autocomplete
                      value={
                        manufacturerList?.find(
                          (manufacturer) => manufacturer.id === value
                        ) || null
                      }
                      onChange={(
                        _event: any,
                        newManufacturer: Manufacturer | null
                      ) => {
                        onChange(newManufacturer?.id);
                      }}
                      id="manufacturer-autocomplete"
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
                          error={!!errors.manufacturer_id}
                          helperText={errors.manufacturer_id?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  sx={{ mx: '4px', my: '2px' }}
                  onClick={() => setAddManufacturerDialogOpen(true)}
                  aria-label="add manufacturer"
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>
            <ManufacturerDialog
              open={addManufacturerDialogOpen}
              onClose={() => setAddManufacturerDialogOpen(false)}
              type="create"
            />

            <Grid item xs={12}>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <TextField
                    label="Notes"
                    size="small"
                    multiline
                    minRows={5}
                    {...field}
                    value={field.value ?? ''}
                    fullWidth
                  />
                )}
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
                                          onChange={(event) =>
                                            field.onChange(
                                              booleanParser.parse(
                                                event.target.value
                                              )
                                            )
                                          }
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
                                          onChange={(event) =>
                                            field.onChange(event.target.value)
                                          }
                                          label={property.name}
                                          sx={{ alignItems: 'center' }}
                                          fullWidth
                                        >
                                          {property.allowed_values?.values.map(
                                            (value, index) => (
                                              <MenuItem
                                                key={index}
                                                value={value}
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
                                    onChange={(event) =>
                                      field.onChange(
                                        property.type === 'number'
                                          ? numberParser.parse(
                                              event.target.value
                                            )
                                          : stringParser.parse(
                                              event.target.value
                                            )
                                      )
                                    }
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
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>{`${
        type === 'edit' ? 'Edit' : 'Add'
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
              formErrorMessage !== undefined ||
              Object.values(errors).length !== 0
            }
            onClick={handleSubmit(onSubmit)}
            sx={{ mr: 3 }}
          >
            Finish
          </Button>
        ) : (
          <Button
            disabled={
              activeStep === 0 &&
              Object.values(catalogueItemDetailsErrors).length !== 0
            }
            onClick={() => handleNext()}
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
        {formErrorMessage !== undefined && (
          <FormHelperText
            sx={{ marginBottom: '16px', textAlign: 'center' }}
            error
          >
            {formErrorMessage}
          </FormHelperText>
        )}
      </Box>
    </Dialog>
  );
}

export default CatalogueItemsDialog;
