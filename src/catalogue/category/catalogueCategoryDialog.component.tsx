import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import {
  useAddCatalogueCategory,
  useEditCatalogueCategory,
} from '../../api/catalogueCategory';
import {
  AddCatalogueCategory,
  CatalogueCategory,
  EditCatalogueCategory,
  CatalogueItemPropertyType,
  ErrorParsing,
  AllowedValuesListType,
} from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { numberListParser, trimStringValues } from '../../utils';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodIssue, z } from 'zod';
import { useUnits } from '../../api/units';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const AllowedValuesListSchema = z.object({
  type: z.string().nullable().optional(),
  values: z
    .array(z.any())
    .transform((values) => {
      if (values && Array.isArray(values)) {
        return values.map((value) =>
          typeof value === 'string' ? value.trim() : value
        );
      }
    })
    .optional(),
});

const CatalogueCategoryFormDataSchema = z
  .object({
    name: z.string().trim().min(1, { message: 'Please enter a property name' }),
    type: z.nativeEnum(CatalogueItemPropertyType),
    unit: z
      .string()
      .optional()
      .nullable()
      .or(z.literal('').transform(() => undefined)),
    mandatory: z.boolean(),
    allowed_values: AllowedValuesListSchema.optional(),
  })
  .transform((data) => {
    const { type, unit, allowed_values } = data;

    const parsedAllowedValuesList = allowed_values?.values
      ? type === 'number'
        ? numberListParser.parse(allowed_values.values)
        : allowed_values.values
      : undefined;

    return {
      ...data,
      unit: type === 'boolean' ? undefined : unit,
      allowed_values:
        type !== 'boolean'
          ? allowed_values?.type === 'list'
            ? {
                type: data.allowed_values?.type,
                values: parsedAllowedValuesList,
              }
            : null
          : null,
    };
  })
  .superRefine((data, ctx) => {
    if (
      data.allowed_values &&
      data.allowed_values.type === 'list' &&
      (!data.allowed_values.values || data.allowed_values.values.length < 1)
    ) {
      ctx.addIssue({
        path: ['allowed_values', 'values'],
        message: 'Please create a valid list item',
        code: 'custom',
      });
    }

    if (data.allowed_values) {
      data.allowed_values.values?.forEach((value, index) => {
        if (data.type === 'string' && !value.trim()) {
          ctx.addIssue({
            path: ['allowed_values', 'values', index],
            message: 'Please enter a value',
            code: 'custom',
          });
        }

        if (data.type === 'number' && isNaN(value)) {
          ctx.addIssue({
            path: ['allowed_values', 'values', index],
            message: 'Please enter a valid number',
            code: 'custom',
          });
        }
        // Check for duplicate names
        const values = data.allowed_values?.values;
        const duplicateIndices: number[] = [];
        if (values) {
          values.forEach((val, index, arr) => {
            if (typeof val === 'number' && !isNaN(val)) {
              if (
                arr.indexOf(val) !== index &&
                !duplicateIndices.includes(index)
              ) {
                duplicateIndices.push(index);
              }
            } else if (typeof val === 'string' && value.trim()) {
              if (
                arr.indexOf(val) !== index &&
                !duplicateIndices.includes(index) &&
                val.trim()
              ) {
                duplicateIndices.push(index);
              }
            }
          });
        }

        if (duplicateIndices.length > 0) {
          const duplicateIssues: ZodIssue[] = duplicateIndices.map(
            (duplicateIndex) => ({
              path: ['allowed_values', 'values', duplicateIndex],
              message: 'Duplicate value',
              code: 'custom',
            })
          );

          for (let i = 0; i < duplicateIssues.length; i++) {
            ctx.addIssue(duplicateIssues[i]);
          }
        }
      });
    }

    return data;
  });

