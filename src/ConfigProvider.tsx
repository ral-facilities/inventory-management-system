import React from 'react';
import { InventoryManagementSystemSettings, settings } from './settings';
import Preloader from './preloader/preloader.component';

const initialConfiguration: InventoryManagementSystemSettings = {
  apiUrl: '',
  routes: [],
  pluginHost: '',
};

export const InventoryManagementSystemSettingsContext =
  React.createContext<InventoryManagementSystemSettings>(initialConfiguration);

class ConfigProvider extends React.Component<
  { children: React.ReactNode },
  { loading: boolean; settings: InventoryManagementSystemSettings }
> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);

    this.state = {
      loading: true,
      settings: initialConfiguration,
    };
  }

  public componentDidMount(): void {
    this.updateConfigurationState();
  }

  private updateConfigurationState = async (): Promise<void> => {
    const settingsResult = await settings;
    if (settingsResult) {
      this.setState({
        loading: false,
        settings: settingsResult,
      });
    }
  };

  public render(): React.ReactElement {
    return (
      // We pass the inventory management system settings that has been loaded
      // for all child components to consume, if required.
      <Preloader loading={this.state.loading}>
        <InventoryManagementSystemSettingsContext.Provider
          value={this.state.settings}
        >
          {this.props.children}
        </InventoryManagementSystemSettingsContext.Provider>
      </Preloader>
    );
  }
}

export const ConfigConsumer = InventoryManagementSystemSettingsContext.Consumer;
export default ConfigProvider;
