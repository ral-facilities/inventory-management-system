import React from 'react';
import { SparesFilterStateType } from './app.types';
import Preloader from './preloader/preloader.component';

import { Outlet } from 'react-router';
import { useSparesFilterState } from './utils';

interface APISettings {
  spares?: SparesFilterStateType;
}

export const APISettingsContext = React.createContext<APISettings>({});

function APIConfigProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState<APISettings>({});

  const sparesInfo = useSparesFilterState();

  React.useEffect(() => {
    const updateConfigurationState = async () => {
      const isSparesDefinitionDefined =
        sparesInfo.sparesDefinition !== '' &&
        sparesInfo.sparesDefinition.system_types.length !== 0;

      if (!sparesInfo.isLoading) {
        setLoading(false);
        setSettings({
          spares: isSparesDefinitionDefined ? sparesInfo : undefined,
        });
      }
    };

    updateConfigurationState();
  }, [sparesInfo]);

  return (
    <Preloader loading={loading}>
      <APISettingsContext.Provider value={settings}>
        {children}
      </APISettingsContext.Provider>
    </Preloader>
  );
}

export default APIConfigProvider;

export function APIConfigProviderLayout() {
  return (
    <APIConfigProvider>
      <Outlet />
    </APIConfigProvider>
  );
}