const CatalogueCategorySchema = z
  .object({
    name: z.string().trim().min(1, { message: 'Please enter a name.' }),
    is_leaf: z.boolean(),
    catalogue_item_properties: z
      .array(CatalogueCategoryFormDataSchema)
      .optional()
      .superRefine((properties, ctx) => {
        // Check for minimum length constraint
        const invalidNames = properties?.filter(
          (property) => property.name.length < 1
        );
        if (invalidNames && invalidNames.length > 0 && properties) {
          const minIssues: ZodIssue[] = invalidNames.map((property) => ({
            path: [properties.indexOf(property), 'name'],
            message: 'Please enter a property name',
            code: 'custom',
          }));

          for (let i = 0; i < minIssues.length; i++) {
            ctx.addIssue(minIssues[i]);
          }
        }

        // Check for duplicate names
        const propertyNames = properties?.map((property) => property.name);
        const duplicateIndices: number[] = [];
        if (propertyNames) {
          propertyNames.forEach((name, index, arr) => {
            if (
              arr.indexOf(name) !== index &&
              !duplicateIndices.includes(index)
            ) {
              duplicateIndices.push(index);
            }
          });
        }

        if (duplicateIndices.length > 0) {
          const duplicateIssues: ZodIssue[] = duplicateIndices.map(
            (duplicateIndex) => ({
              path: [duplicateIndex, 'name'],
              message:
                'Duplicate property name. Please change the name or remove the property',
              code: 'custom',
            })
          );

          for (let i = 0; i < duplicateIssues.length; i++) {
            ctx.addIssue(duplicateIssues[i]);
          }
        }
        return z.NEVER;
      }),
  })
  .transform((data) => {
    const { is_leaf, catalogue_item_properties } = data;

    return {
      ...data,
      catalogue_item_properties: is_leaf
        ? catalogue_item_properties
        : undefined,
    };
  });

interface AllowedValuesListTextFieldsProps {
  nestIndex: number;
  control: Control<CatalogueCategory> | undefined;
  register: UseFormRegister<CatalogueCategory>;
  errors: FieldErrors<CatalogueCategory>; // Update this to match your error type
}

