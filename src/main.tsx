import axios from 'axios';
import log from 'loglevel';
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';
import { MicroFrontendId } from './app.types';
import { InventoryManagementSystemSettings, setSettings } from './settings';
import { PluginRoute, RegisterRouteType } from './state/actions/actions.types';

export const pluginName = 'inventory-management-system';

const render = (): void => {
  const el = document.getElementById(pluginName);
  if (!el) throw new Error(`${pluginName} div missing in index.html`);

  const root = ReactDOMClient.createRoot(el);
  root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
};

function domElementGetter(): HTMLElement {
  // Make sure there is a div for us to render into
  let el = document.getElementById(pluginName);
  if (!el) {
    el = document.createElement('div');
  }

  return el;
}

// This was throwing a warning that rootComponent was not found even if it was defined
// Defining loadRootComponent did not throw this warning
// May be worth investigating further
const reactLifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: () => (document.getElementById(pluginName) ? <App /> : null),
  domElementGetter,
  errorBoundary: (error) => {
    log.error(`${pluginName} failed with error: ${error}`);
    return (
      <div className="error">
        {/* <React.Suspense
          fallback={<Preloader loading={true}>Finished loading</Preloader>}
        >
          <div
            style={{
              padding: 20,
              background: 'red',
              color: 'white',
              margin: 5,
            }}
          >
            <Translation>{(t) => t('app.error')}</Translation>
          </div>
        </React.Suspense> */}
        <p>Error</p>
      </div>
    );
  },
});

// Single-SPA bootstrap methods have no idea what type of inputs may be
// pushed down from the parent app
export function bootstrap(props: unknown): Promise<void> {
  return reactLifecycles
    .bootstrap(props)
    .then(() => {
      log.info(`${pluginName} has been successfully bootstrapped`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst bootstrapping: ${error}`);
    });
}

export function mount(props: unknown): Promise<void> {
  return reactLifecycles
    .mount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully mounted`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst mounting: ${error}`);
    });
}

export function unmount(props: unknown): Promise<void> {
  return reactLifecycles
    .unmount(props)
    .then(() => {
      log.info(`${pluginName} has been successfully unmounted`);
    })
    .catch((error: Error) => {
      log.error(`${pluginName} failed whilst unmounting: ${error}`);
    });
}

// only export this for testing
export const fetchSettings =
  (): Promise<InventoryManagementSystemSettings | void> => {
    const settingsPath = import.meta.env
      .VITE_APP_INVENTORY_MANAGEMENT_SYSTEM_BUILD_DIRECTORY
      ? import.meta.env.VITE_APP_INVENTORY_MANAGEMENT_SYSTEM_BUILD_DIRECTORY +
        'inventory-management-system-settings.json'
      : '/inventory-management-system-settings.json';
    return axios
      .get<InventoryManagementSystemSettings>(settingsPath)
      .then((res) => {
        const settings = res.data;

        // invalid settings.json
        if (typeof settings !== 'object') {
          throw Error('Invalid format');
        }

        // Ensure the imsApiUrl name exists.
        if (!('imsApiUrl' in settings)) {
          throw new Error('imsApiUrl is undefined in settings');
        }

        // Ensure the osApiUrl name exists.
        if (!('osApiUrl' in settings)) {
          throw new Error('osApiUrl is undefined in settings');
        }

        // Ensure the maxAttachmentSizeBytes value exists.
        if (!('maxAttachmentSizeBytes' in settings)) {
          throw new Error('maxAttachmentSizeBytes is undefined in settings');
        }

        // Ensure the attachmentAllowedFileExtensions name exists.
        if (!('attachmentAllowedFileExtensions' in settings)) {
          throw new Error('attachmentAllowedFileExtensions is undefined in settings');
        }

        if (Array.isArray(settings['routes']) && settings['routes'].length) {
          settings['routes'].forEach((route: PluginRoute, index: number) => {
            if (
              'section' in route &&
              'link' in route &&
              'displayName' in route
            ) {
              const registerRouteAction = {
                type: RegisterRouteType,
                payload: {
                  section: route['section'],
                  link: route['link'],
                  plugin: 'inventory-management-system',
                  displayName: route['displayName'],
                  order: route['order'] ?? 0,
                  hideFromMenu: route['hideFromMenu'] ?? false,
                  admin: route['admin'] ?? false,
                  helpSteps:
                    index === 0 && 'helpSteps' in settings
                      ? settings['helpSteps']
                      : [],
                },
              };
              document.dispatchEvent(
                new CustomEvent(MicroFrontendId, {
                  detail: registerRouteAction,
                })
              );
            } else {
              throw new Error(
                'Route provided does not have all the required entries (section, link, displayName)'
              );
            }
          });
        } else {
          throw new Error('No routes provided in the settings');
        }
        return settings;
      })
      .catch((error) => {
        log.error(`Error loading ${settingsPath}: ${error.message}`);
      });
  };

const settings = fetchSettings();
setSettings(settings);

async function prepare() {
  // When in dev, only use MSW if the api url is given, otherwise load MSW as it must have been explicitly requested
  const settingsResult = await settings;
  if (
    import.meta.env.VITE_APP_INCLUDE_MSW === 'true' ||
    settingsResult?.imsApiUrl === '' ||
    settingsResult?.osApiUrl === ''
  ) {
    // Need to use require instead of import as import breaks when loaded in SG
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest(request, print) {
        // Ignore unhandled requests to non-localhost things (normally means you're contacting a real server)
        if (request.url.includes('localhost')) {
          return;
        }

        print.warning();
      },
    });
  } else return Promise.resolve();
}

/* Renders only if we're not being loaded by SG  */
const conditionalSciGatewayRender = () => {
  if (!document.getElementById('scigateway')) {
    render();
  }
};

if (import.meta.env.DEV || import.meta.env.VITE_APP_INCLUDE_MSW === 'true') {
  prepare().then(() => conditionalSciGatewayRender());

  log.setDefaultLevel(log.levels.DEBUG);
} else {
  conditionalSciGatewayRender();

  log.setDefaultLevel(log.levels.ERROR);
}
