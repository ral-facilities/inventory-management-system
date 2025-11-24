import React from 'react';
import { getUserRole } from './parseTokens';
import { InventoryManagementSystemSettingsContext } from './configProvider.component';
import { isRunningInDevelopment } from './utils';

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

    // if dev mode add event listener for if token in localstorage changes
    if (isRunningInDevelopment()) {
      window.addEventListener('tokenChanged', setAuthorisationState);

      return () => {
        window.removeEventListener('tokenChanged', setAuthorisationState);
      };
    }
  }, [setAuthorisationState]);

  return (
    <AuthContext.Provider value={authorisation}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthorisationState = () => React.useContext(AuthContext);
