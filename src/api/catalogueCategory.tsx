import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { CatalogueCategoryResponse, CatalogueCategory } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';
import { settings } from '../settings';

const addCatalogueCategory = async (
  catalogueCategory: CatalogueCategory
): Promise<CatalogueCategoryResponse> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<CatalogueCategoryResponse>(
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
  CatalogueCategoryResponse,
  AxiosError,
  CatalogueCategory
> => {
  return useMutation(
    (catalogueCategory: CatalogueCategory) =>
      addCatalogueCategory(catalogueCategory),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
