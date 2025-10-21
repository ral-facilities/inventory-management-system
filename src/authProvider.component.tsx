import React from 'react';
import { getUserRole } from './parseTokens';
import { InventoryManagementSystemSettingsContext } from './configProvider.component';

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

  React.useEffect(() => {
    const setAuthorisationState = async () => {
      const role = getUserRole();

      setAuthorisation({
        role: role,
        isPrivilegedUser: privilegedRoles.includes(role),
      });
    };
    setAuthorisationState();

    // add event listener for if token in localstorage changes
    window.addEventListener('tokenChanged', (_) => {
      setAuthorisationState();
    });
  }, [privilegedRoles]);

  return (
    <AuthContext.Provider value={authorisation}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthorisationState = () => React.useContext(AuthContext);
