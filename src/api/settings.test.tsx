import { renderHook, waitFor } from '@testing-library/react';
import SystemTypesJSON from '../mocks/SystemTypes.json';
import { hooksWrapperWithProviders } from '../testUtils';

import { useGetSparesDefinition } from './settings';

describe('settings api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetSparesDefinition', () => {
    it('sends request to fetch the spares definition and returns successful response', async () => {
      const { result } = renderHook(() => useGetSparesDefinition(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual({
        system_type_ids: [SystemTypesJSON[0]],
      });
    });
  });
});
