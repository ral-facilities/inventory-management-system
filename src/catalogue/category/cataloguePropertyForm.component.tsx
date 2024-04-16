import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
  CatalogueCategoryFormData,
  CatalogueCategoryFormDataWithPlacementIds,
  CatalogueItemPropertiesErrorsType,
  Unit,
} from '../../app.types';

export interface CataloguePropertyFormProps {
  type:
    | 'add'
    | 'edit name'
    | 'save as'
    | 'edit properties'
    | 'property migration'
    | 'property';
  isList: boolean;
  catalogueItemField: CatalogueCategoryFormDataWithPlacementIds;
  handleChange: (
    cip_placement_id: string,
    field: keyof CatalogueCategoryFormData,
    value: string | boolean | number | null
  ) => void;
  handleDeleteField?: (cip_placement_id: string) => void;
  handleChangeListValues: (
    cip_placement_id: string,
    av_placement_id: string,
    value: string
  ) => void;
  handleAddListValue: (cip_placement_id: string) => void;
  handleDeleteListValue: (
    cip_placement_id: string,
    av_placement_id: string
  ) => void;
  catalogueItemPropertyMessage: (
    cip_placement_id: string,
    column: 'name' | 'type' | 'unit' | 'mandatory' | 'list' | 'default'
  ) => CatalogueItemPropertiesErrorsType | undefined;
  allowedValuesListErrorMessage: (
    cip_placement_id: string,
    av_placement_id: string
  ) => string;
  hasAllowedValuesList?: () => boolean;
  index: number;
  onChangeEditCatalogueItemField?: (
    catalogueItemField: CatalogueCategoryFormDataWithPlacementIds
  ) => void;
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
    index,
    onChangeEditCatalogueItemField,
    isList,
  } = props;

  const { data: units } = useUnits();

  return (
    <Stack
      direction={isList ? 'row' : 'column'}
      key={catalogueItemField.cip_placement_id}
      spacing={1}
      padding={1}
    >
      <TextField
        label="Property Name"
        id={`catalogue-category-form-data-name-${catalogueItemField.cip_placement_id}`}
        variant="outlined"
        required={true}
        value={catalogueItemField.name}
        onChange={(e) =>
          handleChange(
            catalogueItemField.cip_placement_id,
            'name',
            e.target.value
          )
        }
        error={
          !!catalogueItemPropertyMessage(
            catalogueItemField.cip_placement_id,
            'name'
          )
        }
        helperText={
          catalogueItemPropertyMessage(
            catalogueItemField.cip_placement_id,
            'name'
          )?.errors?.errorMessage
        }
        sx={{
          width: isList ? '150px' : '100%',
          minWidth: isList ? '150px' : undefined,
        }}
        disabled={type.includes('edit')}
      />
      <FormControl
        disabled={type.includes('edit')}
        sx={{
          width: isList ? '150px' : '100%',
          minWidth: isList ? '150px' : undefined,
        }}
      >
        <InputLabel
          error={
            !!catalogueItemPropertyMessage(
              catalogueItemField.cip_placement_id,
              'type'
            )
          }
          required={true}
          id={`catalogue-properties-form-select-type-label-${catalogueItemField.cip_placement_id}`}
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
              catalogueItemField.cip_placement_id,
              'type',
              e.target.value === 'text' ? 'string' : e.target.value
            );
          }}
          error={
            !!catalogueItemPropertyMessage(
              catalogueItemField.cip_placement_id,
              'type'
            )
          }
          label="Select Type"
          labelId={`catalogue-properties-form-select-type-label-${catalogueItemField.cip_placement_id}`}
          required={true}
        >
          <MenuItem value="boolean">Boolean</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="text">Text</MenuItem>
        </Select>
        {catalogueItemPropertyMessage(
          catalogueItemField.cip_placement_id,
          'type'
        ) && (
          <FormHelperText error>
            {
              catalogueItemPropertyMessage(
                catalogueItemField.cip_placement_id,
                'type'
              )?.errors?.errorMessage
            }
          </FormHelperText>
        )}
      </FormControl>
      <FormControl
        disabled={
          catalogueItemField.type === 'boolean' || type.includes('edit')
        }
        sx={{
          width: isList ? '200px' : '100%',
          minWidth: isList ? '200px' : undefined,
        }}
      >
        <InputLabel
          required={true}
          id={`catalogue-properties-form-select-allowed-values-label-${catalogueItemField.cip_placement_id}`}
        >
          Select Allowed values
        </InputLabel>
        <Select
          value={catalogueItemField.allowed_values?.type ?? 'any'}
          onChange={(e) => {
            handleChange(
              catalogueItemField.cip_placement_id,
              'allowed_values',
              e.target.value
            );
          }}
          label="Select Allowed values"
          labelId={`catalogue-properties-form-select-allowed-values-label-${catalogueItemField.cip_placement_id}`}
          required={true}
        >
          <MenuItem value="any">Any</MenuItem>
          <MenuItem value="list">List</MenuItem>
        </Select>
      </FormControl>
      {catalogueItemField.allowed_values?.type === 'list' && (
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
          {catalogueItemField.allowed_values?.values.map(
            (listValue, valueIndex) => (
              <Stack
                key={valueIndex}
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
                    width: isList ? '200px' : '100%',
                    minWidth: isList ? '200px' : undefined,
                  }}
                  disabled={type.includes('edit')}
                  label={`List Item`}
                  aria-label={`List Item ${valueIndex}`}
                  variant="outlined"
                  value={listValue.value as string}
                  onChange={(e) =>
                    catalogueItemField.allowed_values &&
                    handleChangeListValues(
                      catalogueItemField.cip_placement_id,
                      listValue.av_placement_id,
                      e.target.value as string
                    )
                  }
                  error={
                    !!allowedValuesListErrorMessage(
                      catalogueItemField.cip_placement_id,
                      listValue.av_placement_id
                    )
                  }
                  helperText={allowedValuesListErrorMessage(
                    catalogueItemField.cip_placement_id,
                    listValue.av_placement_id
                  )}
                />
                {!type.includes('edit') && (
                  <IconButton
                    aria-label={`Delete list item ${valueIndex}`}
                    onClick={() =>
                      handleDeleteListValue(
                        catalogueItemField.cip_placement_id,
                        listValue.av_placement_id
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
            )
          )}
          {!type.includes('edit') && (
            <IconButton
              aria-label={`Add list item ${index}`}
              onClick={() =>
                handleAddListValue(catalogueItemField.cip_placement_id)
              }
            >
              <AddIcon />
            </IconButton>
          )}
          {catalogueItemPropertyMessage(
            catalogueItemField.cip_placement_id,
            'list'
          ) && (
            <FormHelperText error>
              {
                catalogueItemPropertyMessage(
                  catalogueItemField.cip_placement_id,
                  'list'
                )?.errors?.errorMessage
              }
            </FormHelperText>
          )}
        </Stack>
      )}
      {type === 'property migration' &&
        !isList &&
        (catalogueItemField.allowed_values?.type === 'list' ? (
          <FormControl
            sx={{
              width: '100%',
            }}
          >
            <InputLabel
              required={catalogueItemField.mandatory}
              id={`catalogue-properties-form-select-default-value-label-${catalogueItemField.cip_placement_id}`}
            >
              Select Default value
            </InputLabel>
            <Select
              value={catalogueItemField.default_value ?? ''}
              onChange={(e) => {
                handleChange(
                  catalogueItemField.cip_placement_id,
                  'default_value',
                  e.target.value
                );
              }}
              label="Select Default value"
              labelId={`catalogue-properties-form-select-default-value-label-${catalogueItemField.cip_placement_id}`}
              required={true}
            >
              <MenuItem key={0} value={'None'}>
                {'None'}
              </MenuItem>
              {catalogueItemField.allowed_values.values.map((allowedValue) => (
                <MenuItem key={allowedValue.id} value={allowedValue.value}>
                  {allowedValue.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            required={catalogueItemField.mandatory}
            label="Default value"
            id={`catalogue-category-form-data-default-value-${catalogueItemField.cip_placement_id}`}
            variant="outlined"
            value={catalogueItemField.default_value ?? ''}
            onChange={(e) =>
              handleChange(
                catalogueItemField.cip_placement_id,
                'default_value',
                e.target.value
              )
            }
            error={
              !!catalogueItemPropertyMessage(
                catalogueItemField.cip_placement_id,
                'default'
              )
            }
            helperText={
              catalogueItemPropertyMessage(
                catalogueItemField.cip_placement_id,
                'default'
              )?.errors?.errorMessage
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
          units?.find((unit) => unit.value === catalogueItemField.unit) || null
        }
        disabled={
          catalogueItemField.type === 'boolean' || type.includes('edit')
        }
        onChange={(_event, newValue: Unit | null) => {
          handleChange(
            catalogueItemField.cip_placement_id,
            'unit',
            newValue?.value || null
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Unit"
            variant="outlined"
            disabled={
              catalogueItemField.type === 'boolean' || type.includes('edit')
            }
          />
        )}
      />
      <FormControl
        disabled={type.includes('edit')}
        sx={{
          width: isList ? '150px' : '100%',
          minWidth: isList ? '150px' : undefined,
        }}
      >
        <InputLabel
          id={`catalogue-properties-form-select-mandatory-label-${catalogueItemField.cip_placement_id}`}
        >
          Select is mandatory?
        </InputLabel>
        <Select
          value={catalogueItemField.mandatory ? 'yes' : 'no'}
          onChange={(e) =>
            handleChange(
              catalogueItemField.cip_placement_id,
              'mandatory',
              e.target.value === 'yes'
            )
          }
          label="Select is mandatory?"
          labelId={`catalogue-properties-form-select-mandatory-label-${catalogueItemField.cip_placement_id}`}
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
          {!type.includes('edit') && isList && (
            <IconButton
              aria-label={'Delete catalogue category catalogueItemField entry'}
              onClick={() =>
                handleDeleteField &&
                handleDeleteField(catalogueItemField.cip_placement_id)
              }
            >
              <DeleteIcon />
            </IconButton>
          )}

          {type === 'edit properties' && isList && (
            <IconButton
              aria-label={'Edit catalogue category field entry'}
              onClick={() => {
                onChangeEditCatalogueItemField &&
                  onChangeEditCatalogueItemField(catalogueItemField);
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Stack>
  );
}

export default CataloguePropertyForm;
