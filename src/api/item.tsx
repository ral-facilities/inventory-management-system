import { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AddItem, Item } from '../app.types';
import { imsApi } from './api';

const addItem = async (item: AddItem): Promise<Item> => {
  return imsApi
    .post<Item>(`/v1/items/`, item)
    .then((response) => response.data);
};

export const useAddItem = (): UseMutationResult<Item, AxiosError, AddItem> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: AddItem) => addItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Items'] });
    },
  });
};

const fetchItems = async (
  system_id?: string,
  catalogue_item_id?: string
): Promise<Item[]> => {
  const queryParams = new URLSearchParams();

  system_id && queryParams.append('system_id', system_id);
  catalogue_item_id &&
    queryParams.append('catalogue_item_id', catalogue_item_id);
  return imsApi
    .get(`/v1/items/`, {
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
  return useQuery({
    queryKey: ['Items', system_id, catalogue_item_id],
    queryFn: (params) => {
      return fetchItems(system_id, catalogue_item_id);
    },
    enabled: system_id !== undefined || catalogue_item_id !== undefined,
  });
};

const fetchItem = async (id?: string): Promise<Item> => {
  const queryParams = new URLSearchParams();

  return imsApi
    .get(`/v1/items/${id}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useItem = (id?: string): UseQueryResult<Item, AxiosError> => {
  return useQuery({
    queryKey: ['Item', id],
    queryFn: (params) => {
      return fetchItem(id);
    },
    enabled: !!id,
  });
};

const deleteItem = async (item: Item): Promise<void> => {
  return imsApi
    .delete(`/v1/items/${item.id}`, {})
    .then((response) => response.data);
};

export const useDeleteItem = (): UseMutationResult<void, AxiosError, Item> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Item) => deleteItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Items'] });
      queryClient.removeQueries({ queryKey: ['Item'] });
    },
  });
};
