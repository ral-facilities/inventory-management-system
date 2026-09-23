import { queryOptions } from '@tanstack/react-query';
import { historyApi } from './api';
import { ItemSystemsHistoryEntry } from './api.types';
import { AxiosError } from 'axios';

const getItemSystemsEntries = async (
  item_id: string
): Promise<ItemSystemsHistoryEntry[]> => {
  const queryParams = new URLSearchParams();

  return historyApi
    .get(`/v1/item-system-entries/item-systems/${item_id}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const getItemSystemsEntriesQuery = (item_id: string, retry?: boolean) =>
  queryOptions<ItemSystemsHistoryEntry[], AxiosError>({
    queryKey: ['item_systems_entries', item_id],
    queryFn: () => getItemSystemsEntries(item_id),
    retry: retry ? false : undefined,
  });
