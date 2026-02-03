import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../state/hook';
import {
  selectCriticality,
  setIsCriticalMode,
} from '../state/slices/criticalitySlice';

const CriticalitySettingsMenuItem = () => {
  const { isCriticalMode } = useAppSelector(selectCriticality);
  const dispatch = useAppDispatch();

  const handleCriticalMode = React.useCallback(() => {
    dispatch(setIsCriticalMode(!isCriticalMode));
  }, [isCriticalMode, dispatch]);

  return (
    <MenuItem id="item-critical-mode" onClick={handleCriticalMode}>
      <ListItemIcon>
        <GppMaybeIcon />
      </ListItemIcon>
      <ListItemText
        primary={`Switch to critical mode ${isCriticalMode ? 'off' : 'on'}`}
      />
    </MenuItem>
  );
};

export default CriticalitySettingsMenuItem;
