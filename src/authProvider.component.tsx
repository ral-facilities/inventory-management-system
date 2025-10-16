import React from 'react';
import { getUserRole } from './parseTokens';
import { InventoryManagementSystemSettingsContext } from './configProvider.component';

const AuthContext = React.createContext<{
  role: string;
  isAdmin: boolean;
}>({ role: 'default', isAdmin: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authorisation, setAuthorisation] = React.useState({
    role: 'default',
    isAdmin: false,
  });
  const { privilegedRoles } = React.useContext(
    InventoryManagementSystemSettingsContext
  );

  React.useEffect(() => {
    const setAuthorisationState = async () => {
      const role = getUserRole();

      setAuthorisation({ role: role, isAdmin: privilegedRoles.includes(role) });
    };

    setAuthorisationState();
  }, [privilegedRoles]);

  return (
    <AuthContext.Provider value={authorisation}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthorisationState = () => React.useContext(AuthContext);
