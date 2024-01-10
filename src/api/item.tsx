import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { AddItem, Item } from '../app.types';
import { settings } from '../settings';

const addItem = async (item: AddItem): Promise<Item> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }

  return axios
    .post<Item>(`${apiUrl}/v1/items/`, item)
    .then((response) => response.data);
};

export const useAddItem = (): UseMutationResult<Item, AxiosError, AddItem> => {
  return useMutation((item: AddItem) => addItem(item));
};

const fetchItems = async (
  system_id?: string,
  catalogue_item_id?: string
): Promise<Item[]> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  system_id && queryParams.append('system_id', system_id);
  catalogue_item_id &&
    queryParams.append('catalogue_item_id', catalogue_item_id);

  return axios
    .get(`${apiUrl}/v1/items/`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useItems = (
  system_id?: string,
  catalogue_item_id?: string
): UseQueryResult<Item[], AxiosError> => {
  return useQuery<Item[], AxiosError>(
    ['Items', system_id, catalogue_item_id],
    (params) => {
      return fetchItems(system_id, catalogue_item_id);
    }
  );
};
