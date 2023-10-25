import { renderHook, waitFor } from '@testing-library/react';
import SystemBreadcrumbsJSON from '../mocks/SystemBreadcrumbs.json';
import SystemsJSON from '../mocks/Systems.json';
import { hooksWrapperWithProviders } from '../setupTests';
import {
  SystemImportanceType,
  SystemPost,
  useAddSystem,
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

  describe('useSystemsBreadcrumbs', () => {
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
    const MOCK_SYSTEM_POST: SystemPost = {
      name: 'System Name',
      location: 'Location',
      owner: 'Owner',
      importance: SystemImportanceType.MEDIUM,
      description: 'Description',
      parent_id: null,
    };

    it('posts a request to add a system and returns a successful response', async () => {
      const { result } = renderHook(() => useAddSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate(MOCK_SYSTEM_POST);
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({ ...MOCK_SYSTEM_POST, id: '1' });
    });

    it('records an error on failure', async () => {
      console.log = jest.fn();

      const { result } = renderHook(() => useAddSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate({ ...MOCK_SYSTEM_POST, name: 'Error 500' });
      await waitFor(() => expect(result.current.isError).toBeTruthy());

      expect(console.log).toHaveBeenCalledWith(
        "Got error: 'Request failed with status code 500'"
      );
    });
  });
});