const AllowedValuesListTextFields = (
  props: AllowedValuesListTextFieldsProps
) => {
  const { nestIndex, control, register, errors } = props;

  const { fields, append, remove } = useFieldArray({
    control,
    name: `catalogue_item_properties.${nestIndex}.allowed_values.values`, // Adjust the field name according to your data structure
  });

  return (
    <>
      {fields.map((_field, index) => (
        <Stack
          key={index}
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }}
          spacing={1}
        >
          <TextField
            label={`List Item`}
            aria-label={`List Item ${index}`}
            variant="outlined"
            {...register(
              `catalogue_item_properties.${nestIndex}.allowed_values.values.${index}`
            )}
            error={
              !!errors?.catalogue_item_properties?.[nestIndex]?.allowed_values
                ?.values?.[index]
            }
            helperText={
              errors?.catalogue_item_properties?.[nestIndex]?.allowed_values
                ?.values?.[index]?.message as string
            }
          />

          <IconButton
            aria-label={`Delete list item ${index}`}
            onClick={() => remove(index)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <IconButton
        aria-label={`Add list item ${nestIndex}`}
        onClick={() => append(' ')}
      >
        <AddIcon />
      </IconButton>
      {!!errors?.catalogue_item_properties?.[nestIndex]?.allowed_values
        ?.values && (
        <FormHelperText error>
          {
            errors?.catalogue_item_properties?.[nestIndex]?.allowed_values
              ?.values?.message
          }
        </FormHelperText>
      )}
    </>
  );
};
export interface CatalogueCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  type: 'add' | 'edit' | 'save as';
  selectedCatalogueCategory?: CatalogueCategory;
  resetSelectedCatalogueCategory: () => void;
}

const CatalogueCategoryDialog = React.memo(
  (props: CatalogueCategoryDialogProps) => {
    const {
      open,
      onClose,
      parentId,
      type,
      selectedCatalogueCategory,
      resetSelectedCatalogueCategory,
    } = props;

    const isNotAdding = type !== 'add' && selectedCatalogueCategory;
    const initialCatalogueCategory = isNotAdding
      ? selectedCatalogueCategory
      : {
          name: '',
          parent_id: null,
          is_leaf: false,
          catalogue_item_properties: undefined,
        };

    const [nameError, setNameError] = React.useState<string | undefined>(
      undefined
    );

    const [formError, setFormError] = React.useState<string | undefined>(
      undefined
    );

    const { mutateAsync: addCatalogueCategory, isPending: isAddPending } =
      useAddCatalogueCategory();
    const { mutateAsync: editCatalogueCategory, isPending: isEditPending } =
      useEditCatalogueCategory();

    const { data: units } = useUnits();

    const handleClose = React.useCallback(() => {
      onClose();
      setNameError(undefined);
      setFormError(undefined);
      resetSelectedCatalogueCategory();
    }, [onClose, resetSelectedCatalogueCategory]);

    const {
      handleSubmit,
      register,
      formState: { errors },
      watch,
      control,
      resetField,
    } = useForm({
      resolver: zodResolver(CatalogueCategorySchema),
      defaultValues: initialCatalogueCategory,
    });
    const { fields, append, remove } = useFieldArray({
      control,
      name: 'catalogue_item_properties', // Adjust the field name according to your data structure
    });
    const isLeaf = watch(`is_leaf`);

    // If any field value changes, clear the state
    React.useEffect(() => {
      if (selectedCatalogueCategory) {
        const subscription = watch(() => setFormError(undefined));
        return () => subscription.unsubscribe();
      }
    }, [selectedCatalogueCategory, watch]);

    const handleAddCatalogueCategory = React.useCallback(
      (catalogueCategory: AddCatalogueCategory) => {
        addCatalogueCategory(trimStringValues(catalogueCategory))
          .then((response) => handleClose())
          .catch((error) => {
            const response = error.response?.data as ErrorParsing;
            if (response && error.response?.status === 409) {
              setNameError(response.detail);
              return;
            }

            handleIMS_APIError(error);
          });
      },
      [addCatalogueCategory, handleClose]
    );

    const handleEditCatalogueCategory = React.useCallback(
      (catalogueCategory: AddCatalogueCategory) => {
        if (selectedCatalogueCategory) {
          const editCatalogueCategoryData: EditCatalogueCategory = {
            id: selectedCatalogueCategory.id,
          };

          const isNameUpdated =
            catalogueCategory.name !== selectedCatalogueCategory?.name;

          const isIsLeafUpdated =
            catalogueCategory.is_leaf !== selectedCatalogueCategory?.is_leaf;
          const isCatalogueItemPropertiesUpdated =
            JSON.stringify(
              catalogueCategory.catalogue_item_properties ?? []
            ) !==
            JSON.stringify(
              selectedCatalogueCategory?.catalogue_item_properties ?? []
            );

          isNameUpdated &&
            (editCatalogueCategoryData.name = catalogueCategory.name);

          isIsLeafUpdated &&
            (editCatalogueCategoryData.is_leaf = catalogueCategory.is_leaf);

          isCatalogueItemPropertiesUpdated &&
            (editCatalogueCategoryData.catalogue_item_properties =
              catalogueCategory.catalogue_item_properties);

          if (
            // Check if id is present
            isNameUpdated ||
            isCatalogueItemPropertiesUpdated ||
            isIsLeafUpdated // Check if any of these properties have been updated
          ) {
            // Only call editCatalogueCategory if id is present and at least one of the properties has been updated
            editCatalogueCategory(editCatalogueCategoryData)
              .then((response) => {
                resetSelectedCatalogueCategory();
                handleClose();
              })
              .catch((error: AxiosError) => {
                const response = error.response?.data as ErrorParsing;
                if (response && error.response?.status === 409) {
                  if (response.detail.includes('child elements'))
                    setFormError(response.detail);
                  else setNameError(response.detail);

                  return;
                }

                handleIMS_APIError(error);
              });
          } else setFormError('Please edit a form entry before clicking save');
        }
      },
      [
        editCatalogueCategory,
        handleClose,
        resetSelectedCatalogueCategory,
        selectedCatalogueCategory,
      ]
    );

    const onSubmit = (data: AddCatalogueCategory) => {
      type === 'edit'
        ? handleEditCatalogueCategory(data)
        : handleAddCatalogueCategory({
            ...data,
            parent_id: parentId ?? undefined,
          });
    };

    return (
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          {type === 'edit'
            ? 'Edit Catalogue Category'
            : 'Add Catalogue Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={1}>
            <Grid item sx={{ mt: 1 }}>
              <TextField
                label="Name"
                required={true}
                {...register('name')}
                sx={{ marginLeft: '4px', marginTop: '8px' }} // Adjusted the width and margin
                error={!!errors.name || nameError !== undefined}
                helperText={errors.name?.message || nameError}
                fullWidth
              />
            </Grid>
            <Grid item>
              <FormControl sx={{ margin: '8px' }}>
                <Controller
                  control={control}
                  name="is_leaf"
                  render={({ field: { value, onChange } }) => (
                    <>
                      <FormLabel id="controlled-radio-buttons-group">
                        Catalogue Directory Content
                      </FormLabel>
                      <RadioGroup
                        aria-labelledby="controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={value}
                        onChange={(e, value) => {
                          onChange(value === 'true');
                          if (!(value === 'true')) {
                            resetField(`catalogue_item_properties`, {
                              defaultValue: [],
                            });
                          }
                        }}
                      >
                        <FormControlLabel
                          value={false}
                          control={<Radio />}
                          label="Catalogue Categories"
                        />
                        <FormControlLabel
                          value={true}
                          control={<Radio />}
                          label="Catalogue Items"
                        />
                      </RadioGroup>
                    </>
                  )}
                />
              </FormControl>
            </Grid>
            {isLeaf && (
              <>
                <Grid item>
                  <Divider sx={{ minWidth: '700px' }} />
                </Grid>
                <Grid item sx={{ paddingLeft: 1, paddingTop: 3 }}>
                  <Typography variant="h6">Catalogue Item Fields</Typography>
                  {fields.map((field, index) => {
                    const allowedValuesType = watch(
                      `catalogue_item_properties.${index}.allowed_values.type`
                    );

                    const type = watch(
                      `catalogue_item_properties.${index}.type`
                    );

                    return (
                      <Stack
                        direction="row"
                        key={index}
                        spacing={1}
                        padding={1}
                      >
                        <TextField
                          label="Property Name"
                          id={`catalogue-category-form-data-name-${index}`}
                          variant="outlined"
                          required={true}
                          {...register(
                            `catalogue_item_properties.${index}.name`
                          )}
                          error={
                            !!errors?.catalogue_item_properties?.[index]?.name
                          }
                          helperText={
                            errors?.catalogue_item_properties?.[index]?.name
                              ?.message
                          }
                          sx={{ minWidth: '200px' }}
                        />
                        <FormControl sx={{ width: '200px', minWidth: '200px' }}>
                          <Controller
                            control={control}
                            name={`catalogue_item_properties.${index}.type`}
                            render={({ field: { value, onChange } }) => (
                              <>
                                <InputLabel
                                  error={
                                    !!errors?.catalogue_item_properties?.[index]
                                      ?.type
                                  }
                                  required={true}
                                  id={`catalogue-properties-form-select-type-label-${index}`}
                                >
                                  Select Type
                                </InputLabel>
                                <Select
                                  labelId={`catalogue-properties-form-select-type-label-${index}`}
                                  value={value}
                                  onChange={(event) => {
                                    onChange(event.target.value);

                                    event.target.value === 'boolean' &&
                                      resetField(
                                        `catalogue_item_properties.${index}.allowed_values.values`
                                      );
                                  }}
                                  error={
                                    !!errors?.catalogue_item_properties?.[index]
                                      ?.type
                                  }
                                  label="Select Type"
                                  required={true}
                                >
                                  {Object.keys(CatalogueItemPropertyType).map(
                                    (key, i) => (
                                      <MenuItem
                                        key={i}
                                        value={
                                          CatalogueItemPropertyType[
                                            key as keyof typeof CatalogueItemPropertyType
                                          ]
                                        }
                                      >
                                        {key}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </>
                            )}
                          />
                        </FormControl>

                        <FormControl
                          disabled={type === 'boolean'}
                          sx={{ width: '200px', minWidth: '200px' }}
                        >
                          <Controller
                            control={control}
                            name={`catalogue_item_properties.${index}.allowed_values.type`}
                            render={({ field: { value, onChange } }) => {
                              return (
                                <>
                                  <InputLabel
                                    error={
                                      !!errors?.catalogue_item_properties?.[
                                        index
                                      ]?.allowed_values?.type
                                    }
                                    required={true}
                                    id={`catalogue-properties-form-select-allowed-values-label-${index}`}
                                  >
                                    Select Allowed values
                                  </InputLabel>
                                  <Select
                                    labelId={`catalogue-properties-form-select-allowed-values-label-${index}`}
                                    value={
                                      type !== 'boolean'
                                        ? value ?? AllowedValuesListType.Any
                                        : AllowedValuesListType.Any
                                    }
                                    onChange={(value) => {
                                      onChange(
                                        value ?? AllowedValuesListType.Any
                                      );
                                    }}
                                    label=" Select Allowed values"
                                    required={true}
                                  >
                                    {Object.keys(AllowedValuesListType).map(
                                      (key, i) => (
                                        <MenuItem
                                          key={i}
                                          value={
                                            AllowedValuesListType[
                                              key as keyof typeof AllowedValuesListType
                                            ]
                                          }
                                        >
                                          {key}
                                        </MenuItem>
                                      )
                                    )}
                                  </Select>
                                </>
                              );
                            }}
                          />
                        </FormControl>

                        {allowedValuesType === 'list' && type !== 'boolean' && (
                          <Stack
                            direction="column"
                            sx={{
                              width: '200px',
                              minWidth: '200px',
                              alignItems: 'center',
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <AllowedValuesListTextFields
                              nestIndex={index}
                              control={control}
                              register={register}
                              errors={errors}
                            />
                          </Stack>
                        )}

                        <FormControl
                          sx={{ minWidth: '200px' }}
                          disabled={type === 'boolean'}
                        >
                          <Controller
                            control={control}
                            name={`catalogue_item_properties.${index}.unit`}
                            render={({ field: { value, onChange } }) => (
                              <Autocomplete
                                options={units ?? []}
                                getOptionLabel={(option) => option.value}
                                value={
                                  units?.find((unit) => unit.value === value) ||
                                  null
                                }
                                disabled={type === 'boolean'}
                                onChange={(_event, unit) => {
                                  onChange(unit?.value ?? null);
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select Unit"
                                    variant="outlined"
                                    disabled={type === 'boolean'}
                                  />
                                )}
                              />
                            )}
                          />
                        </FormControl>

                        <FormControl sx={{ minWidth: '200px' }}>
                          <Controller
                            control={control}
                            name={`catalogue_item_properties.${index}.mandatory`}
                            render={({ field: { value, onChange } }) => (
                              <>
                                <InputLabel
                                  id={`catalogue-properties-form-select-mandatory-label-${index}`}
                                >
                                  Select is mandatory?
                                </InputLabel>
                                <Select
                                  value={value}
                                  onChange={(event) =>
                                    onChange(
                                      String(event.target.value) === 'true'
                                    )
                                  }
                                  label="Select is mandatory?"
                                  labelId={`catalogue-properties-form-select-mandatory-label-${index}`}
                                >
                                  <MenuItem value="true">True</MenuItem>
                                  <MenuItem value="false">False</MenuItem>
                                </Select>
                              </>
                            )}
                          />
                        </FormControl>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <IconButton
                            aria-label={'Delete catalogue category field entry'}
                            onClick={() => remove(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Stack>
                    );
                  })}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton
                      sx={{ margin: '8px' }}
                      onClick={() => {
                        append({
                          name: '',
                          type: CatalogueItemPropertyType.Text,
                          unit: '',
                          mandatory: false,
                          allowed_values: undefined,
                        });
                      }}
                      aria-label={'Add catalogue category field entry'}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', padding: '0px 24px' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
          ></Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              my: 2,
            }}
          >
            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              sx={{ width: '50%', mx: 1 }}
              onClick={handleSubmit(onSubmit)}
              disabled={
                isEditPending ||
                isAddPending ||
                formError !== undefined ||
                nameError !== undefined ||
                Object.values(errors).length !== 0
              }
            >
              Save
            </Button>
          </Box>
          {formError && (
            <FormHelperText sx={{ marginBottom: '16px' }} error>
              {formError}
            </FormHelperText>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);

export default CatalogueCategoryDialog;
