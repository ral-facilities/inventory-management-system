import { FormControlLabel, Switch } from '@mui/material';
import React from 'react';
import { useAppSelector } from '../state/hook';
import { selectAuthorisation } from '../state/slices/authorisationSlice';
import { setLocalStorageToken } from '../utils';

function AuthToggle() {
  const { isPrivilegedUser } = useAppSelector(selectAuthorisation);

  const handleChangeRole = React.useCallback(() => {
    setLocalStorageToken(!isPrivilegedUser);
  }, [isPrivilegedUser]);

  return (
    <FormControlLabel
      control={
        <Switch checked={isPrivilegedUser} onChange={handleChangeRole} />
      }
      label="Privileged user"
      labelPlacement="end"
    />
  );
}

export default AuthToggle;
