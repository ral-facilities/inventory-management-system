import { queryOptions, useQuery, UseQueryResult } from '@tanstack/react-query';
import { historyApi } from './api';
import {
  HistoryEntry,
  ItemSystemsHistoryEntry,
  SystemItemsHistoryEntry,
} from './api.types';
import { AxiosError } from 'axios';

const getHistoryEntries = async (
  collection: string,
  entity_id: string
  // The other filterable params will be added in at a later date
  // operation_type: string,
  // order_descending: boolean
): Promise<HistoryEntry[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('entity_id', entity_id);

  return historyApi.get(`/v1/history-entries/${collection}`, {
    params: queryParams,
  });
};

// export const getHistoryEntriesQuery = (
//   collection: string,
//   entity_id: string,
//   retry?: boolean
// ) =>
//   queryOptions<HistoryEntry[], AxiosError>({
//     queryKey: ['history_entries', collection, entity_id],
//     queryFn: () => getHistoryEntries(collection, entity_id),
//     retry: retry ? false : undefined,
//   });

export const useGetHistoryEntries = (
  collection: string,
  entity_id: string
): UseQueryResult<HistoryEntry[], AxiosError> => {
  return useQuery({
    queryKey: ['HistoryEntries', collection, entity_id],
    queryFn: () => getHistoryEntries(collection, entity_id),
    enabled: !!entity_id,
  });
};

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
