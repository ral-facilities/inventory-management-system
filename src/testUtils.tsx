import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderOptions, render } from '@testing-library/react';
import { enGB } from 'date-fns/locale/en-GB';
import React from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  createMemoryRouter,
} from 'react-router-dom';
import { paths } from './App';
import {
  CatalogueCategory,
  CatalogueCategoryProperty,
  CatalogueItem,
  Item,
  Manufacturer,
} from './api/api.types';
import CatalogueCategoriesJSON from './mocks/CatalogueCategories.json';
import CatalogueItemsJSON from './mocks/CatalogueItems.json';
import ItemsJSON from './mocks/Items.json';
import ManufacturersJSON from './mocks/Manufacturers.json';

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
  urlPathKey?: keyof typeof paths,
  initialEntry?: string
) {
  const Root: React.FunctionComponent = () => {
    return (
      <LocalizationProvider adapterLocale={enGB} dateAdapter={AdapterDateFns}>
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </LocalizationProvider>
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
  urlPathKey?: keyof typeof paths,
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
  urlPathKey?: keyof typeof paths,
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
  urlPathKey?: keyof typeof paths;
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

export const getCatalogueCategoryById = (
  id: string
): CatalogueCategory | undefined => {
  return (
    (CatalogueCategoriesJSON.find(
      (catalogueCategory) => catalogueCategory.id === id
    ) as CatalogueCategory) || undefined
  );
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

export const getItemById = (itemId: string): Item | undefined => {
  return ItemsJSON.find((item) => item.id === itemId);
};

export const getItemsBySystemId = (systemId: string): Item[] => {
  return ItemsJSON.filter((item) => item.system_id === systemId);
};

/* This counter and the function below it are used for forcing UUID's to be deterministic */
let globalUUIDCounter = 0;
const generateUUIDBytes = (): Uint8Array => {
  const byteArray = new Uint8Array(16);
  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = (globalUUIDCounter + i) % 256; // Ensuring the value stays within byte range
  }
  globalUUIDCounter++;
  return byteArray;
};

/* Mock uuid's generated for snapshot tests to ensure they are deterministic rather than random */
export const mockUUIDv4 = () => {
  globalUUIDCounter = 0;
  vi.mock('uuid', async () => {
    const uuid = await vi.importActual('uuid');
    return {
      ...uuid,
      v4: vi.fn(() =>
        // @ts-expect-error Unknown as don't want to import here
        uuid.v4({
          random: generateUUIDBytes(),
        })
      ),
    };
  });
};

export const CREATED_MODIFIED_TIME_VALUES = {
  created_time: '2024-01-01T12:00:00.000+00:00',
  modified_time: '2024-01-02T13:10:10.000+00:00',
};
