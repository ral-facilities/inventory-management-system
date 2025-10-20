import React from 'react';
import { getUserRole } from './parseTokens';
import { InventoryManagementSystemSettingsContext } from './configProvider.component';

const AuthContext = React.createContext<{
  role: string;
  isAdminUser: boolean;
}>({ role: 'default', isAdminUser: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authorisation, setAuthorisation] = React.useState({
    role: 'default',
    isAdminUser: false,
  });
  const { privilegedRoles } = React.useContext(
    InventoryManagementSystemSettingsContext
  );

  React.useEffect(() => {
    const setAuthorisationState = async () => {
      const role = getUserRole();

      setAuthorisation({
        role: role,
        isAdminUser: privilegedRoles.includes(role),
      });
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
