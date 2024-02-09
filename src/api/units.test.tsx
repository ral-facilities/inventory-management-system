import { renderHook, waitFor } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../setupTests';
import { useUnits } from './units';
import unitsJSON from '../mocks/units.json';

describe('useUnits', () => {
  it('sends request to fetch the units and returns successful response', async () => {
    const { result } = renderHook(() => useUnits(), {
      wrapper: hooksWrapperWithProviders(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(result.current.data).toEqual(unitsJSON);
  });
});
