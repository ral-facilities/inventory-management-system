import { renderHook, waitFor } from '@testing-library/react';
import { AddSystem, SystemImportanceType } from '../app.types';
import SystemBreadcrumbsJSON from '../mocks/SystemBreadcrumbs.json';
import SystemsJSON from '../mocks/Systems.json';
import { hooksWrapperWithProviders } from '../setupTests';
import {
  useAddSystem,
  useSystem,
  useSystems,
  useSystemsBreadcrumbs,
} from './systems';

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

  describe('useSystem', () => {
    it('does not send a request when given an id of null', async () => {
      const { result } = renderHook(() => useSystem(null), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isFetching).toBeFalsy();
      expect(result.current.data).toEqual(undefined);
    });

    it('sends request to fetch a system and returns successful response', async () => {
      const { result } = renderHook(
        () => useSystem('65328f34a40ff5301575a4e3'),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(
        SystemsJSON.filter(
          (system) => system.id === '65328f34a40ff5301575a4e3'
        )[0]
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

  describe('useAddSystem', () => {
    const MOCK_SYSTEM_POST: AddSystem = {
      name: 'System name',
      parent_id: 'parent-id',
      description: 'Description',
      location: 'Location',
      owner: 'Owner',
      importance: SystemImportanceType.MEDIUM,
    };

    it('posts a request to add a system and returns a successful response', async () => {
      const { result } = renderHook(() => useAddSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate(MOCK_SYSTEM_POST);
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({ ...MOCK_SYSTEM_POST, id: '1' });
    });
  });
});
