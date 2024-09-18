import { renderHook, waitFor } from '@testing-library/react';
import { MockInstance } from 'vitest';
import {
  MoveItemsToSystem,
  MoveItemsToSystemUsageStatus,
  PostItems,
} from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import {
  getItemById,
  getItemsByCatalogueItemId,
  getItemsBySystemId,
  hooksWrapperWithProviders,
} from '../testUtils';
import { imsApi } from './api';
import { Item, ItemPatch, ItemPost, System } from './api.types';
import {
  useDeleteItem,
  useGetItem,
  useGetItems,
  useMoveItemsToSystem,
  usePatchItem,
  usePostItem,
  usePostItems,
} from './items';

describe('items api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePostItem', () => {
    let mockDataPost: ItemPost;
    beforeEach(() => {
      mockDataPost = {
        catalogue_item_id: '1',
        system_id: '65328f34a40ff5301575a4e3',
        purchase_order_number: 'fdsfdfs',
        is_defective: false,
        usage_status_id: '0',
        warranty_end_date: '2024-01-28T00:00:00.000Z',
        asset_number: 'ewqewq',
        serial_number: 'mxewe',
        delivered_date: '2024-01-26T00:00:00.000Z',
        notes: 'test',
        properties: [
          {
            id: '1',
            value: 12,
          },
          {
            id: '2',
            value: 30,
          },
          {
            id: '3',
            value: 'CMOS',
          },
          {
            id: '5',
            value: true,
          },
          {
            id: '6',
            value: false,
          },
        ],
      };
    });
    it('posts a request to add an item and returns successful response', async () => {
      const { result } = renderHook(() => usePostItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataPost);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        asset_number: 'ewqewq',
        catalogue_item_id: '1',
        delivered_date: '2024-01-26T00:00:00.000Z',
        id: '1',
        is_defective: false,
        notes: 'test',
        properties: [
          { id: '1', value: 12, name: 'Resolution', unit: 'megapixels' },
          { id: '2', value: 30, name: 'Frame Rate', unit: 'fps' },
          { id: '3', value: 'CMOS', name: 'Sensor Type', unit: null },
          { id: '5', value: true, name: 'Broken', unit: null },
          { id: '6', value: false, name: 'Older than five years', unit: null },
        ],
        purchase_order_number: 'fdsfdfs',
        serial_number: 'mxewe',
        system_id: '65328f34a40ff5301575a4e3',
        usage_status: 'New',
        usage_status_id: '0',
        warranty_end_date: '2024-01-28T00:00:00.000Z',
      });
    });
  });

  describe('useGetItems', () => {
    it('sends request to fetch items data using catalogue category id and returns successful response', async () => {
      const { result } = renderHook(() => useGetItems(undefined, '2'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(getItemsByCatalogueItemId('2'));
    });

    it('sends request to fetch items data using system id and returns successful response', async () => {
      const { result } = renderHook(
        () => useGetItems('65328f34a40ff5301575a4e4', undefined),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(
        getItemsBySystemId('65328f34a40ff5301575a4e4')
      );
    });
  });

  describe('useGetItem', () => {
    it('sends request to fetch item data and returns successful response', async () => {
      const { result } = renderHook(() => useGetItem('KvT2Ox7n'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(getItemById('KvT2Ox7n'));
    });
  });

  describe('useDeleteItem', () => {
    it('posts a request to delete an Item and returns successful response', async () => {
      const { result } = renderHook(() => useDeleteItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(getItemById('KvT2Ox7n') as Item);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({ status: 204 });
    });
  });

  describe('usePatchItem', () => {
    let mockDataPatch: ItemPatch;
    beforeEach(() => {
      mockDataPatch = {
        serial_number: 'test',
      };
    });
    it('posts a request to edit an item and returns successful response', async () => {
      const { result } = renderHook(() => usePatchItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate({ id: 'KvT2Ox7n', item: mockDataPatch });
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        asset_number: 'LyH8yp1FHf',
        catalogue_item_id: '1',
        delivered_date: '2023-03-17T00:00:00.000Z',
        id: 'KvT2Ox7n',
        is_defective: false,
        notes: '6Y5XTJfBrNNx8oltI9HE',
        properties: [
          {
            id: '1',
            name: 'Resolution',
            unit: 'megapixels',
            unit_id: '1',
            value: 0,
          },
          {
            id: '2',
            name: 'Frame Rate',
            unit: 'fps',
            unit_id: '2',
            value: null,
          },
          {
            id: '3',
            name: 'Sensor Type',
            unit: null,
            unit_id: null,
            value: 'CMOS',
          },
          {
            id: '4',
            name: 'Sensor brand',
            unit: null,
            unit_id: null,
            value: null,
          },
          { id: '5', name: 'Broken', unit: null, unit_id: null, value: true },
          {
            id: '6',
            name: 'Older than five years',
            unit: null,
            unit_id: null,
            value: false,
          },
        ],
        purchase_order_number: '6JYHEjwN',
        serial_number: 'test',
        system_id: '65328f34a40ff5301575a4e3',
        usage_status_id: '1',
        warranty_end_date: '2023-04-04T23:00:00.000Z',
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
      });
    });
  });

  describe('useMoveItemsToSystem', () => {
    const mockItems: Item[] = [
      getItemById('KvT2Ox7n') as Item,
      getItemById('G463gOIA') as Item,
    ];

    const mockUsageStatuses: MoveItemsToSystemUsageStatus[] = [
      { item_id: 'KvT2Ox7n', usage_status_id: '0' },
      { item_id: 'G463gOIA', usage_status_id: '0' },
    ];

    let moveItemsToSystem: MoveItemsToSystem;

    // Use patch spy for testing since response is not actual data in this case
    // so can't test the underlying use of patchSystem otherwise
    let axiosPatchSpy: MockInstance;

    beforeEach(() => {
      moveItemsToSystem = {
        // Prevent test interference if modifying the usage statuses or selected items
        usageStatuses: JSON.parse(JSON.stringify(mockUsageStatuses)),
        selectedItems: JSON.parse(JSON.stringify(mockItems)),
        targetSystem: SystemsJSON[0] as System,
      };

      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('sends requests to move multiple items to a system and returns a successful response for each', async () => {
      const { result } = renderHook(() => useMoveItemsToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(moveItemsToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveItemsToSystem.selectedItems.map((item) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(`/v1/items/${item.id}`, {
          system_id: moveItemsToSystem.targetSystem.id,
          usage_status_id: moveItemsToSystem.usageStatuses.find(
            (status) => status.item_id === item.id
          )?.usage_status_id,
        })
      );
      expect(result.current.data).toEqual(
        moveItemsToSystem.selectedItems.map((item) => ({
          message: `Successfully moved to Giant laser`,
          name: item.serial_number,
          state: 'success',
        }))
      );
    });

    it('handles a failed request to move items to a system correctly', async () => {
      moveItemsToSystem.targetSystem = {
        ...(SystemsJSON[0] as System),
        name: 'New system name',
        id: 'new_system_id',
      };
      moveItemsToSystem.usageStatuses = [
        ...moveItemsToSystem.usageStatuses,
        { item_id: 'Error 409', usage_status_id: '2' },
      ];

      // Fail just the 1st system
      moveItemsToSystem.selectedItems[0].id = 'Error 409';
      moveItemsToSystem.selectedItems[0].serial_number = null;

      const { result } = renderHook(() => useMoveItemsToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(moveItemsToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveItemsToSystem.selectedItems.map((item) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(`/v1/items/${item.id}`, {
          system_id: 'new_system_id',
          usage_status_id: moveItemsToSystem.usageStatuses.find(
            (status) => status.item_id === item.id
          )?.usage_status_id,
        })
      );
      expect(result.current.data).toEqual(
        moveItemsToSystem.selectedItems
          .map((item, index) =>
            index === 0
              ? {
                  message: 'The specified system ID does not exist',
                  name: item.serial_number ?? 'No serial number',
                  state: 'error',
                }
              : {
                  message: 'Successfully moved to New system name',
                  name: item.serial_number,
                  state: 'success',
                }
          )
          // Exception takes longer to resolve so it gets added last
          .reverse()
      );
    });
  });

  describe('usePostItems', () => {
    let postItems: PostItems;

    // Use post spy for testing since response is not actual data in this case
    // so can't test the underlying use of patchSystem otherwise
    let axiosPostSpy: MockInstance;
    const { id, ...item } = getItemById('KvT2Ox7n') as Item;

    beforeEach(() => {
      postItems = {
        quantity: 2,
        startingValue: 10,
        item: {
          ...item,
          serial_number: item.serial_number + '_%s',
        },
      };

      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('sends requests to add multiple items and returns a successful response for each', async () => {
      const { result } = renderHook(() => usePostItems(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(postItems);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      for (
        let i = postItems.startingValue;
        i < postItems.startingValue + postItems.quantity;
        i++
      ) {
        expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
          ...item,
          serial_number: item.serial_number + `_${i}`,
        });
      }

      expect(result.current.data).toEqual([
        {
          message: 'Successfully created 5YUQDDjKpz2z_10',
          name: '5YUQDDjKpz2z_10',
          state: 'success',
        },
        {
          message: 'Successfully created 5YUQDDjKpz2z_11',
          name: '5YUQDDjKpz2z_11',
          state: 'success',
        },
      ]);
    });

    it('handles failed requests when adding multiple items correctly', async () => {
      postItems.item.serial_number = 'Error 500';

      const { result } = renderHook(() => usePostItems(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(postItems);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      for (
        let i = postItems.startingValue;
        i < postItems.startingValue + postItems.quantity;
        i++
      ) {
        expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
          ...item,
          serial_number: 'Error 500',
        });
      }

      expect(result.current.data).toEqual([
        {
          message: 'Something went wrong',
          name: 'Error 500',
          state: 'error',
        },
        {
          message: 'Something went wrong',
          name: 'Error 500',
          state: 'error',
        },
      ]);
    });
  });
});
