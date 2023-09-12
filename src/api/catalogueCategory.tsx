import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AddCatalogueCategory,
  CatalogueCategory,
  EditCatalogueCategory,
} from '../app.types';
import { settings } from '../settings';

const fetchCatalogueCategory = async (
  path?: string,
  parentPath?: string
): Promise<CatalogueCategory[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();
  if (path) {
    queryParams.append('path', path);
  }
  if (parentPath) {
    queryParams.append('parent_path', parentPath);
  }
  return axios
    .get(`${apiUrl}/v1/catalogue-categories/`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueCategory = (
  path?: string,
  parent_path?: string
): UseQueryResult<CatalogueCategory[], AxiosError> => {
  return useQuery<CatalogueCategory[], AxiosError>(
    ['CatalogueCategory', path, parent_path],
    (params) => {
      return fetchCatalogueCategory(path, parent_path);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const addCatalogueCategory = async (
  catalogueCategory: AddCatalogueCategory
): Promise<CatalogueCategory> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<CatalogueCategory>(
      `${apiUrl}/v1/catalogue-categories`,
      catalogueCategory
    )
    .then((response) => response.data);
};

export const useAddCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  AddCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueCategory: AddCatalogueCategory) =>
      addCatalogueCategory(catalogueCategory),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategory'] });
      },
    }
  );
};

const editCatalogueCategory = async (
  catalogueCategory: EditCatalogueCategory
): Promise<CatalogueCategory> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const { id, ...updatedCategory } = catalogueCategory;
  return axios
    .patch<CatalogueCategory>(
      `${apiUrl}/v1/catalogue-categories/${id}`,
      updatedCategory
    )
    .then((response) => response.data);
};

export const useEditCatalogueCategory = (): UseMutationResult<
  CatalogueCategory,
  AxiosError,
  EditCatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueCategory: EditCatalogueCategory) =>
      editCatalogueCategory(catalogueCategory),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategory'] });
      },
    }
  );
};

const deleteCatalogueCategory = async (
  session: CatalogueCategory
): Promise<void> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .delete(`${apiUrl}/v1/catalogue-categories/${session.id}`, {})
    .then((response) => response.data);
};

export const useDeleteCatalogueCategory = (): UseMutationResult<
  void,
  AxiosError,
  CatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (session: CatalogueCategory) => deleteCatalogueCategory(session),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategory'] });
      },
    }
  );
};
