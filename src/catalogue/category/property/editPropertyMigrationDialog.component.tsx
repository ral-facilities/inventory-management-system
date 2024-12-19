import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
  EditPropertyMigration,
} from '../../../app.types';
import { CatalogueCategoryPropertyPatchSchema } from '../../../form.schemas';
import { transformAllowedValues } from '../catalogueCategoryDialog.component';
import { MigrationWarningMessage } from './addPropertyMigrationDialog.component';
import AllowedValuesListTextFields from './allowedValuesListTextFields.component';

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
            <MigrationWarningMessage
              isChecked={isTermsAndConditionsChecked}
              setIsChecked={setIsTermsAndConditionsChecked}
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
