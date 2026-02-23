import { FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../state/hook';
import {
  selectAuthorisation,
  setIsAdminMode,
} from '../state/slices/authorisationSlice';
import { setLocalStorageToken } from '../utils';

function AuthToggle() {
  const dispatch = useAppDispatch();
  const { isAdminMode } = useAppSelector(selectAuthorisation);

  const handleChangeRole = React.useCallback(() => {
    setLocalStorageToken(!isAdminMode);
    dispatch(setIsAdminMode(!isAdminMode));
  }, [isAdminMode, dispatch]);

  return (
    <FormControlLabel
      control={<Switch checked={isAdminMode} onChange={handleChangeRole} />}
      label="Admin user"
      labelPlacement="end"
    />
  );
}

export default AuthToggle;
