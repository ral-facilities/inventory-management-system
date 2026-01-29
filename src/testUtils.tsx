import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderOptions, render } from '@testing-library/react';
import { enGB } from 'date-fns/locale/en-GB';
import React from 'react';
import { Provider } from 'react-redux';
import {
  RouterProvider,
  createBrowserRouter,
  createMemoryRouter,
} from 'react-router';
import {
  CatalogueCategory,
  CatalogueCategoryProperty,
  CatalogueItem,
  Item,
  Manufacturer,
  System,
  type SystemType,
  type UsageStatus,
} from './api/api.types';
import CatalogueCategoriesJSON from './mocks/CatalogueCategories.json';
import CatalogueItemsJSON from './mocks/CatalogueItems.json';
import ItemsJSON from './mocks/Items.json';
import ManufacturersJSON from './mocks/Manufacturers.json';
import SystemTypesJSON from './mocks/SystemTypes.json';
import SystemsJSON from './mocks/Systems.json';
import UsageStatusJSON from './mocks/UsageStatuses.json';
import { URLPathKeyType, paths } from './paths';
import store from './state/store';

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 300000,
      },
    },
  });

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  queryClient?: QueryClient;
}

function constructRouterProvider(
  ui: React.ReactNode,
  queryClient: QueryClient,
  urlPathKey?: URLPathKeyType,
  initialEntry?: string
) {
  const Root: React.FunctionComponent = () => {
    return (
      <Provider store={store}>
        <LocalizationProvider adapterLocale={enGB} dateAdapter={AdapterDateFns}>
          <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
        </LocalizationProvider>
      </Provider>
    );
  };

  const router =
    initialEntry !== undefined && urlPathKey !== undefined
      ? createMemoryRouter([{ path: paths[urlPathKey], Component: Root }], {
          initialEntries: [initialEntry],
        })
      : createBrowserRouter([{ path: '*', Component: Root }]);

  return { router: router, provider: <RouterProvider router={router} /> };
}

function constructRouterProviderWrapper(
  queryClient: QueryClient,
  urlPathKey?: URLPathKeyType,
  initialEntry?: string
) {
  const wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element => {
    return constructRouterProvider(
      children,
      queryClient,
      urlPathKey,
      initialEntry
    ).provider;
  };
  return wrapper;
}

