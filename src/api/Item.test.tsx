import { renderHook, waitFor } from '@testing-library/react';
import { useAddItem } from './item';
import { hooksWrapperWithProviders } from '../setupTests';
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
});
