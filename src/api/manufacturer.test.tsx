import { renderHook, waitFor } from '@testing-library/react';
import { AddManufacturer, ViewManufacturerResponse } from '../app.types';
import { hooksWrapperWithProviders } from '../setupTests';
import {
  useAddManufacturer,
  useDeleteManufacturer,
  useManufacturers,
} from './manufacturer';

describe('manufacturer api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useAddManufacturer', () => {
    let mockDataAdd: AddManufacturer;
    beforeEach(() => {
      mockDataAdd = {
        name: 'Manufacturer D',
        url: 'http://test.co.uk',
        address: {
          address_line: '4 Example Street',
          town: 'Oxford',
          county: 'Oxfordshire',
          postcode: 'OX1 2AB',
          country: 'United Kingdom',
        },
        telephone: '07349612203',
      };
    });

    it('posts a request to add manufacturer and returns successful response', async () => {
      const { result } = renderHook(() => useAddManufacturer(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataAdd);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        name: 'Manufacturer D',
        code: 'manufacturer-d',
        url: 'http://test.co.uk',
        address: {
          address_line: '4 Example Street',
          town: 'Oxford',
          county: 'Oxfordshire',
          postcode: 'OX1 2AB',
          country: 'United Kingdom',
        },
        telephone: '07349612203',
        id: '4',
      });
    });

    it.todo(
      'sends axios request to fetch records and throws an appropiate error on failure'
    );
  });

  describe('useDeleteManufacturer', () => {
    let mockDataView: ViewManufacturerResponse;
    beforeEach(() => {
      mockDataView = {
        id: '1',
        name: 'Manufacturer A',
        url: 'http://example.com',
        address: {
          address_line: '1 Example Street',
          town: 'Oxford',
          county: 'Oxfordshire',
          postcode: 'OX1 2AB',
          country: 'United Kingdom',
        },
        telephone: '07334893348',
      };
    });
    it('posts a request to delete a manufacturer and return a successful response', async () => {
      const { result } = renderHook(() => useDeleteManufacturer(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataView);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual('');
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on fetch'
    );
  });

  describe('useManufacturer', () => {
    it('sends request to fetch manufacturer data and returns successful response', async () => {
      const { result } = renderHook(() => useManufacturers(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual([
        {
          id: '1',
          name: 'Manufacturer A',
          code: 'manufacturer-a',
          url: 'http://example.com',
          address: {
            address_line: '1 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07334893348',
        },
        {
          id: '2',
          name: 'Manufacturer B',
          code: 'manufacturer-b',
          url: 'http://test.com',
          address: {
            address_line: '2 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07294958549',
        },
        {
          id: '3',
          name: 'Manufacturer C',
          code: 'manufacturer-c',
          url: 'http://test.co.uk',
          address: {
            address_line: '3 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07934303412',
        },
      ]);
    });

    it.todo(
      'sends axios request to fetch records and throws an appropriate error on failure'
    );
  });
});
