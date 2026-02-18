import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../state/hook';
import {
  selectAuthorisation,
  setIsAdminMode,
} from '../state/slices/authorisationSlice';

const AuthSettingsMenuItem = () => {
  const { isAdminMode, isAdminUser } = useAppSelector(selectAuthorisation);
  const dispatch = useAppDispatch();

  const handleAdminMode = React.useCallback(() => {
    dispatch(setIsAdminMode(!isAdminMode));
  }, [isAdminMode, dispatch]);

  if (!isAdminUser) return null;
  return (
    <MenuItem id="item-admin-mode" onClick={handleAdminMode}>
      <ListItemIcon>
        <AdminPanelSettingsIcon />
      </ListItemIcon>
      <ListItemText
        primary={isAdminMode ? 'Switch to normal mode' : 'Switch to admin mode'}
      />
    </MenuItem>
  );
};

export default AuthSettingsMenuItem;
