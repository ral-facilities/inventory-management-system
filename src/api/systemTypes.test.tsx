import { renderHook, waitFor } from '@testing-library/react';
import SystemTypesJSON from '../mocks/SystemTypes.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useGetSystemType, useGetSystemTypes } from './systemTypes';

describe('System type api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetSystemTypes', () => {
    it('sends request to fetch all system types and returns successful response', async () => {
      const { result } = renderHook(() => useGetSystemTypes(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(SystemTypesJSON);
    });
  });

  describe('useGetSystemType', () => {
    it('does not send a request when given an id of null', async () => {
      const { result } = renderHook(() => useGetSystemType(null), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isFetching).toBeFalsy();
      expect(result.current.data).toEqual(undefined);
    });

    it('sends request to fetch a system type and returns successful response', async () => {
      const { result } = renderHook(() => useGetSystemType('2'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(
        SystemTypesJSON.filter((systemType) => systemType.id === '2')[0]
      );
    });
  });
});
