import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { historyApi } from './api';
import { ItemSystemsHistoryEntry, SystemItemsHistoryEntry } from './api.types';
import { AxiosError } from 'axios';

const getItemSystemsEntries = async (
  item_id: string
): Promise<ItemSystemsHistoryEntry[]> => {
  return historyApi
    .get(`/v1/item-system-entries/item-systems/${item_id}`)
    .then((response) => {
      return response.data;
    });
};

export const useGetItemSystemsEntries = (
  item_id: string
): UseQueryResult<ItemSystemsHistoryEntry[], AxiosError> => {
  return useQuery({
    queryKey: ['ItemSystemsEntries', item_id],
    queryFn: () => getItemSystemsEntries(item_id),
    enabled: !!item_id,
  });
};

const getSystemItemsEntries = async (
  system_id: string
): Promise<SystemItemsHistoryEntry[]> => {
  return historyApi
    .get(`/v1/item-system-entries/system-items/${system_id}`)
    .then((response) => {
      return response.data;
    });
};

export const useGetSystemItemsEntries = (
  system_id: string
): UseQueryResult<SystemItemsHistoryEntry[], AxiosError> => {
  return useQuery({
    queryKey: ['SystemItemsEntries', system_id],
    queryFn: () => getSystemItemsEntries(system_id),
    enabled: !!system_id,
  });
};
