import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AddCatalogueItem, CatalogueItem } from '../app.types';
import { settings } from '../settings';

const addCatalogueItem = async (
  catalogueCategory: AddCatalogueItem
): Promise<CatalogueItem> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<CatalogueItem>(`${apiUrl}/v1/catalogue-items/`, catalogueCategory)
    .then((response) => response.data);
};

export const useAddCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  AddCatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueItem: AddCatalogueItem) => addCatalogueItem(catalogueItem),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
      },
    }
  );
};

const fetchCatalogueItems = async (
  catalogueCategoryId: string | null
): Promise<CatalogueItem[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  if (catalogueCategoryId)
    queryParams.append('catalogue_category_id', catalogueCategoryId);

  return axios
    .get(`${apiUrl}/v1/catalogue-items/`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueItems = (
  catalogueCategoryId: string | null
): UseQueryResult<CatalogueItem[], AxiosError> => {
  return useQuery<CatalogueItem[], AxiosError>(
    ['CatalogueItems', catalogueCategoryId],
    (params) => {
      return fetchCatalogueItems(catalogueCategoryId);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const fetchCatalogueItem = async (
  catalogueCategoryId: string | null
): Promise<CatalogueItem> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  return axios
    .get(`${apiUrl}/v1/catalogue-items/${catalogueCategoryId}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueItem = (
  catalogueCategoryId: string
): UseQueryResult<CatalogueItem, AxiosError> => {
  return useQuery<CatalogueItem, AxiosError>(
    ['CatalogueItem', catalogueCategoryId],
    (params) => {
      return fetchCatalogueItem(catalogueCategoryId);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const deleteCatalogueItem = async (
  catalogueItem: CatalogueItem
): Promise<void> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .delete(`${apiUrl}/v1/catalogue-items/${catalogueItem.id}`, {})
    .then((response) => response.data);
};

export const useDeleteCatalogueItem = (): UseMutationResult<
  void,
  AxiosError,
  CatalogueItem
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueItem: CatalogueItem) => deleteCatalogueItem(catalogueItem),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueItems'] });
        queryClient.removeQueries({ queryKey: ['CatalogueItem'] });
      },
    }
  );
};
