import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { AxiosError } from 'axios';
import { enGB } from 'date-fns/locale/en-GB';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {
  clearFailedAuthRequestsQueue,
  retryFailedAuthRequests,
} from './api/api';
import { MicroFrontendId } from './app.types';
import handleIMS_APIError from './handleIMS_APIError';
import IMSThemeProvider from './imsThemeProvider.component';
import Preloader from './preloader/preloader.component';
import retryIMS_APIErrors from './retryIMS_APIErrors';
import {
  broadcastSignOut,
  requestPluginRerender,
  tokenRefreshed,
} from './state/scigateway.actions';
import ViewTabs from './view/viewTabs.component';
import { HomePage } from './homePage/homePage.component';
import Catalogue from './catalogue/catalogue.component';
import CatalogueItemsLandingPage from './catalogue/items/catalogueItemsLandingPage.component';
import Systems from './systems/systems.component';
import ManufacturerComponent from './manufacturer/manufacturer.component';
import ManufacturerLandingPage from './manufacturer/manufacturerLandingPage.component';
import Items from './items/items.component';
import ItemsLandingPage from './items/itemsLandingPage.component';
import ConfigProvider from './configProvider.component';
import AdminPage from './admin/admin.component';

export const paths = {
  any: '*',
  root: '/',
  admin: '/adminpage',
  homepage: '/ims',
  catalogue: '/catalogue/*',
  systems: '/systems/*',
  manufacturers: '/manufacturers',
  manufacturer: '/manufacturers/:manufacturer_id',
  catalogueItem: '/catalogue/item/:catalogue_item_id',
  items: '/catalogue/item/:catalogue_item_id/items',
  item: '/catalogue/item/:catalogue_item_id/items/:item_id',
  units: '/adminpage/units',
  usageStatus: '/adminpage/usage-status',
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleIMS_APIError(error as AxiosError);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 0,
      gcTime: 0,
      refetchInterval: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        return retryIMS_APIErrors(failureCount, error as AxiosError);
      },
    },
  },
});

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: paths.any, Component: ViewTabs },
      { path: paths.root, Component: HomePage },
      { path: paths.homepage, Component: HomePage },
      { path: paths.admin, Component: AdminPage },
      { path: paths.units, Component: AdminPage },
      { path: paths.usageStatus, Component: AdminPage },
      { path: paths.catalogue, Component: Catalogue },
      {
        path: paths.catalogueItem,
        Component: CatalogueItemsLandingPage,
      },
      { path: paths.items, Component: Items },
      {
        path: paths.item,
        Component: ItemsLandingPage,
      },
      { path: paths.systems, Component: Systems },
      { path: paths.manufacturers, Component: ManufacturerComponent },
      {
        path: paths.manufacturer,
        Component: ManufacturerLandingPage,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

export function Layout() {
  // we need to call forceUpdate if SciGateway tells us to rerender
  // but there's no forceUpdate in functional components, so this is the hooks equivalent
  // see https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  function handler(e: Event): void {
    // attempt to re-render the plugin if we get told to
    const action = (e as CustomEvent).detail;
    if (requestPluginRerender.match(action)) forceUpdate();
    else if (tokenRefreshed.match(action)) retryFailedAuthRequests();
    else if (broadcastSignOut.match(action)) clearFailedAuthRequestsQueue();
  }

  React.useEffect(() => {
    document.addEventListener(MicroFrontendId, handler);
    return () => {
      document.removeEventListener(MicroFrontendId, handler);
    };
  }, []);

  return (
    <div className="Layout">
      <LocalizationProvider adapterLocale={enGB} dateAdapter={AdapterDateFns}>
        <IMSThemeProvider>
          <ConfigProvider>
            <QueryClientProvider client={queryClient}>
              <React.Suspense
                fallback={
                  <Preloader loading={true}>Finished loading</Preloader>
                }
              >
                <ViewTabs />
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              </React.Suspense>
            </QueryClientProvider>
          </ConfigProvider>
        </IMSThemeProvider>
      </LocalizationProvider>
    </div>
  );
}
