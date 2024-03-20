import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderOptions, render } from '@testing-library/react';
import { enGB } from 'date-fns/locale/en-GB';
import {
  BrowserRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  createBrowserRouter,
  createMemoryRouter,
} from 'react-router-dom';
import {
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueItem,
  Item,
  Manufacturer,
} from './app.types';
import CatalogueCategoryJSON from './mocks/CatalogueCategory.json';
import CatalogueItemJSON from './mocks/CatalogueItems.json';
import ItemsJSON from './mocks/Items.json';
import ManufacturerJSON from './mocks/manufacturer.json';

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

export function renderComponentWithRouterProvider(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ui: any,
  pathName?: string,
  {
    // Automatically create a store instance if no store was passed i
    // Automatically create a query client instance if no query client was passed in
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const Root: React.FunctionComponent = () => {
    return (
      <LocalizationProvider adapterLocale={enGB} dateAdapter={AdapterDateFns}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path={pathName ?? '*'} element={ui} />
          </Routes>
        </QueryClientProvider>
      </LocalizationProvider>
    );
  };

  const routesConfig = [
    {
      path: '/*',
      Component: Root,
      children: [
        { path: '', Component: ui },
        { path: 'ims', Component: ui },
        { path: 'catalogue/*', Component: ui },
        {
          path: 'catalogue/item/:catalogue_item_id',
          Component: ui,
        },
        { path: 'catalogue/item/:catalogue_item_id/items', Component: ui },
        {
          path: 'catalogue/item/:catalogue_item_id/items/:item_id',
          Component: ui,
        },
        { path: 'systems/*', Component: ui },
        { path: 'manufacturers', Component: ui },
        {
          path: 'manufacturers/:manufacturer_id',
          Component: ui,
        },
      ],
    },
    { path: '*', Component: Root },
  ];

  const router =
    pathName !== undefined
      ? createMemoryRouter(routesConfig, {
          initialEntries: [pathName],
        })
      : createBrowserRouter([{ path: '*', Component: Root }]);

  function Wrapper(): JSX.Element {
    return <RouterProvider router={router} />;
  }
  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function renderComponentWithBrowserRouter(
  ui: React.ReactElement,
  {
    // Automatically create a store instance if no store was passed i
    // Automatically create a query client instance if no query client was passed in
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    return (
      <BrowserRouter>
        <LocalizationProvider adapterLocale={enGB} dateAdapter={AdapterDateFns}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </LocalizationProvider>
      </BrowserRouter>
    );
  }
  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function renderComponentWithMemoryRouter(
  ui: React.ReactElement,
  path: string,
  {
    // Automatically create a store instance if no store was passed i
    // Automatically create a query client instance if no query client was passed in
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): JSX.Element {
    return (
      <MemoryRouter initialEntries={[path]}>
        <LocalizationProvider adapterLocale={enGB} dateAdapter={AdapterDateFns}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </LocalizationProvider>
      </MemoryRouter>
    );
  }
  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export const hooksWrapperWithProviders = (queryClient?: QueryClient) => {
  const testQueryClient = queryClient ?? createTestQueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
  return wrapper;
};

export const getCatalogueItemsPropertiesById = (
  id: string
): CatalogueCategoryFormData[] => {
  const filteredCategories = CatalogueCategoryJSON.filter(
    (catalogueCategory) => catalogueCategory.id === id
  );

  if (filteredCategories.length === 0) {
    return [];
  }

  const properties = filteredCategories[0].catalogue_item_properties ?? [];
  return properties;
};

export const getCatalogueCategoryById = (
  id: string
): CatalogueCategory | undefined => {
  return (
    (CatalogueCategoryJSON.find(
      (catalogueCategory) => catalogueCategory.id === id
    ) as CatalogueCategory) || undefined
  );
};

export const getCatalogueItemById = (id: string): CatalogueItem | undefined => {
  return (
    (CatalogueItemJSON.find(
      (catalogueItem) => catalogueItem.id === id
    ) as CatalogueItem) || undefined
  );
};

export const catalogueItemData = (id: string): CatalogueItem[] => {
  return CatalogueItemJSON.filter(
    (catalogueitem) => catalogueitem.catalogue_category_id === id
  );
};

export const getManufacturerById = (id: string): Manufacturer | undefined => {
  return (
    (ManufacturerJSON.find(
      (manufacturer) => manufacturer.id === id
    ) as Manufacturer) || undefined
  );
};

export const getItemsByCatalogueItemId = (catalogueItemId: string): Item[] => {
  return ItemsJSON.filter((item) => item.catalogue_item_id === catalogueItemId);
};

export const getItemById = (itemId: string): Item | undefined => {
  return ItemsJSON.find((item) => item.id === itemId);
};

export const getItemsBySystemId = (systemId: string): Item[] => {
  return ItemsJSON.filter((item) => item.system_id === systemId);
};
