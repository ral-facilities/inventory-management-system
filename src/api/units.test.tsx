import { renderHook, waitFor } from '@testing-library/react';
import UnitsJSON from '../mocks/Units.json';
import {
  CREATED_MODIFIED_TIME_VALUES,
  hooksWrapperWithProviders,
} from '../testUtils';
import { Unit, UnitPost } from './api.types';
import { useDeleteUnit, useGetUnits, usePostUnit } from './units';

describe('units api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetUnits', () => {
    it('sends request to fetch the units and returns successful response', async () => {
      const { result } = renderHook(() => useGetUnits(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(UnitsJSON);
    });
  });

  describe('usePostUnits', () => {
    let mockDataPost: UnitPost;
    beforeEach(() => {
      mockDataPost = {
        value: 'test',
      };
    });

    it('posts a request to add a unit and returns successful response', async () => {
      const { result } = renderHook(() => usePostUnit(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataPost);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        code: 'kelvin',
        created_time: '2024-01-01T12:00:00.000+00:00',
        id: '10',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        value: 'Kelvin',
      });
    });
  });

  describe('useDeleteUnit', () => {
    let mockDataView: Unit;
    beforeEach(() => {
      mockDataView = {
        id: '1',
        value: 'test',
        code: 'test',
        ...CREATED_MODIFIED_TIME_VALUES,
      };
    });

    it('posts a request to delete a unit and returns a successful response', async () => {
      const { result } = renderHook(() => useDeleteUnit(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataView.id);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual('');
    });
  });
});
