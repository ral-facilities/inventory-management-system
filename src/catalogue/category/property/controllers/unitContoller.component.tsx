import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Unit } from '../../../../api/api.types';

interface UnitControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<TFieldValues, any, TTransformedValues>;
  units?: Unit[];
  name: TName;
  extraOnChange?: () => void;
  disabled?: boolean;
}

function UnitController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: UnitControllerProps<TFieldValues, TName, TTransformedValues>) {
  const { control, units, name, extraOnChange, disabled } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <Autocomplete
          disabled={disabled}
          id={crypto.randomUUID()}
          options={units ?? []}
          getOptionLabel={(option) => option.value}
          value={units?.find((unit) => unit.id === value) || null}
          fullWidth
          onChange={(_event, unit) => {
            onChange(unit?.id ?? null);
            if (extraOnChange) extraOnChange();
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Unit"
              variant="outlined"
              disabled={disabled}
            />
          )}
        />
      )}
    />
  );
}

export default UnitController;
