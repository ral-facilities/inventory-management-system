import React from 'react';
import Preloader from './preloader/preloader.component';
import {
  settings as IMSSettings,
  InventoryManagementSystemSettings,
} from './settings';

const initialConfiguration: InventoryManagementSystemSettings = {
  imsApiUrl: '',
  osApiUrl: '',
  routes: [],
  pluginHost: '',
};

export const InventoryManagementSystemSettingsContext =
  React.createContext<InventoryManagementSystemSettings>(initialConfiguration);

function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] =
    React.useState<InventoryManagementSystemSettings>(initialConfiguration);

  React.useEffect(() => {
    const updateConfigurationState = async () => {
      const settingsResult = await IMSSettings;
      if (settingsResult) {
        setLoading(false);
        setSettings(settingsResult);
      }
    };

    updateConfigurationState();
  }, [settings]);

  return (
    <Preloader loading={loading}>
      <InventoryManagementSystemSettingsContext.Provider value={settings}>
        {children}
      </InventoryManagementSystemSettingsContext.Provider>
    </Preloader>
  );
}

export default ConfigProvider;
