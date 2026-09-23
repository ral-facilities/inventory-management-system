import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { historyApi } from './api';
import { ItemSystemsHistoryEntry } from './api.types';
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
    queryKey: ['item_systems_entries', item_id],
    queryFn: () => getItemSystemsEntries(item_id),
  });
};
