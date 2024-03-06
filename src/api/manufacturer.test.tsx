import { renderHook, waitFor } from '@testing-library/react';
import { Manufacturer } from '../app.types';
import ManufacturerJSON from '../mocks/manufacturer.json';
import { hooksWrapperWithProviders } from '../setupTests';
import {
  useAddManufacturer,
  useDeleteManufacturer,
  useManufacturerIds,
  useManufacturers,
} from './manufacturer';

describe('manufacturer api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddManufacturer', () => {
    let mockDataAdd: Manufacturer;
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
  });

  describe('useDeleteManufacturer', () => {
    let mockDataView: Manufacturer;
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

      expect(result.current.data).toEqual(ManufacturerJSON);
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
        ManufacturerJSON.filter((manufacturer) => manufacturer.id === '1')[0]
      );
      expect(result.current[1].data).toEqual(
        ManufacturerJSON.filter((manufacturer) => manufacturer.id === '2')[0]
      );
    });
  });
});
