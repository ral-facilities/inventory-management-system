import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import type { Router } from '@remix-run/router';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AxiosError } from 'axios';
import { enGB } from 'date-fns/locale/en-GB';
import React from 'react';
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from 'react-router-dom';
import AdminCardView from './admin/adminCardView.component';
import AdminLayout, {
  AdminErrorComponent,
} from './admin/adminLayout.component';
import Units from './admin/units/units.component';
import UsageStatuses from './admin/usageStatuses/usageStatuses.component';
import {
  clearFailedAuthRequestsQueue,
  retryFailedAuthRequests,
} from './api/api';
import { MicroFrontendId } from './app.types';
import CatalogueLayout, {
  CatalogueErrorComponent,
  CatalogueLayoutErrorComponent,
  catalogueLayoutLoader,
} from './catalogue/catalogueLayout.component';
import CatalogueCardView from './catalogue/category/catalogueCardView.component';
import CatalogueItemsLandingPage from './catalogue/items/catalogueItemsLandingPage.component';
import CatalogueItemsPage from './catalogue/items/catalogueItemsPage.component';
import ConfigProvider from './configProvider.component';
import handleIMS_APIError from './handleIMS_APIError';
import {
  HomePage,
  HomePageErrorComponent,
} from './homePage/homePage.component';
import IMSThemeProvider from './imsThemeProvider.component';
import Items from './items/items.component';
import ItemsLandingPage from './items/itemsLandingPage.component';
import ManufacturerLandingPage from './manufacturer/manufacturerLandingPage.component';
import ManufacturerLayout, {
  ManufacturerErrorComponent,
  ManufacturerLayoutErrorComponent,
  manufacturerLayoutLoader,
} from './manufacturer/manufacturerLayout.component';
import ManufacturerTable from './manufacturer/manufacturerTable.component';
import Preloader from './preloader/preloader.component';
import retryIMS_APIErrors from './retryIMS_APIErrors';
import {
  broadcastSignOut,
  requestPluginRerender,
  tokenRefreshed,
} from './state/scigateway.actions';
import Systems from './systems/systems.component';
import SystemsLayout, {
  SystemsErrorComponent,
  SystemsLayoutErrorComponent,
  systemsLayoutLoader,
} from './systems/systemsLayout.component';
import ViewTabs from './view/viewTabs.component';

export const paths = {
  any: '*',
  root: '/',
  admin: '/admin-ims',
  adminUnits: '/admin-ims/units',
  adminUsageStatuses: '/admin-ims/usage-statuses',
  homepage: '/ims',
  catalogue: '/catalogue',
  catalogueCategories: '/catalogue/:catalogue_category_id',
  catalogueItems: '/catalogue/:catalogue_category_id/items',
  catalogueItem: '/catalogue/:catalogue_category_id/items/:catalogue_item_id',
  items: '/catalogue/:catalogue_category_id/items/:catalogue_item_id/items',
  item: '/catalogue/:catalogue_category_id/items/:catalogue_item_id/items/:item_id',
  systems: '/systems',
  system: '/systems/:system_id',
  manufacturers: '/manufacturers',
  manufacturer: '/manufacturers/:manufacturer_id',
};

export const queryClient = new QueryClient({
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

const routeObject: RouteObject[] = [
  // The error boundary is placed at the root of the specified route's layout to prevent
  // the layout from making repeated fetch requests that are known to be invalid for the breadcrumbs.
  // This helps maintain the integrity of the breadcrumbs and avoids unnecessary network calls.
  // Additionally, the loader function should be defined on the RouteObject that utilises the route
  // parameters within the component to fetch the necessary data dynamically.
  {
    Component: Layout,
    children: [
      { path: paths.root, Component: HomePage },
      {
        path: paths.homepage,
        Component: Outlet,
        children: [
          { Component: HomePage, index: true },
          { path: '*', Component: HomePageErrorComponent },
        ],
      },
      {
        path: paths.admin,
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminCardView },
          { path: paths.adminUnits, Component: Units },
          { path: paths.adminUsageStatuses, Component: UsageStatuses },
          {
            path: '*',
            Component: AdminErrorComponent,
          },
        ],
      },
      {
        path: paths.catalogue,
        Component: CatalogueLayout,
        ErrorBoundary: CatalogueLayoutErrorComponent,
        children: [
          {
            index: true,
            Component: CatalogueCardView,
          },
          {
            path: paths.catalogueCategories,
            Component: Outlet,
            children: [
              {
                index: true,
                Component: CatalogueCardView,
                loader: catalogueLayoutLoader(queryClient),
              },
              {
                path: paths.catalogueItems,
                Component: Outlet,
                children: [
                  {
                    index: true,
                    Component: CatalogueItemsPage,
                    loader: catalogueLayoutLoader(queryClient),
                  },
                  {
                    path: paths.catalogueItem,
                    Component: Outlet,
                    children: [
                      {
                        index: true,
                        Component: CatalogueItemsLandingPage,
                        loader: catalogueLayoutLoader(queryClient),
                      },
                      {
                        path: paths.items,
                        Component: Outlet,
                        children: [
                          {
                            index: true,
                            Component: Items,
                            loader: catalogueLayoutLoader(queryClient),
                          },
                          {
                            path: paths.item,
                            Component: Outlet,
                            children: [
                              {
                                index: true,
                                Component: ItemsLandingPage,
                                loader: catalogueLayoutLoader(queryClient),
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: '*',
            Component: CatalogueErrorComponent,
          },
        ],
      },
      {
        path: paths.systems,
        Component: SystemsLayout,
        ErrorBoundary: SystemsLayoutErrorComponent,
        children: [
          { index: true, Component: Systems },
          {
            path: paths.system,
            Component: Systems,
            loader: systemsLayoutLoader(queryClient),
          },
          {
            path: '*',
            Component: SystemsErrorComponent,
          },
        ],
      },
      {
        path: paths.manufacturers,
        Component: ManufacturerLayout,
        ErrorBoundary: ManufacturerLayoutErrorComponent,
        children: [
          { index: true, Component: ManufacturerTable },
          {
            path: paths.manufacturer,
            Component: ManufacturerLandingPage,
            loader: manufacturerLayoutLoader(queryClient),
          },
          {
            path: '*',
            Component: ManufacturerErrorComponent,
          },
        ],
      },
    ],
  },
];

let router: Router;
const isUsingMSW =
  import.meta.env.DEV || import.meta.env.VITE_APP_INCLUDE_MSW === 'true';

if (!isUsingMSW) router = createBrowserRouter(routeObject);

// If the application is using MSW (Mock Service Worker),
// it creates the router using `createBrowserRouter` within the App so it can wait for MSW to load. This is necessary
// because MSW needs to be running before the router is created to handle requests properly in the loader. In a production
// environment, this is not needed.

export default function App() {
  if (isUsingMSW) router = createBrowserRouter(routeObject);
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
                <ReactQueryDevtools initialIsOpen={false} />
              </React.Suspense>
            </QueryClientProvider>
          </ConfigProvider>
        </IMSThemeProvider>
      </LocalizationProvider>
    </div>
  );
}
