import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
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
