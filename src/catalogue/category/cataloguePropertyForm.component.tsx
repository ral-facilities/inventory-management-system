import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useUnits } from '../../api/units';
import {
  AddCatalogueCategoryPropertyTypes,
  CatalogueCategoryProperty,
  CatalogueItemPropertiesErrorsType,
  Unit,
} from '../../app.types';

export interface CataloguePropertyFormProps {
  type: 'disabled' | 'normal' | 'add migration' | 'edit migration';
  isList: boolean;
  catalogueItemField: AddCatalogueCategoryPropertyTypes;
  handleChange: (
    field: keyof AddCatalogueCategoryPropertyTypes,
    value: string | boolean | null
  ) => void;
  handleDeleteField?: () => void;
  handleChangeListValues: (av_placement_id: string, value: string) => void;
  handleAddListValue: () => void;
  handleDeleteListValue: (av_placement_id: string) => void;
  catalogueItemPropertyMessage: (
    field: keyof AddCatalogueCategoryPropertyTypes
  ) => Omit<CatalogueItemPropertiesErrorsType, 'cip_placement_id'> | undefined;
  allowedValuesListErrorMessage: (av_placement_id: string) => string;
  hasAllowedValuesList?: () => boolean;
  cip_placement_id?: string;
  currentCatalogueItemField?: CatalogueCategoryProperty;
}

