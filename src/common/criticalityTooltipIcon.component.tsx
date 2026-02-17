import WarningIcon from '@mui/icons-material/Warning';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

interface CriticalityTooltipIconProps {
  label: React.ReactNode;
  sx?: SxProps<Theme>;
}

const CriticalityTooltipIcon = (props: CriticalityTooltipIconProps) => {
  const { label, sx = {} } = props;

  const theme = useTheme();
  return (
    <Tooltip title={label}>
      <WarningIcon
        sx={{
          pr: 1,
          fontSize: '35px',
          color: theme.palette.error.main,
          ...sx,
        }}
      />
    </Tooltip>
  );
};

export default CriticalityTooltipIcon;
