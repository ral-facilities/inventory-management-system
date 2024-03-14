import { renderHook, waitFor } from '@testing-library/react';
import UnitsJSON from '../mocks/units.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { useUnits } from './units';

describe('useUnits', () => {
  it('sends request to fetch the units and returns successful response', async () => {
    const { result } = renderHook(() => useUnits(), {
      wrapper: hooksWrapperWithProviders(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual(UnitsJSON);
  });
});
