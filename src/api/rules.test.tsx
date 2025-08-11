import { renderHook, waitFor } from '@testing-library/react';
import { rulesJSON } from '../mocks/handlers';
import {
  getSystemTypeByValue,
  getUsageStatusByValue,
  hooksWrapperWithProviders,
} from '../testUtils';
import { useGetRules } from './rules';

describe('rules api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetRules', () => {
    it('sends request to fetch the rules and returns successful response', async () => {
      const { result } = renderHook(() => useGetRules(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(rulesJSON);
    });

    it('sends request with src_system_type_id and dst_system_type_id', async () => {
      const srcSystemTypeId = '1';
      const dstSystemTypeId = '2';

      const { result } = renderHook(
        () => useGetRules(srcSystemTypeId, dstSystemTypeId),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual([
        {
          dst_system_type: getSystemTypeByValue('Operational'),
          dst_usage_status: getUsageStatusByValue('In Use'),
          id: '3',
          src_system_type: getSystemTypeByValue('Storage'),
        },
      ]);
    });
  });
});
