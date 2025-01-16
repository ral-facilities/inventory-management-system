import { renderHook, waitFor } from '@testing-library/react';
import UsageStatusJSON from '../mocks/UsageStatuses.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { SparesDefinitionPut } from './api.types';
import { useGetSparesDefinition, usePutSparesDefinition } from './settings';

describe('units api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetUnits', () => {
    it('sends request to fetch the units and returns successful response', async () => {
      const { result } = renderHook(() => useGetSparesDefinition(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        usage_statuses: [UsageStatusJSON[0], UsageStatusJSON[2]],
      });
    });
  });

  describe('usePostUnits', () => {
    let mockDataPost: SparesDefinitionPut;
    beforeEach(() => {
      mockDataPost = {
        usage_statuses: [
          { id: UsageStatusJSON[0].id },
          { id: UsageStatusJSON[2].id },
        ],
      };
    });

    it('posts a request to add a unit and returns successful response', async () => {
      const { result } = renderHook(() => usePutSparesDefinition(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataPost);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        usage_statuses: [UsageStatusJSON[0], UsageStatusJSON[2]],
      });
    });
  });
});
