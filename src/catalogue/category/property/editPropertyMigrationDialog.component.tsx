import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import React from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import {
  AllowedValuesListType,
  CatalogueCategory,
  CatalogueCategoryPropertyPatch,
  CatalogueCategoryPropertyType,
} from '../../../api/api.types';
import { usePatchCatalogueCategoryProperty } from '../../../api/catalogueCategories';
import { useGetUnits } from '../../../api/units';
import {
  AddCatalogueCategoryPropertyWithPlacementIds,
  AddPropertyMigration,
  EditPropertyMigration,
} from '../../../app.types';
import WarningMessage from '../../../common/warningMessage.component';
import { CatalogueCategoryPropertyPatchSchema } from '../../../form.schemas';
import { transformAllowedValues } from '../catalogueCategoryDialog.component';
import { migrationWarningMessageText } from './addPropertyMigrationDialog.component';

const AllowedValuesListTextFields = (props: {
  property: AddCatalogueCategoryPropertyWithPlacementIds;
}) => {
  const { property } = props;
  const {
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext<AddPropertyMigration>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `allowed_values.values.values`, // Adjust the field name according to your data structure
  });
  const allowedValuesIds = property.allowed_values?.values.values.map(
    (val) => val.av_placement_id
  );

  const clearDuplicateValueErrors = React.useCallback(() => {
    const allowedValuesErrors = errors?.allowed_values;
    const errorIndexes =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((allowedValuesErrors?.values?.values as any[]) || [])
        .map((error, index) => {
          if (error?.value?.message === 'Duplicate value.') {
            return index;
          }
          return -1;
        })
        .filter((index) => index !== -1);

    errorIndexes.forEach((errorIndex) => {
      clearErrors(`allowed_values.values.values.${errorIndex}`);
    });
  }, [clearErrors, errors]);

  return (
    <>
      {fields.map((field, index) => {
        return (
          <Stack
            key={field.av_placement_id}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }}
            spacing={1}
          >
            <Controller
              control={control}
              name={`allowed_values.values.values.${index}`}
              render={({ field: controllerField }) => (
                <TextField
                  disabled={allowedValuesIds?.includes(field.av_placement_id)}
                  id={`list-item-input-${controllerField.value.av_placement_id}`}
                  label={`List item`}
                  variant="outlined"
                  fullWidth
                  {...controllerField}
                  value={controllerField.value.value}
                  onChange={(event) => {
                    controllerField.onChange({
                      av_placement_id: controllerField.value.av_placement_id,
                      value: event.target.value,
                    });
                    clearDuplicateValueErrors();
                  }}
                  error={
                    !!errors?.allowed_values?.values?.values?.[index]?.value
                  }
                  helperText={
                    errors?.allowed_values?.values?.values?.[index]?.value
                      ?.message as string
                  }
                />
              )}
            />

            {!allowedValuesIds?.includes(field.av_placement_id) && (
              <Tooltip title="Delete Allowed Value">
                <span>
                  <IconButton
                    aria-label={`Delete list item`}
                    onClick={() => {
                      remove(index);
                      clearDuplicateValueErrors();
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        );
      })}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Tooltip title="Add Allowed Value">
          <span>
            <IconButton
              aria-label={`Add list item`}
              onClick={() =>
                append({ av_placement_id: crypto.randomUUID(), value: '' })
              }
            >
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </>
  );
};

export interface EditPropertyMigrationDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueCategory: CatalogueCategory;
  selectedProperty: AddCatalogueCategoryPropertyWithPlacementIds;
}

