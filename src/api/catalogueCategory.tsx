import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  AddCatalogueCategoryResponse,
  AddCatalogueCategory,
  ViewCatalogueCategoryResponse,
} from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { settings } from '../settings';

const fetchCatalogueCategory = async (
  path?: string,
  parentPath?: string
): Promise<ViewCatalogueCategoryResponse[]> => {
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
): UseQueryResult<ViewCatalogueCategoryResponse[], AxiosError> => {
  return useQuery<ViewCatalogueCategoryResponse[], AxiosError>(
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
): Promise<AddCatalogueCategoryResponse> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<AddCatalogueCategoryResponse>(
      `${apiUrl}/v1/catalogue-categories`,
      catalogueCategory,
      {
        headers: {
          Authorization: `Bearer ${readSciGatewayToken()}`,
        },
      }
    )
    .then((response) => response.data);
};

export const useAddCatalogueCategory = (): UseMutationResult<
  AddCatalogueCategoryResponse,
  AxiosError,
  AddCatalogueCategory
> => {
  return useMutation(
    (catalogueCategory: AddCatalogueCategory) =>
      addCatalogueCategory(catalogueCategory),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
