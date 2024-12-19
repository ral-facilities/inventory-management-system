import WarningIcon from '@mui/icons-material/Warning';
import { Checkbox, FormControlLabel, Paper, Typography } from '@mui/material';

export interface WarningMessageProps {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
  message: string;
}
const WarningMessage = (props: WarningMessageProps) => {
  const { isChecked, setIsChecked, message } = props;
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        mx: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={isChecked}
            onChange={(event) => {
              setIsChecked(event.target.checked);
            }}
            color="primary"
          />
        }
        label=""
        aria-label="Confirm understanding and proceed checkbox"
      />
      <WarningIcon
        sx={{
          pr: 2,
          fontSize: '50px',
          color: 'warning.main',
        }}
      />
      <Typography variant="body1">{message}</Typography>
    </Paper>
  );
};

export default WarningMessage;
