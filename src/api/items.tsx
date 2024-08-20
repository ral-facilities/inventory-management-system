import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  AddItem,
  AddItems,
  EditItem,
  Item,
  MoveItemsToSystem,
  TransferState,
} from '../app.types';
import { imsApi } from './api';
import { APIError } from './api.types';

const addItem = async (item: AddItem): Promise<Item> => {
  return imsApi.post<Item>(`/v1/items`, item).then((response) => response.data);
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

export const useAddItems = (): UseMutationResult<
  TransferState[],
  AxiosError,
  AddItems
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addItems: AddItems) => {
      const transferStates: TransferState[] = [];
      const successfulSerialNumbers: string[] = [];

      const promises = [];

      for (
        let i = addItems.startingValue;
        i < addItems.startingValue + addItems.quantity;
        i++
      ) {
        const item: AddItem = {
          ...addItems.item,
          serial_number:
            addItems.item.serial_number?.replace('%s', String(i)) ?? null,
        };

        const promise = addItem(item)
          .then((result: Item) => {
            transferStates.push({
              name: result.serial_number ?? '',
              message: `Successfully created ${result.serial_number ?? ''}`,
              state: 'success',
            });
            successfulSerialNumbers.push(result.serial_number ?? '');
          })
          .catch((error) => {
            const response = error.response?.data as APIError;
            transferStates.push({
              name: item.serial_number ?? '',
              message: response.detail,
              state: 'error',
            });
          });

        promises.push(promise);
      }

      await Promise.all(promises);
      if (successfulSerialNumbers.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ['Items', undefined, addItems.item.catalogue_item_id],
        });
        queryClient.invalidateQueries({
          queryKey: ['Items', addItems.item.system_id, undefined],
        });
      }

      return transferStates;
    },
  });
};

const fetchItems = async (
  system_id?: string,
  catalogue_item_id?: string
): Promise<Item[]> => {
  const queryParams = new URLSearchParams();

  if (system_id) queryParams.append('system_id', system_id);
  if (catalogue_item_id)
    queryParams.append('catalogue_item_id', catalogue_item_id);
  return imsApi
    .get(`/v1/items`, {
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
    queryFn: () => {
      return fetchItems(system_id, catalogue_item_id);
    },
    enabled: system_id !== undefined || catalogue_item_id !== undefined,
  });
};

const fetchItem = async (id: string): Promise<Item> => {
  const queryParams = new URLSearchParams();

  return imsApi
    .get(`/v1/items/${id}`, {
      params: queryParams,
    })
    .then((response) => {
      return response.data;
    });
};

export const useItem = (
  id?: string | null
): UseQueryResult<Item, AxiosError> => {
  return useQuery({
    queryKey: ['Item', id],
    queryFn: () => {
      return fetchItem(id ?? '');
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

const editItem = async (item: EditItem): Promise<Item> => {
  const { id, ...updatedItem } = item;
  return imsApi
    .patch<Item>(`/v1/items/${id}`, updatedItem)
    .then((response) => response.data);
};

export const useEditItem = (): UseMutationResult<
  Item,
  AxiosError,
  EditItem
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: EditItem) => editItem(item),
    onSuccess: (itemResponse: Item) => {
      queryClient.invalidateQueries({
        queryKey: [
          'Items',
          itemResponse.system_id,
          itemResponse.catalogue_item_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['Items', undefined, itemResponse.catalogue_item_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['Items', itemResponse.system_id, undefined],
      });
      queryClient.invalidateQueries({
        queryKey: ['Items', undefined, undefined],
      });
      queryClient.invalidateQueries({ queryKey: ['Item', itemResponse.id] });
    },
  });
};

export const useMoveItemsToSystem = (): UseMutationResult<
  TransferState[],
  AxiosError,
  MoveItemsToSystem
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moveItemsToSystem: MoveItemsToSystem) => {
      const transferStates: TransferState[] = [];

      // Ids for invalidation (system ids must be a string value of 'null' for invalidation)
      const successfulIds: string[] = [];
      const successfulSystemIds: string[] = [];

      const promises = moveItemsToSystem.selectedItems.map(
        async (item: Item) => {
          return editItem({
            id: item.id,
            system_id: moveItemsToSystem.targetSystem?.id || '',
            usage_status_id: moveItemsToSystem.usageStatuses.find(
              (status) => status.item_id === item.id
            )?.usage_status_id,
          })
            .then((result: Item) => {
              const targetSystemName =
                moveItemsToSystem.targetSystem?.name || 'Root';
              transferStates.push({
                // Not technically a name, but will be displayed as ID: Message
                name: item.serial_number ?? 'No serial number',
                message: `Successfully moved to ${targetSystemName}`,
                state: 'success',
              });

              successfulIds.push(result.id);
              successfulSystemIds.push(item.system_id || 'null');
            })
            .catch((error) => {
              const response = error.response?.data as APIError;

              transferStates.push({
                name: item.serial_number ?? 'No serial number',
                message: response.detail,
                state: 'error',
              });
            });
        }
      );

      await Promise.all(promises);

      if (successfulIds.length > 0) {
        queryClient.invalidateQueries({
          // Invalidate all queries of items that have the target system id
          queryKey: ['Items', moveItemsToSystem.targetSystem?.id || 'null'],
        });
        // Also need to invalidate each parent system we are moving from (likely just the one)
        const uniqueSystemIds = new Set(successfulSystemIds);
        uniqueSystemIds.forEach((systemId: string) =>
          queryClient.invalidateQueries({
            // Invalidate all queries of items that have the target system id
            queryKey: ['Items', systemId],
          })
        );
      }

      return transferStates;
    },
  });
};
