import { FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../state/hook';
import {
  selectAuthorisation,
  setAdminMode,
} from '../state/slices/authorisationSlice';
import { setLocalStorageToken } from '../utils';

function AuthToggle() {
  const dispatch = useAppDispatch();
  const { adminMode } = useAppSelector(selectAuthorisation);

  const handleChangeRole = React.useCallback(() => {
    setLocalStorageToken(!adminMode);
    dispatch(setAdminMode(!adminMode));
  }, [adminMode, dispatch]);

  return (
    <FormControlLabel
      control={<Switch checked={adminMode} onChange={handleChangeRole} />}
      label="Admin user"
      labelPlacement="end"
    />
  );
}

export default AuthToggle;
