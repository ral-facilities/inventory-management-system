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
import AdminCardView from './admin/adminCardView.component';
import AdminLayout from './admin/adminLayout.component';
import Units from './admin/units/units.component';
import UsageStatuses from './admin/usageStatuses/usageStatuses.component';
import {
  clearFailedAuthRequestsQueue,
  retryFailedAuthRequests,
} from './api/api';
import { MicroFrontendId } from './app.types';
import Catalogue from './catalogue/catalogue.component';
import CatalogueItemsLandingPage from './catalogue/items/catalogueItemsLandingPage.component';
import ErrorPage from './common/errorPage.component';
import ConfigProvider from './configProvider.component';
import handleIMS_APIError from './handleIMS_APIError';
import { HomePage } from './homePage/homePage.component';
import IMSThemeProvider from './imsThemeProvider.component';
import Items from './items/items.component';
import ItemsLandingPage from './items/itemsLandingPage.component';
import ManufacturerLandingPage from './manufacturer/manufacturerLandingPage.component';
import ManufacturerLayout from './manufacturer/manufacturerLayout.component';
import ManufacturerTable from './manufacturer/manufacturersTable.component';
import Preloader from './preloader/preloader.component';
import retryIMS_APIErrors from './retryIMS_APIErrors';
import {
  broadcastSignOut,
  requestPluginRerender,
  tokenRefreshed,
} from './state/scigateway.actions';
import Systems from './systems/systems.component';
import SystemsLayout from './systems/systemsLayout.component';
import ViewTabs from './view/viewTabs.component';

export const paths = {
  any: '*',
  root: '/',
  admin: '/admin-ims',
  adminUnits: '/admin-ims/units',
  adminUsageStatuses: '/admin-ims/usage-statuses',
  homepage: '/ims',
  catalogue: '/catalogue/*',
  systems: '/systems',
  system: '/systems/:system_id',
  manufacturers: '/manufacturers',
  manufacturer: '/manufacturers/:manufacturer_id',
  catalogueItem: '/catalogue/item/:catalogue_item_id',
  items: '/catalogue/item/:catalogue_item_id/items',
  item: '/catalogue/item/:catalogue_item_id/items/:item_id',
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
      { path: paths.root, Component: HomePage },
      { path: paths.homepage, Component: HomePage },
      {
        path: paths.admin,
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminCardView },
          { path: paths.adminUnits, Component: Units },
          { path: paths.adminUsageStatuses, Component: UsageStatuses },
          {
            path: '*',
            Component: () => (
              <ErrorPage
                boldErrorText="Invalid Admin Route"
                errorText="The admin route you are trying to access doesn't exist. Please click the Home button to navigate back to the Admin Home page."
              />
            ),
          },
        ],
      },
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
      {
        path: paths.systems,
        Component: SystemsLayout,
        children: [
          { index: true, Component: Systems },
          { path: paths.system, Component: Systems },
          {
            path: '*',
            Component: () => (
              <ErrorPage
                boldErrorText="Invalid System Route"
                errorText="The system route you are trying to access doesn't exist. Please click the Home button to navigate back to the System Home page."
              />
            ),
          },
        ],
      },
      {
        path: paths.manufacturers,
        Component: ManufacturerLayout,
        children: [
          { index: true, Component: ManufacturerTable },
          { path: paths.manufacturer, Component: ManufacturerLandingPage },
          {
            path: '*',
            Component: () => (
              <ErrorPage
                boldErrorText="Invalid Manufacturer Route"
                errorText="The manufacturer route you are trying to access doesn't exist. Please click the Home button to navigate back to the Manufacturer Home page."
              />
            ),
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

export function Layout() {
  // We need to call forceUpdate if SciGateway tells us to rerender
  // but there's no forceUpdate in functional components, so this is the hooks equivalent
  // see https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
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
