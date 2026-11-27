import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import {
  AllowedValuesListType,
  CatalogueCategoryPropertyType,
} from '../../../../api/api.types';

interface AllowedValuesControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<TFieldValues, any, TTransformedValues>;
  name: TName;
  valueType?: CatalogueCategoryPropertyType;
  extraOnChange?: () => void;
  disabled?: boolean;
}

function AllowedValuesController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: AllowedValuesControllerProps<TFieldValues, TName, TTransformedValues>
) {
  const { control, name, extraOnChange, disabled, valueType } = props;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        return (
          <Autocomplete
            disableClearable
            disabled={disabled}
            id={crypto.randomUUID()}
            value={
              (
                Object.keys(AllowedValuesListType) as Array<
                  keyof typeof AllowedValuesListType
                >
              ).find((key) => AllowedValuesListType[key] === value?.type) ??
              'Any'
            }
            onChange={(_event, value) => {
              const formattedValue =
                AllowedValuesListType[
                  value as keyof typeof AllowedValuesListType
                ];

              if (extraOnChange) extraOnChange();

              onChange(
                formattedValue === 'list'
                  ? {
                      type: formattedValue,
                      values: {
                        valueType:
                          valueType ?? CatalogueCategoryPropertyType.Text,
                        values: [],
                      },
                    }
                  : undefined
              );
            }}
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
                disabled={disabled}
              />
            )}
          />
        );
      }}
    />
  );
}

export default AllowedValuesController;
