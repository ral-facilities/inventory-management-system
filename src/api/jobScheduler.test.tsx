import { renderHook, waitFor } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../testUtils';
import { JobStatus } from './api.types';
import { useGetJob, usePostJob } from './jobScheduler';

describe('usePostJob', () => {
  it('posts a request to scheduler a criticality job and returns successful response', async () => {
    const { result } = renderHook(() => usePostJob('criticality'), {
      wrapper: hooksWrapperWithProviders(),
    });
    expect(result.current.isIdle).toBe(true);
    result.current.mutate();
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
  });
});

describe('useGetJob', () => {
  it('sends request to fetch the job status and returns successful response', async () => {
    const { result } = renderHook(() => useGetJob('criticality'), {
      wrapper: hooksWrapperWithProviders(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual({
      id: '1',
      last_executed_start_time: '2026-03-10T17:12:15.141Z',
      last_executed_end_time: '2026-03-10T17:12:15.141Z',
      status: JobStatus.Finished,
      last_successful_executed_start_time: '2026-03-10T17:12:15.141Z',
      last_successful_executed_end_time: '2026-03-10T17:12:15.141Z',
      last_successful_duration_seconds: 0.123,
      next_scheduled_execution_time: '2026-03-10T17:12:15.141Z',
    });
  });
});
