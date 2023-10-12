import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  AddCatalogueCategory,
  BreadcrumbsInfo,
  CatalogueCategory,
  EditCatalogueCategory,
} from '../app.types';
import { settings } from '../settings';

const fetchCatalogueCategory = async (
  parent_id?: string
): Promise<CatalogueCategory[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();
  if (parent_id) {
    queryParams.append('parent_id', parent_id);
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
  id?: string,
  parent_id?: string
): UseQueryResult<CatalogueCategory[], AxiosError> => {
  return useQuery<CatalogueCategory[], AxiosError>(
    ['CatalogueCategory', id, parent_id],
    (params) => {
      return fetchCatalogueCategory(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};

const fetchCatalogueBreadcrumbs = async (
  id: string
): Promise<BreadcrumbsInfo> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/catalogue-categories/${id}/breadcrumbs`, {})
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueBreadcrumbs = (
  id: string
): UseQueryResult<BreadcrumbsInfo, AxiosError> => {
  return useQuery<BreadcrumbsInfo, AxiosError>(
    ['CatalogueBreadcrumbs', id],
    (params) => {
      return fetchCatalogueBreadcrumbs(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== '',
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
        queryClient.invalidateQueries({ queryKey: ['CatalogueCategoryByID'] });
      },
    }
  );
};

const deleteCatalogueCategory = async (
  catalogueCategory: CatalogueCategory
): Promise<void> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .delete(`${apiUrl}/v1/catalogue-categories/${catalogueCategory.id}`, {})
    .then((response) => response.data);
};

export const useDeleteCatalogueCategory = (): UseMutationResult<
  void,
  AxiosError,
  CatalogueCategory
> => {
  const queryClient = useQueryClient();
  return useMutation(
    (catalogueCategory: CatalogueCategory) =>
      deleteCatalogueCategory(catalogueCategory),
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

const fetchCatalogueCategoryById = async (
  id: string | undefined
): Promise<CatalogueCategory> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .get(`${apiUrl}/v1/catalogue-categories/${id}`, {})
    .then((response) => {
      return response.data;
    });
};

export const useCatalogueCategoryById = (
  id: string | undefined
): UseQueryResult<CatalogueCategory, AxiosError> => {
  return useQuery<CatalogueCategory, AxiosError>(
    ['CatalogueCategoryByID', id],
    (params) => {
      return fetchCatalogueCategoryById(id);
    },
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
      enabled: id !== undefined,
    }
  );
};
