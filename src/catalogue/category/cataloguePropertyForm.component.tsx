import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  FormHelperText,
  IconButton,
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
import { v4 as uuidv4 } from 'uuid';

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
    isList,
    currentCatalogueItemField,
  } = props;

  const { data: units } = useUnits();

  return (
    <Stack direction={isList ? 'row' : 'column'} spacing={1} padding={0.5}>
      <TextField
        id={uuidv4()}
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
      <Autocomplete
        disabled={type === 'disabled' || type === 'edit migration'}
        id={uuidv4()}
        value={
          catalogueItemField.type === 'string'
            ? 'text'
            : catalogueItemField.type
        }
        onChange={(_event, value) => {
          if (value == null) return;
          handleChange(
            'type',
            value.toLowerCase() === 'text' ? 'string' : value.toLowerCase()
          );
        }}
        sx={{
          width: isList ? '200px' : '100%',
          minWidth: isList ? '200px' : undefined,
        }}
        fullWidth
        options={['Boolean', 'Number', 'Text']}
        isOptionEqualToValue={(option, value) =>
          option.toLowerCase() == value.toLowerCase() || value == ''
        }
        renderInput={(params) => (
          <TextField
            {...params}
            required={true}
            label="Select Type"
            variant="outlined"
            error={!!catalogueItemPropertyMessage('type')}
            helperText={
              catalogueItemPropertyMessage('type')?.errors?.errorMessage
            }
          />
        )}
      />
      <Autocomplete
        disabled={
          catalogueItemField.type === 'boolean' ||
          type === 'disabled' ||
          type === 'edit migration'
        }
        id={uuidv4()}
        value={catalogueItemField.allowed_values?.type ?? 'any'}
        onChange={(_event, value) => {
          if (value === null) return;
          handleChange('allowed_values', value?.toLowerCase());
        }}
        sx={{
          width: isList ? '200px' : '100%',
          minWidth: isList ? '200px' : undefined,
        }}
        fullWidth
        options={['Any', 'List']}
        isOptionEqualToValue={(option, value) =>
          option.toLowerCase() == value.toLowerCase() || value == ''
        }
        renderInput={(params) => (
          <TextField
            {...params}
            required={true}
            label="Select Allowed values"
            variant="outlined"
          />
        )}
      />
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
                    id={`list-item-input-${listValue.av_placement_id}`}
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
            id="catalogue-property-default-value-list-input"
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
            id={uuidv4()}
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
            id={uuidv4()}
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
        id={uuidv4()}
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
      <Autocomplete
        disabled={type === 'disabled' || type === 'edit migration'}
        id={uuidv4()}
        value={catalogueItemField.mandatory ? 'yes' : 'no'}
        onChange={(_event, value) => {
          if (value == null) return;
          handleChange('mandatory', value.toLowerCase() === 'yes');
        }}
        sx={{
          width: isList ? '150px' : '100%',
          minWidth: isList ? '150px' : undefined,
        }}
        fullWidth
        options={['Yes', 'No']}
        isOptionEqualToValue={(option, value) =>
          option.toLowerCase() == value.toLowerCase() || value == ''
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select is mandatory?"
            variant="outlined"
          />
        )}
      />
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
