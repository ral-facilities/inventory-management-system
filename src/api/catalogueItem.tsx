import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
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
    .post<CatalogueItem>(`${apiUrl}/v1/catalogue-items`, catalogueCategory)
    .then((response) => response.data);
};

export const useAddCatalogueItem = (): UseMutationResult<
  CatalogueItem,
  AxiosError,
  AddCatalogueItem
> => {
  return useMutation(
    (catalogueItem: AddCatalogueItem) => addCatalogueItem(catalogueItem),
    {
      onError: (error) => {
        console.log('Got error ' + error.message);
      },
    }
  );
};
