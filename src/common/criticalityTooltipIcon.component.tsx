import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

interface CriticalityTooltipIconProps {
  label: React.ReactNode;
  showFlagged: boolean | null;
}

const getIcon = (showFlagged: boolean | null) => {
  if (showFlagged === null) {
    return (
      <WarningIcon
        sx={(theme) => ({
          pr: 1,
          fontSize: '35px',
          color: theme.palette.warning.main,
        })}
      />
    );
  }

  if (showFlagged === true) {
    return (
      <ErrorIcon
        sx={(theme) => ({
          pr: 1,
          fontSize: '35px',
          color: theme.palette.error.main,
        })}
      />
    );
  }

  return (
    <CheckCircleIcon
      sx={(theme) => ({
        pr: 1,
        fontSize: '35px',
        color: theme.palette.success.main,
      })}
    />
  );
};

const CriticalityTooltipIcon = ({
  label,
  showFlagged,
}: CriticalityTooltipIconProps) => {
  return <Tooltip title={label}>{getIcon(showFlagged)}</Tooltip>;
};

export default CriticalityTooltipIcon;
