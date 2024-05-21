import { renderHook, waitFor } from '@testing-library/react';
import UsageStatusesJSON from '../mocks/UsageStatuses.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { AddUsageStatus, UsageStatus } from '../app.types';
import {
  useAddUsageStatus,
  useDeleteUsageStatus,
  useUsageStatuses,
} from './usageStatuses';

describe('usage status api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useUsageStatus', () => {
    it('sends request to fetch the usage statuses and returns successful response', async () => {
      const { result } = renderHook(() => useUsageStatuses(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(UsageStatusesJSON);
    });
  });

  describe('useAddUsageStatus', () => {
    let mockDataAdd: AddUsageStatus;
    beforeEach(() => {
      mockDataAdd = {
        value: 'test',
      };
    });

    it('posts a request to add a usage status and returns successful response', async () => {
      const { result } = renderHook(() => useAddUsageStatus(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataAdd);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({
        code: 'archived',
        created_time: '2024-01-01T12:00:00.000+00:00',
        id: '5',
        modified_time: '2024-01-02T13:10:10.000+00:00',
        value: 'Archived',
      });
    });
  });

  describe('useDeleteUsageStatus', () => {
    let mockDataView: UsageStatus;
    beforeEach(() => {
      mockDataView = {
        id: '1',
        value: 'test',
      };
    });

    it('posts a request to delete a usage status and returns a successful response', async () => {
      const { result } = renderHook(() => useDeleteUsageStatus(), {
        wrapper: hooksWrapperWithProviders(),
      });
      expect(result.current.isIdle).toBe(true);
      result.current.mutate(mockDataView.id);
      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual({ status: 204 });
    });
  });
});
