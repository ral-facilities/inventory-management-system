import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

interface MandatoryControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<TFieldValues, any, TTransformedValues>;
  name: TName;
  extraOnChange?: (newValue: 'false' | 'true') => void;
  disabled?: boolean;
}

function MandatoryController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: MandatoryControllerProps<TFieldValues, TName, TTransformedValues>) {
  const { control, name, extraOnChange, disabled } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <Autocomplete
          disableClearable
          disabled={disabled}
          id={crypto.randomUUID()}
          value={value === 'true' ? 'Yes' : 'No'}
          onChange={(_event, value) => {
            const newValue = value === 'Yes' ? 'true' : 'false';

            if (extraOnChange) extraOnChange(newValue);
            onChange(newValue);
          }}
          fullWidth
          options={['Yes', 'No']}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select is mandatory?"
              variant="outlined"
              disabled={disabled}
            />
          )}
        />
      )}
    />
  );
}

export default MandatoryController;
