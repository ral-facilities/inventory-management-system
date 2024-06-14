import { renderHook, waitFor } from '@testing-library/react';
import { AddManufacturer, Manufacturer } from '../app.types';
import ManufacturersJSON from '../mocks/Manufacturers.json';
import {
  CREATED_MODIFIED_TIME_VALUES,
  hooksWrapperWithProviders,
} from '../testUtils';
import {
  useAddManufacturer,
  useDeleteManufacturer,
  useManufacturerIds,
  useManufacturers,
} from './manufacturers';

describe('manufacturer api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
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
        id: '4',
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
        created_time: '2024-01-01T12:00:00.000+00:00',
        modified_time: '2024-01-02T13:10:10.000+00:00',
      });
    });
  });

  describe('useDeleteManufacturer', () => {
    let mockDataView: Manufacturer;
    beforeEach(() => {
      mockDataView = {
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
        ...CREATED_MODIFIED_TIME_VALUES,
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
      expect(result.current.data).toEqual({ status: 204 });
    });
  });

  describe('useManufacturer', () => {
    it('sends request to fetch manufacturer data and returns successful response', async () => {
      const { result } = renderHook(() => useManufacturers(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(ManufacturersJSON);
    });
  });

  describe('useManufacturerIds', () => {
    it('sends request to fetch manufacturer data and returns successful response', async () => {
      const { result } = renderHook(() => useManufacturerIds(['1', '2']), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        result.current.forEach((query) => expect(query.isSuccess).toBeTruthy());
      });

      expect(result.current[0].data).toEqual(
        ManufacturersJSON.filter((manufacturer) => manufacturer.id === '1')[0]
      );
      expect(result.current[1].data).toEqual(
        ManufacturersJSON.filter((manufacturer) => manufacturer.id === '2')[0]
      );
    });
  });
});
