import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { CatalogueCategoryPropertyType } from '../../../../api/api.types';

interface TypeControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<TFieldValues, any, TTransformedValues>;
  name: TName;
  extraOnChange?: (formattedValue: CatalogueCategoryPropertyType) => void;
  disabled?: boolean;
}

function TypeController<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: TypeControllerProps<TFieldValues, TName, TTransformedValues>) {
  const { control, name, extraOnChange, disabled } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <Autocomplete
          id={crypto.randomUUID()}
          disableClearable
          disabled={disabled}
          value={(
            Object.keys(CatalogueCategoryPropertyType) as Array<
              keyof typeof CatalogueCategoryPropertyType
            >
          ).find((key) => CatalogueCategoryPropertyType[key] === value)}
          onChange={(_event, value) => {
            const formattedValue =
              CatalogueCategoryPropertyType[
                value as keyof typeof CatalogueCategoryPropertyType
              ];
            onChange(formattedValue);

            if (extraOnChange) extraOnChange(formattedValue);
          }}
          fullWidth
          options={Object.keys(CatalogueCategoryPropertyType)}
          isOptionEqualToValue={(option, value) =>
            option === value || value === ''
          }
          renderInput={(params) => (
            <TextField
              {...params}
              disabled={disabled}
              required={true}
              label="Select Type"
              variant="outlined"
            />
          )}
        />
      )}
    />
  );
}

export default TypeController;
