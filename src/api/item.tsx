import axios, { AxiosError } from 'axios';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  AddItem,
  EditItem,
  ErrorParsing,
  Item,
  MoveItemsToSystem,
  TransferState,
} from '../app.types';
import { settings } from '../settings';

const addItem = async (item: AddItem): Promise<Item> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .post<Item>(`${apiUrl}/v1/items`, item)
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
    .get(`${apiUrl}/v1/items`, {
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

const fetchItem = async (id: string): Promise<Item> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const queryParams = new URLSearchParams();

  return axios
    .get(`${apiUrl}/v1/items/${id}`, {
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
    queryFn: (params) => {
      return fetchItem(id ?? '');
    },
    enabled: !!id,
  });
};

const deleteItem = async (item: Item): Promise<void> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  return axios
    .delete(`${apiUrl}/v1/items/${item.id}`, {})
    .then((response) => response.data);
};

export const useDeleteItem = (): UseMutationResult<void, AxiosError, Item> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Item) => deleteItem(item),
    onError: (error) => {
      console.log('Got error ' + error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Items'] });
      queryClient.removeQueries({ queryKey: ['Item'] });
    },
  });
};

const editItem = async (item: EditItem): Promise<Item> => {
  let apiUrl: string;
  apiUrl = '';
  const settingsResult = await settings;
  if (settingsResult) {
    apiUrl = settingsResult['apiUrl'];
  }
  const { id, ...updatedItem } = item;
  return axios
    .patch<Item>(`${apiUrl}/v1/items/${id}`, updatedItem)
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
          })
            .then((result: Item) => {
              const targetSystemName =
                moveItemsToSystem.targetSystem?.name || 'Root';
              transferStates.push({
                // Not technically a name, but will be displayed as ID: Message
                name: item.id,
                message: `Successfully moved to ${targetSystemName}`,
                state: 'success',
              });

              successfulIds.push(result.id);
              successfulSystemIds.push(item.system_id || 'null');
            })
            .catch((error) => {
              const response = error.response?.data as ErrorParsing;

              transferStates.push({
                name: item.id,
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
