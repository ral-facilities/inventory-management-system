import React from 'react';
import { isUserAdmin } from './parseTokens';
import Preloader from './preloader/preloader.component';

const AuthContext = React.createContext<boolean>(false);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [authorised, setAuthorised] = React.useState(false);

  React.useEffect(() => {
    const setAuthorisationState = async () => {
      const authResult = await isUserAdmin();
      setLoading(false);
      setAuthorised(authResult);
    };

    setAuthorisationState();
  }, [authorised]);

  return (
    <Preloader loading={loading}>
      <AuthContext.Provider value={authorised}>{children}</AuthContext.Provider>
    </Preloader>
  );
};

export const useAuthorised = () => React.useContext(AuthContext);
