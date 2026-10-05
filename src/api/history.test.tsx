import { hooksWrapperWithProviders } from '../testUtils';
import { useGetItemSystemsEntries, useGetSystemItemsEntries } from './history';
import { renderHook, waitFor } from '@testing-library/react';
import historyItemSystemEntriesJSON from '../../src/mocks/HistoryItemSystemsEntries.json';
import historysystemItemsEntriesJSON from '../../src/mocks/HistorySystemItemsEntries.json';

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

  describe('useGetSystemItemsEntries', () => {
    it('sends request to fetch system-items history and returns a successful response', async () => {
      const { result } = renderHook(
        () => useGetSystemItemsEntries('65328f34a40ff5301575a4e8'),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      expect(result.current.data).toEqual([historysystemItemsEntriesJSON[1]]);
    });
  });
});
