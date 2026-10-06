import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';
import React from 'react';

interface CriticalityTooltipIconProps {
  label: React.ReactNode;
  showFlagged: boolean | null;
  iconSx?: SystemStyleObject<Theme>;
}

const getIcon = (
  showFlagged: boolean | null,
  iconSx?: SystemStyleObject<Theme>
) => {
  if (showFlagged === null) {
    return (
      <WarningIcon
        sx={(theme) => ({
          pr: 1,
          fontSize: '36px',
          color: theme.palette.warning.main,
          ...iconSx,
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
          ...iconSx,
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
        ...iconSx,
      })}
    />
  );
};

const CriticalityTooltipIcon = ({
  label,
  showFlagged,
  iconSx,
}: CriticalityTooltipIconProps) => {
  return <Tooltip title={label}>{getIcon(showFlagged, iconSx)}</Tooltip>;
};

export default CriticalityTooltipIcon;