export function renderComponentWithRouterProvider(
  ui: React.ReactElement,
  urlPathKey?: URLPathKeyType,
  initialEntry?: string,
  {
    // Automatically create a query client instance if no query client was passed in
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const { router, provider } = constructRouterProvider(
    ui,
    queryClient,
    urlPathKey,
    initialEntry
  );
  return {
    queryClient,
    router,
    ...render(ui, {
      wrapper: () => provider,
      ...renderOptions,
    }),
  };
}

export const hooksWrapperWithProviders = (props?: {
  queryClient?: QueryClient;
  urlPathKey?: URLPathKeyType;
  initialEntry?: string;
}) => {
  const testQueryClient = props?.queryClient ?? createTestQueryClient();
  return constructRouterProviderWrapper(
    testQueryClient,
    props?.urlPathKey,
    props?.initialEntry
  );
};

export const getCatalogueItemsPropertiesById = (
  id: string
): CatalogueCategoryProperty[] => {
  const filteredCategories = CatalogueCategoriesJSON.filter(
    (catalogueCategory) => catalogueCategory.id === id
  );

  if (filteredCategories.length === 0) {
    return [];
  }

  const properties = filteredCategories[0].properties ?? [];
  return properties as CatalogueCategoryProperty[];
};

export const getCatalogueCategoryById = (id: string): CatalogueCategory => {
  return CatalogueCategoriesJSON.find(
    (catalogueCategory) => catalogueCategory.id === id
  ) as CatalogueCategory;
};

export const getCatalogueItemById = (id: string): CatalogueItem | undefined => {
  return (
    (CatalogueItemsJSON.find(
      (catalogueItem) => catalogueItem.id === id
    ) as CatalogueItem) || undefined
  );
};

export const catalogueItemData = (id: string): CatalogueItem[] => {
  return CatalogueItemsJSON.filter(
    (catalogueItem) => catalogueItem.catalogue_category_id === id
  );
};

export const getManufacturerById = (id: string): Manufacturer | undefined => {
  return (
    (ManufacturersJSON.find(
      (manufacturer) => manufacturer.id === id
    ) as Manufacturer) || undefined
  );
};

export const getItemsByCatalogueItemId = (catalogueItemId: string): Item[] => {
  return ItemsJSON.filter((item) => item.catalogue_item_id === catalogueItemId);
};

export const getItemById = (itemId: string): Item => {
  return ItemsJSON.find((item) => item.id === itemId)!;
};

export const getItemsBySystemId = (systemId: string): Item[] => {
  return ItemsJSON.filter((item) => item.system_id === systemId);
};

export const getSystemById = (id: string): System | undefined => {
  return (
    (SystemsJSON.find((system) => system.id === id) as System) || undefined
  );
};

export const getSystemTypeByValue = (value: string): SystemType => {
  return SystemTypesJSON.find((type) => type.value === value)!;
};

export const getUsageStatusByValue = (value: string): UsageStatus => {
  return UsageStatusJSON.find((status) => status.value === value)!;
};

export const CREATED_MODIFIED_TIME_VALUES = {
  created_time: '2024-01-01T12:00:00.000+00:00',
  modified_time: '2024-01-02T13:10:10.000+00:00',
};

export const ADMIN_ROLE_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZSI6ImFkbWluIiwidXNlcklzQWRtaW4iOmZhbHNlLCJleHAiOjI1MzQwMjMwMDc5OX0.FrsDUqnKskhIvmIjtYVgC9im-cSu1dFlwVQ4cFJf2BgCaSh82XuEngOLkbtQuuXWC1wiipsGP4Y-usq7Q_R68vwXqGYusHo4fXw6AcBcwplgXZ3n60wsTegpBxKZY5foOre0Ng1GpK-7rrx9H-YQUCHSBOtzWOw_eLzu-eNTwMnMnnpGM9L91_hj0dAKiP90Z3Hp0UelnYydc0sf6msOs7RKI2Sij-13vFSL8LToIbfUTZYwKZHbBPD5glce_gsW6_W5W-iGemt7yyhfyf7IxKWq3Q02HCiSkI0uCcBal44sabPrsQ4EaPRwyUnH0X25MC00IAPRHh-1KqabV7IA9w';
export const DEFAULT_ROLE_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwicm9sZXMiOltdLCJ1c2VySXNBZG1pbiI6ZmFsc2UsImV4cCI6MjUzNDAyMzAwNzk5fQ.JTdyZHZTU2Vd1cZPzsBGBB_hs72KS4LODyhAyKdNTPWMnp_lEs2fmVSqJjSx3mOTW4J40c7LnJcw6ALlCGuEG3DShQKdoYTtH8JLNyzXi9yNYtPlBTEfWqFKK_IYY9sA_WzlQwYDGLD7jsvCvm92CdWjoNtcfDZ0eIfRjHuIRsW5XllerFFE7ouv9awulGCEHv-zl2m0SpMF-mHUYJV9JbB5bgrqs635vYL-IJg_qdr10Cn11BUhO1ulrFrk1QLhty-_L8LC2d2j11xqEuIMlEcVkQ6w79U1uzg-NEYcHzcuuaitQjZzKsDD8eMDT-dBkIPZxDWzlUuySkGUKDJPzw';
export const NO_USERNAME_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySXNBZG1pbiI6dHJ1ZSwiZXhwIjoyNTM0MDIzMDA3OTl9.ZDsEQSW12bFUnfiITz6-WVvibt0xwX2GIBDy-WVvpp8R_eTny4H7Xe1OyMLn3lKSM1sDhnkfItf054W2jJM8nVo0smkJPxs7xnlktTKr3ecZSPjn27afnyme_2OdGafXimEiJ6VuIWZJPEdsguYBKzPVp9aDqPO3AgXxT_MCfzn5-LkbFaeE49mZyYdWfCuxykERamdLjsaH_yRdRor-SKhowNFsLCJFWrz8FC7-mlxB3DYJgHbxf2jteJJL7kgx1zRqTDYU2OBeJzL9O8cfzWDLYgNR4quy4zjOV6aSzOBmp8EbH0H9vKn0ibgLmupnCMcdpVS6mf9WNgIny4iFJA';