const EditPropertyMigrationDialog = (
  props: EditPropertyMigrationDialogProps
) => {
  const { open, onClose, catalogueCategory, selectedProperty } = props;

  const formMethods = useForm<EditPropertyMigration>({
    resolver: zodResolver(CatalogueCategoryPropertyPatchSchema),
    defaultValues: {
      name: selectedProperty.name,
      allowed_values: selectedProperty.allowed_values,
    },
  });

  const { data: units } = useGetUnits();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    clearErrors,
    setError,
    reset,
  } = formMethods;

  const handleClose = React.useCallback(() => {
    reset();
    clearErrors();
    onClose();
    setIsTermsAndConditionsChecked(false);
  }, [clearErrors, onClose, reset]);

  const property = watch();

  const { mutate: patchCatalogueCategoryProperty } =
    usePatchCatalogueCategoryProperty();

  const propertyAPIFormat = catalogueCategory.properties.find(
    (prop) => prop.name === selectedProperty.name
  );

  const handleEditPropertyMigration = React.useCallback(
    (property: CatalogueCategoryPropertyPatch) => {
      const propertyNames = catalogueCategory.properties
        .map((prop) => prop.name)
        .filter((name) => name !== selectedProperty.name);

      if (property.name && propertyNames.includes(property.name)) {
        setError('name', {
          message: 'Duplicate property name. Please change the name.',
        });
        return;
      }
      const patchProperty: CatalogueCategoryPropertyPatch = {};
      const isNameUpdated = property.name !== propertyAPIFormat?.name;

      const isAllowedValuesUpdated =
        JSON.stringify(property.allowed_values?.values) !==
        JSON.stringify(propertyAPIFormat?.allowed_values?.values);

      if (isNameUpdated) patchProperty.name = property.name;
      if (isAllowedValuesUpdated)
        patchProperty.allowed_values = property.allowed_values;

      if (propertyAPIFormat?.id && (isNameUpdated || isAllowedValuesUpdated)) {
        patchCatalogueCategoryProperty({
          catalogueCategory,
          property: patchProperty,
          propertyId: propertyAPIFormat.id,
        });
      } else {
        setError('name', {
          message:
            'There have been no changes made. Please change the name field value or press Close.',
        });
        return;
      }
      handleClose();
    },
    [
      catalogueCategory,
      handleClose,
      patchCatalogueCategoryProperty,
      propertyAPIFormat,
      selectedProperty,
      setError,
    ]
  );

  const onSubmit = (data: EditPropertyMigration) => {
    const transformedData: CatalogueCategoryPropertyPatch = {
      name: data.name,
      ...(data.allowed_values && {
        allowed_values: transformAllowedValues(data.allowed_values),
      }),
    };

    handleEditPropertyMigration(transformedData);
  };

  const [isTermsAndConditionsChecked, setIsTermsAndConditionsChecked] =
    React.useState(false);

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Property</DialogTitle>
      <DialogContent sx={{ pb: 0.5 }}>
        <Stack direction="column" spacing={1} px={0.5} py={1}>
          <TextField
            id={crypto.randomUUID()}
            label="Property Name"
            variant="outlined"
            required
            {...register('name')}
            error={!!errors?.name}
            helperText={errors?.name?.message}
            fullWidth
          />
          <Autocomplete
            id={crypto.randomUUID()}
            disableClearable
            disabled
            value={(
              Object.keys(CatalogueCategoryPropertyType) as Array<
                keyof typeof CatalogueCategoryPropertyType
              >
            ).find(
              (key) =>
                CatalogueCategoryPropertyType[key] === selectedProperty.type
            )}
            fullWidth
            options={Object.keys(CatalogueCategoryPropertyType)}
            isOptionEqualToValue={(option, value) =>
              option == value || value == ''
            }
            renderInput={(params) => (
              <TextField
                {...params}
                disabled
                required={true}
                label="Select Type"
                variant="outlined"
              />
            )}
          />

          <Autocomplete
            disableClearable
            disabled
            id={crypto.randomUUID()}
            value={
              (
                Object.keys(AllowedValuesListType) as Array<
                  keyof typeof AllowedValuesListType
                >
              ).find(
                (key) =>
                  AllowedValuesListType[key] ===
                  selectedProperty.allowed_values?.type
              ) ?? 'Any'
            }
            fullWidth
            options={Object.keys(AllowedValuesListType)}
            isOptionEqualToValue={(option, value) =>
              option.toLowerCase() == value.toLowerCase() || value == ''
            }
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Select Allowed values"
                variant="outlined"
                disabled
              />
            )}
          />

          {property.allowed_values?.type === 'list' && (
            <Stack direction="column" spacing={1}>
              <FormProvider {...formMethods}>
                <AllowedValuesListTextFields property={selectedProperty} />
              </FormProvider>
            </Stack>
          )}

          <Autocomplete
            disabled
            options={units ?? []}
            getOptionLabel={(option) => option.value}
            value={
              units?.find((unit) => unit.id === selectedProperty.unit_id) ||
              null
            }
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Unit"
                variant="outlined"
                disabled
              />
            )}
          />

          <Autocomplete
            disableClearable
            disabled
            id={crypto.randomUUID()}
            value={selectedProperty.mandatory === 'true' ? 'Yes' : 'No'}
            fullWidth
            options={['Yes', 'No']}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select is mandatory?"
                variant="outlined"
                disabled
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Grid container px={1.5}>
          <Grid item sx={{ width: '100%' }}>
            <WarningMessage
              isChecked={isTermsAndConditionsChecked}
              setIsChecked={setIsTermsAndConditionsChecked}
              message={migrationWarningMessageText}
            />
          </Grid>
          <Grid
            item
            display="flex"
            sx={{ width: '100%', marginTop: 2, marginBottom: 1 }}
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
                Object.values(errors).length !== 0 ||
                !isTermsAndConditionsChecked
              }
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default EditPropertyMigrationDialog;
