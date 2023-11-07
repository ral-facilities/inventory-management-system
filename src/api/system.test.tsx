import { renderHook, waitFor } from '@testing-library/react';
import { hooksWrapperWithProviders } from '../setupTests';
import { useSystems, useSystemsBreadcrumbs } from './system';
import SystemsJSON from '../mocks/Systems.json';
import SystemBreadcrumbsJSON from '../mocks/SystemBreadcrumbs.json';

describe('System api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useSystems', () => {
    it('sends request to fetch all systems returns successful response', async () => {
      const { result } = renderHook(() => useSystems(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(SystemsJSON);
    });

    it('sends request to fetch all systems with a null parent and returns successful response', async () => {
      const { result } = renderHook(() => useSystems('null'), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data).toEqual(
        SystemsJSON.filter((system) => system.parent_id === null)
      );
    });

    it('sends request to fetch all systems with a specific parent and returns a successful response', async () => {
      const { result } = renderHook(
        () => useSystems('65328f34a40ff5301575a4e3'),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data).toEqual(
        SystemsJSON.filter(
          (system) => system.parent_id === '65328f34a40ff5301575a4e3'
        )
      );
    });
  });

  describe('useSystemsBreadcrumbs', () => {
    it('does not send a request to fetch breadcrumbs data for a system when its id is null', async () => {
      const { result } = renderHook(() => useSystemsBreadcrumbs(null), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isFetching).toBeFalsy();
      expect(result.current.data).toEqual(undefined);
    });

    it('sends request to fetch breadcrumbs data for a system and returns a successful response', async () => {
      const { result } = renderHook(
        () => useSystemsBreadcrumbs('65328f34a40ff5301575a4e3'),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(
        SystemBreadcrumbsJSON.find(
          (systemBreadcrumbs) =>
            systemBreadcrumbs.id === '65328f34a40ff5301575a4e3'
        )
      );
    });
  });
});
