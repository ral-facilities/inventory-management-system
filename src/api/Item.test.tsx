import { renderHook, waitFor } from '@testing-library/react';
import { useAddItem, useDeleteItem, useItem, useItems } from './item';
import {
  getItemById,
  getItemsByCatalogueItemId,
  getItemsBySystemId,
  hooksWrapperWithProviders,
} from '../setupTests';
import { AddItem } from '../app.types';

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
    it('posts a request to delete a catalogue Item and returns successful response', async () => {
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
});
