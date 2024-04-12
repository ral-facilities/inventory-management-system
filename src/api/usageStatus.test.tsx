import { renderHook, waitFor } from '@testing-library/react';
import UsageStatusesJSON from '../mocks/UsageStatuses.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useUsageStatuses } from './usageStatus';

describe('useUsageStatuses', () => {
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
