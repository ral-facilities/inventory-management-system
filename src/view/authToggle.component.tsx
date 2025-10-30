import { FormControlLabel, Switch } from '@mui/material';
import { useAuthorisationState } from '../authProvider.component';
import React from 'react';
import { setLocalStorageToken } from '../utils';

function AuthToggle() {
  const { isPrivilegedUser } = useAuthorisationState();

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