function CataloguePropertyForm(props: CataloguePropertyFormProps) {
  const {
    type,
    catalogueItemField,
    handleChange,
    handleDeleteField,
    handleAddListValue,
    handleChangeListValues,
    handleDeleteListValue,
    catalogueItemPropertyMessage,
    allowedValuesListErrorMessage,
    hasAllowedValuesList,
    cip_placement_id,
    isList,
    currentCatalogueItemField,
  } = props;

  const { data: units } = useUnits();

  return (
    <Stack direction={isList ? 'row' : 'column'} spacing={1} padding={0.5}>
      <TextField
        label="Property Name"
        variant="outlined"
        required={true}
        value={catalogueItemField.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={!!catalogueItemPropertyMessage('name')}
        helperText={catalogueItemPropertyMessage('name')?.errors?.errorMessage}
        sx={{
          width: isList ? '150px' : '100%',
          minWidth: isList ? '150px' : undefined,
        }}
        disabled={type === 'disabled'}
      />
      <FormControl
        disabled={type === 'disabled' || type === 'edit migration'}
        sx={{
          width: isList ? '150px' : '100%',
          minWidth: isList ? '150px' : undefined,
        }}
      >
        <InputLabel
          error={!!catalogueItemPropertyMessage('type')}
          required={true}
          id={`catalogue-properties-form-select-type-label${cip_placement_id ?? ''}`}
        >
          Select Type
        </InputLabel>
        <Select
          value={
            catalogueItemField.type === 'string'
              ? 'text'
              : catalogueItemField.type
          }
          onChange={(e) => {
            handleChange(
              'type',
              e.target.value === 'text' ? 'string' : e.target.value
            );
          }}
          error={!!catalogueItemPropertyMessage('type')}
          label="Select Type"
          labelId={`catalogue-properties-form-select-type-label${cip_placement_id ?? ''}`}
          required={true}
        >
          <MenuItem value="boolean">Boolean</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="text">Text</MenuItem>
        </Select>
        {catalogueItemPropertyMessage('type') && (
          <FormHelperText error>
            {catalogueItemPropertyMessage('type')?.errors?.errorMessage}
          </FormHelperText>
        )}
      </FormControl>
      <FormControl
        disabled={
          catalogueItemField.type === 'boolean' ||
          type === 'disabled' ||
          type === 'edit migration'
        }
        sx={{
          width: isList ? '200px' : '100%',
          minWidth: isList ? '200px' : undefined,
        }}
      >
        <InputLabel
          required={true}
          id={`catalogue-properties-form-select-allowed-values-label${cip_placement_id ?? ''}`}
        >
          Select Allowed values
        </InputLabel>
        <Select
          value={catalogueItemField.allowed_values?.type ?? 'any'}
          onChange={(e) => {
            handleChange('allowed_values', e.target.value);
          }}
          label="Select Allowed values"
          labelId={`catalogue-properties-form-select-allowed-values-label${cip_placement_id ?? ''}`}
          required={true}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value="list">List</MenuItem>
        </Select>
      </FormControl>
      {catalogueItemField.allowed_values &&
        catalogueItemField.allowed_values.type === 'list' && (
          <Stack
            direction="column"
            sx={{
              width: isList ? '200px' : '100%',
              minWidth: isList ? '200px' : undefined,
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {catalogueItemField.allowed_values.values.map((listValue) => {
              const initialAllowedValuePlacementIds =
                currentCatalogueItemField?.allowed_values?.values.map(
                  (val) => val.av_placement_id
                );

              return (
                <Stack
                  key={listValue.av_placement_id}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    width: '100%',
                  }}
                  spacing={1}
                >
                  <TextField
                    sx={{
                      width: isList ? undefined : '100%',
                      minWidth: isList ? '150px' : undefined,
                    }}
                    label={`List Item`}
                    aria-label={`List Item`}
                    data-testid={`${listValue.av_placement_id}: List Item`}
                    variant="outlined"
                    value={listValue.value as string}
                    disabled={
                      type === 'disabled' ||
                      initialAllowedValuePlacementIds?.includes(
                        listValue.av_placement_id
                      )
                    }
                    onChange={(e) =>
                      catalogueItemField.allowed_values &&
                      handleChangeListValues(
                        listValue.av_placement_id,
                        e.target.value as string
                      )
                    }
                    error={
                      !!allowedValuesListErrorMessage(listValue.av_placement_id)
                    }
                    helperText={allowedValuesListErrorMessage(
                      listValue.av_placement_id
                    )}
                  />
                  {type !== 'disabled' &&
                    !initialAllowedValuePlacementIds?.includes(
                      listValue.av_placement_id
                    ) && (
                      <IconButton
                        key={listValue.av_placement_id}
                        aria-label={`Delete list item`}
                        data-testid={`${listValue.av_placement_id}: Delete list item`}
                        onClick={() =>
                          handleDeleteListValue(listValue.av_placement_id)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                </Stack>
              );
            })}
            {type !== 'disabled' && (
              <IconButton
                aria-label={`Add list item`}
                onClick={() => handleAddListValue()}
              >
                <AddIcon />
              </IconButton>
            )}

            {catalogueItemPropertyMessage('allowed_values') && (
              <FormHelperText error>
                {
                  catalogueItemPropertyMessage('allowed_values')?.errors
                    ?.errorMessage
                }
              </FormHelperText>
            )}
          </Stack>
        )}

      {type === 'add migration' &&
        !isList &&
        (catalogueItemField.allowed_values?.type === 'list' ? (
          <Autocomplete
            sx={{
              width: '100%',
            }}
            options={
              catalogueItemField.allowed_values.values.filter(
                (val) => val.value
              ) ?? []
            }
            getOptionLabel={(option) => option.value}
            getOptionKey={(option) => option.av_placement_id}
            value={
              catalogueItemField.allowed_values.values.find(
                (allowedValue) =>
                  allowedValue.value === catalogueItemField.default_value
              ) || null
            }
            onChange={(_event, newValue) => {
              handleChange('default_value', newValue ? newValue.value : '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Default value"
                variant="outlined"
                required={catalogueItemField.mandatory}
                error={!!catalogueItemPropertyMessage('default_value')}
                helperText={
                  catalogueItemPropertyMessage('default_value')?.errors
                    ?.errorMessage
                }
              />
            )}
          />
        ) : catalogueItemField.type === 'boolean' ? (
          <Autocomplete
            sx={{
              width: '100%',
            }}
            options={['true', 'false']}
            value={
              catalogueItemField.default_value
                ? String(catalogueItemField.default_value)
                : null
            }
            onChange={(_event, newValue) => {
              handleChange('default_value', newValue || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Default value"
                variant="outlined"
                required={catalogueItemField.mandatory}
                error={!!catalogueItemPropertyMessage('default_value')}
                helperText={
                  catalogueItemPropertyMessage('default_value')?.errors
                    ?.errorMessage
                }
              />
            )}
          />
        ) : (
          <TextField
            required={catalogueItemField.mandatory}
            label="Default value"
            id={`catalogue-category-form-data-default-value-${cip_placement_id}`}
            variant="outlined"
            value={catalogueItemField.default_value ?? ''}
            onChange={(e) => handleChange('default_value', e.target.value)}
            error={!!catalogueItemPropertyMessage('default_value')}
            helperText={
              catalogueItemPropertyMessage('default_value')?.errors
                ?.errorMessage
            }
            sx={{
              width: '100%',
            }}
          />
        ))}
      <Autocomplete
        sx={{
          width: isList ? '200px' : '100%',
          minWidth: isList ? '200px' : undefined,
        }}
        options={units ?? []}
        getOptionLabel={(option) => option.value}
        value={
          units?.find((unit) => unit.id === catalogueItemField.unit_id) || null
        }
        disabled={
          catalogueItemField.type === 'boolean' ||
          type === 'disabled' ||
          type === 'edit migration'
        }
        onChange={(_event, newValue: Unit | null) => {
          handleChange('unit_id', newValue?.id || null);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Unit"
            variant="outlined"
            disabled={
              catalogueItemField.type === 'boolean' ||
              type === 'disabled' ||
              type === 'edit migration'
            }
          />
        )}
      />
      <FormControl
        disabled={type === 'disabled' || type === 'edit migration'}
        sx={{
          width: isList ? '150px' : '100%',
          minWidth: isList ? '150px' : undefined,
        }}
      >
        <InputLabel
          id={`catalogue-properties-form-select-mandatory-label${cip_placement_id ?? ''}`}
        >
          Select is mandatory?
        </InputLabel>
        <Select
          value={catalogueItemField.mandatory ? 'yes' : 'no'}
          onChange={(e) => handleChange('mandatory', e.target.value === 'yes')}
          label="Select is mandatory?"
          labelId={`catalogue-properties-form-select-mandatory-label${cip_placement_id ?? ''}`}
        >
          <MenuItem value="yes">Yes</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </Select>
      </FormControl>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            marginLeft:
              hasAllowedValuesList && hasAllowedValuesList()
                ? 'auto'
                : undefined,
          }}
        >
          {type !== 'disabled' && isList && (
            <IconButton
              aria-label={'Delete catalogue Item Field entry'}
              onClick={() => handleDeleteField && handleDeleteField()}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Stack>
  );
}

export default CataloguePropertyForm;
