import React from 'react';
import { getUserRole } from './parseTokens';
import { InventoryManagementSystemSettingsContext } from './configProvider.component';
import { TokenUpdatedType } from './state/actions/actions.types';

const AuthContext = React.createContext<{
  role: string;
  isPrivilegedUser: boolean;
}>({ role: 'default', isPrivilegedUser: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authorisation, setAuthorisation] = React.useState({
    role: 'default',
    isPrivilegedUser: false,
  });
  const { privilegedRoles } = React.useContext(
    InventoryManagementSystemSettingsContext
  );

  const setAuthorisationState = React.useCallback(() => {
    const role = getUserRole();

    setAuthorisation({
      role: role,
      isPrivilegedUser: privilegedRoles.includes(role),
    });
  }, [privilegedRoles]);

  React.useEffect(() => {
    setAuthorisationState();

    // add event listener for if token in localstorage changes
    window.addEventListener(TokenUpdatedType, setAuthorisationState);
    return () => {
      window.removeEventListener(TokenUpdatedType, setAuthorisationState);
    };
  }, [setAuthorisationState]);

  return (
    <AuthContext.Provider value={authorisation}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthorisationState = () => React.useContext(AuthContext);
