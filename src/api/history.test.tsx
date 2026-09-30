import { hooksWrapperWithProviders } from '../testUtils';
import { useGetItemSystemsEntries } from './history';
import { renderHook, waitFor } from '@testing-library/react';
import historyItemSystemEntriesJSON from '../../src/mocks/HistoryItemSystemsEntries.json';

describe('history api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetItemSystemsEntries', () => {
    it('sends request to fetch item-systems history and returns a successful response', async () => {
      const { result } = renderHook(
        () => useGetItemSystemsEntries('KvT2Ox7n'),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual(
        historyItemSystemEntriesJSON.slice(0, 3)
      );
    });
  });
});
