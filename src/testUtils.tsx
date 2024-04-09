import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderOptions, render } from '@testing-library/react';
import { enGB } from 'date-fns/locale/en-GB';
import {
  RouterProvider,
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
import CatalogueCategoriesJSON from './mocks/CatalogueCategories.json';
import CatalogueItemsJSON from './mocks/CatalogueItems.json';
import ItemsJSON from './mocks/Items.json';
import ManufacturersJSON from './mocks/Manufacturers.json';
import { paths } from './App';

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
  ui: React.ReactElement,
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
  const wrapper = ({ children }): JSX.Element => {
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
): CatalogueCategoryFormData[] => {
  const filteredCategories = CatalogueCategoriesJSON.filter(
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
    (catalogueitem) => catalogueitem.catalogue_category_id === id
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
