// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { RenderOptions, render } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import {
  CatalogueCategory,
  CatalogueCategoryFormData,
  CatalogueItem,
  Item,
  Manufacturer,
} from './app.types';
import CatalogueCategoryJSON from './mocks/CatalogueCategory.json';
import CatalogueItemJSON from './mocks/CatalogueItems.json';
import ManufacturerJSON from './mocks/manufacturer.json';
import ItemsJSON from './mocks/Items.json';
import { server } from './mocks/server';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import enGB from 'date-fns/locale/en-GB';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 300000,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: jest.fn(),
    },
  });

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  queryClient?: QueryClient;
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

export const getItemsBySystemId = (systemId: string): Item[] => {
  return ItemsJSON.filter((item) => item.system_id === systemId);
};
