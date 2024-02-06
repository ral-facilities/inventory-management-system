import { renderHook, waitFor } from '@testing-library/react';
import {
  useAddItem,
  useDeleteItem,
  useEditItem,
  useItem,
  useItems,
  useMoveItemsToSystem,
} from './item';
import {
  getItemById,
  getItemsByCatalogueItemId,
  getItemsBySystemId,
  hooksWrapperWithProviders,
} from '../setupTests';
import {
  AddItem,
  EditItem,
  Item,
  MoveItemsToSystem,
  System,
} from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { imsApi } from './api';

describe('catalogue items api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAddItem', () => {
    let mockDataAdd: AddItem;
    beforeEach(() => {
      mockDataAdd = {
        catalogue_item_id: '1',
        system_id: null,
        purchase_order_number: 'fdsfdfs',
        is_defective: false,
        usage_status: 0,
        warranty_end_date: '2024-01-28T00:00:00.000Z',
        asset_number: 'ewqewq',
        serial_number: 'mxewe',
        delivered_date: '2024-01-26T00:00:00.000Z',
        notes: 'test',
        properties: [
          {
            name: 'Resolution',
            value: 12,
          },
          {
            name: 'Frame Rate',
            value: 30,
          },
          {
            name: 'Sensor Type',
            value: 'CMOS',
          },
          {
            name: 'Broken',
            value: true,
          },
          {
            name: 'Older than five years',
            value: false,
          },
        ],
      };
    });
    it('posts a request to add an item and returns successful response', async () => {
      const { result } = renderHook(() => useAddItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataAdd);
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
          { name: 'Resolution', value: 12 },
          { name: 'Frame Rate', value: 30 },
          { name: 'Sensor Type', value: 'CMOS' },
          { name: 'Broken', value: true },
          { name: 'Older than five years', value: false },
        ],
        purchase_order_number: 'fdsfdfs',
        serial_number: 'mxewe',
        system_id: null,
        usage_status: 0,
        warranty_end_date: '2024-01-28T00:00:00.000Z',
      });
    });
  });

  describe('useItems', () => {
    it('sends request to fetch items data using catalogue category id and returns successful response', async () => {
      const { result } = renderHook(() => useItems(undefined, '2'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(getItemsByCatalogueItemId('2'));
    });

    it('sends request to fetch items data using system id and returns successful response', async () => {
      const { result } = renderHook(
        () => useItems('65328f34a40ff5301575a4e4', undefined),
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

  describe('useItem', () => {
    it('sends request to fetch item data and returns successful response', async () => {
      const { result } = renderHook(() => useItem('KvT2Ox7n'), {
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
      result.current.mutate(getItemById('KvT2Ox7n'));
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual('');
    });
  });

  describe('useEditItem', () => {
    let mockDataEdit: EditItem;
    beforeEach(() => {
      mockDataEdit = {
        serial_number: 'test',
        id: 'KvT2Ox7n',
      };
    });
    it('posts a request to edit an item and returns successful response', async () => {
      const { result } = renderHook(() => useEditItem(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataEdit);
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
          { name: 'Resolution', unit: 'megapixels', value: 0 },
          { name: 'Frame Rate', unit: 'fps', value: null },
          { name: 'Sensor Type', unit: '', value: 'CMOS' },
          { name: 'Sensor brand', unit: '', value: null },
          { name: 'Broken', unit: '', value: true },
          { name: 'Older than five years', unit: '', value: false },
        ],
        purchase_order_number: '6JYHEjwN',
        serial_number: 'test',
        system_id: null,
        usage_status: 1,
        warranty_end_date: '2023-04-04T23:00:00.000Z',
      });
    });
  });

  describe('useMoveItemsToSystem', () => {
    const mockItems: Item[] = [
      getItemById('KvT2Ox7n'),
      getItemById('G463gOIA'),
    ];

    let moveItemsToSystem: MoveItemsToSystem;

    // Use patch spy for testing since response is not actual data in this case
    // so can't test the underlying use of editSystem otherwise
    let axiosPatchSpy;

    beforeEach(() => {
      moveItemsToSystem = {
        // Prevent test interference if modifying the selected items
        selectedItems: JSON.parse(JSON.stringify(mockItems)),
        targetSystem: SystemsJSON[0] as System,
      };

      axiosPatchSpy = jest.spyOn(imsApi, 'patch');
    });

    afterEach(() => {
      jest.clearAllMocks();
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
        })
      );
      expect(result.current.data).toEqual(
        moveItemsToSystem.selectedItems.map((item) => ({
          message: `Successfully moved to Giant laser`,
          name: item.id,
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

      // Fail just the 1st system
      moveItemsToSystem.selectedItems[0].id = 'Error 409';

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
        })
      );
      expect(result.current.data).toEqual(
        moveItemsToSystem.selectedItems
          .map((item, index) =>
            index === 0
              ? {
                  message: 'The specified system ID does not exist',
                  name: item.id,
                  state: 'error',
                }
              : {
                  message: 'Successfully moved to New system name',
                  name: item.id,
                  state: 'success',
                }
          )
          // Exception takes longer to resolve so it gets added last
          .reverse()
      );
    });
  });
});
