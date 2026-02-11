import React from 'react';
import { getUserRole } from './parseTokens';
import { TokenUpdatedType } from './state/actions/actions.types';
import { useAppSelector } from './state/hook';
import { selectSettings } from './state/slices/configSlice';

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

  const {
    settings: { privilegedRoles },
  } = useAppSelector(selectSettings);

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
