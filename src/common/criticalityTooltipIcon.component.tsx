import WarningIcon from '@mui/icons-material/Warning';
import Tooltip from '@mui/material/Tooltip';

interface CriticalityTooltipIconProps {
  label: React.ReactNode;
}

const CriticalityTooltipIcon = (props: CriticalityTooltipIconProps) => {
  const { label } = props;
  return (
    <Tooltip title={label}>
      <WarningIcon
        sx={(theme) => ({
          pr: 1,
          fontSize: '35px',
          color: theme.palette.error.main,
        })}
      />
    </Tooltip>
  );
};

export default CriticalityTooltipIcon;
