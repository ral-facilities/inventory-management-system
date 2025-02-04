import { renderHook, waitFor } from '@testing-library/react';
import { MockInstance } from 'vitest';
import { CopyToSystem, MoveToSystem } from '../app.types';
import SystemBreadcrumbsJSON from '../mocks/SystemBreadcrumbs.json';
import SystemsJSON from '../mocks/Systems.json';
import { hooksWrapperWithProviders } from '../testUtils';
import { imsApi } from './api';
import {
  System,
  SystemImportanceType,
  SystemPatch,
  SystemPost,
} from './api.types';
import {
  useCopyToSystem,
  useDeleteSystem,
  useGetSystem,
  useGetSystemIds,
  useGetSystems,
  useGetSystemsBreadcrumbs,
  useMoveToSystem,
  usePatchSystem,
  usePostSystem,
} from './systems';

describe('System api functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetSystems', () => {
    it('sends request to fetch all systems returns successful response', async () => {
      const { result } = renderHook(() => useGetSystems(), {
        wrapper: hooksWrapperWithProviders(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });

      expect(result.current.data).toEqual(SystemsJSON);
    });

    it('sends request to fetch all systems with a null parent and returns successful response', async () => {
      const { result } = renderHook(() => useGetSystems('null'), {
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
        () => useGetSystems('65328f34a40ff5301575a4e3'),
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

  describe('useGetSystem', () => {
    it('does not send a request when given an id of null', async () => {
      const { result } = renderHook(() => useGetSystem(null), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isFetching).toBeFalsy();
      expect(result.current.data).toEqual(undefined);
    });

    it('sends request to fetch a system and returns successful response', async () => {
      const { result } = renderHook(
        () => useGetSystem('65328f34a40ff5301575a4e3'),
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

  describe('useGetSystemIds', () => {
    it('sends a request to fetch system data and returns a successful response', async () => {
      const { result } = renderHook(
        () =>
          useGetSystemIds([
            '65328f34a40ff5301575a4e3',
            '656ef565ed0773f82e44bc6d',
          ]),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      await waitFor(() => {
        result.current.forEach((query) => expect(query.isSuccess).toBeTruthy());
      });

      expect(result.current[0].data).toEqual(
        SystemsJSON.filter(
          (system) => system.id === '65328f34a40ff5301575a4e3'
        )[0]
      );
      expect(result.current[1].data).toEqual(
        SystemsJSON.filter(
          (system) => system.id === '656ef565ed0773f82e44bc6d'
        )[0]
      );
    });
  });

  describe('useGetSystemsBreadcrumbs', () => {
    it('does not send a request to fetch breadcrumbs data for a system when its id is null', async () => {
      const { result } = renderHook(() => useGetSystemsBreadcrumbs(null), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isFetching).toBeFalsy();
      expect(result.current.data).toEqual(undefined);
    });

    it('sends request to fetch breadcrumbs data for a system and returns a successful response', async () => {
      const { result } = renderHook(
        () => useGetSystemsBreadcrumbs('65328f34a40ff5301575a4e3'),
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

  describe('usePostSystem', () => {
    const MOCK_SYSTEM_POST: SystemPost = {
      name: 'System name',
      parent_id: 'parent-id',
      description: 'Description',
      location: 'Location',
      owner: 'Owner',
      importance: SystemImportanceType.MEDIUM,
    };

    it('sends a post request to add a system and returns a successful response', async () => {
      const { result } = renderHook(() => usePostSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate(MOCK_SYSTEM_POST);
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({ ...MOCK_SYSTEM_POST, id: '1' });
    });
  });

  describe('usePatchSystem', () => {
    const MOCK_SYSTEM_ID = '65328f34a40ff5301575a4e3';
    const MOCK_SYSTEM_PATCH: SystemPatch = {
      name: 'System name',
      parent_id: 'parent-id',
      description: 'Description',
      location: 'Location',
      owner: 'Owner',
      importance: SystemImportanceType.MEDIUM,
    };

    it('sends a patch request to edit a system and returns a successful response', async () => {
      const { result } = renderHook(() => usePatchSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate({ id: MOCK_SYSTEM_ID, system: MOCK_SYSTEM_PATCH });
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({
        ...SystemsJSON.find(
          (systemBreadcrumbs) => systemBreadcrumbs.id === MOCK_SYSTEM_ID
        ),
        ...MOCK_SYSTEM_PATCH,
      });
    });
  });

  describe('useDeleteSystem', () => {
    it('posts a request to delete a system and returns a successful response', async () => {
      const { result } = renderHook(() => useDeleteSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate('65328f34a40ff5301575a4e9');
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual('');
    });
  });

  describe('useMoveToSystem', () => {
    const mockSystems: System[] = [
      SystemsJSON[0] as System,
      SystemsJSON[1] as System,
    ];

    let moveToSystem: MoveToSystem;

    // Use patch spy for testing since response is not actual data in this case
    // so can't test the underlying use of patchSystem otherwise
    let axiosPatchSpy: MockInstance;

    beforeEach(() => {
      moveToSystem = {
        // Prevent test interference if modifying the selected systems
        selectedSystems: JSON.parse(JSON.stringify(mockSystems)),
        targetSystem: null,
      };

      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('sends requests to move multiple systems to root and returns a successful response for each', async () => {
      moveToSystem.targetSystem = null;

      const { result } = renderHook(() => useMoveToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(moveToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveToSystem.selectedSystems.map((system) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(`/v1/systems/${system.id}`, {
          parent_id: null,
        })
      );
      expect(result.current.data).toEqual(
        moveToSystem.selectedSystems.map((system) => ({
          message: `Successfully moved to Root`,
          name: system.name,
          state: 'success',
        }))
      );
    });

    it('sends requests to move multiple systems to another system and returns a successful response for each', async () => {
      moveToSystem.targetSystem = {
        ...(SystemsJSON[0] as System),
        name: 'New system name',
        id: 'new_system_id',
      };

      const { result } = renderHook(() => useMoveToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(moveToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveToSystem.selectedSystems.map((system) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(`/v1/systems/${system.id}`, {
          parent_id: 'new_system_id',
        })
      );
      expect(result.current.data).toEqual(
        moveToSystem.selectedSystems.map((system) => ({
          message: `Successfully moved to New system name`,
          name: system.name,
          state: 'success',
        }))
      );
    });

    it('handles a failed request to move a system correctly', async () => {
      moveToSystem.targetSystem = {
        ...(SystemsJSON[0] as System),
        name: 'New system name',
        id: 'new_system_id',
      };

      // Fail just the 1st system
      moveToSystem.selectedSystems[0].id = 'Error 409';

      const { result } = renderHook(() => useMoveToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(moveToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      moveToSystem.selectedSystems.map((system) =>
        expect(axiosPatchSpy).toHaveBeenCalledWith(`/v1/systems/${system.id}`, {
          parent_id: 'new_system_id',
        })
      );
      expect(result.current.data).toEqual(
        moveToSystem.selectedSystems
          .map((system, index) =>
            index === 0
              ? {
                  message:
                    'A System with the same name already exists within the same parent System',
                  name: system.name,
                  state: 'error',
                }
              : {
                  message: 'Successfully moved to New system name',
                  name: system.name,
                  state: 'success',
                }
          )
          // Exception takes longer to resolve so it gets added last
          .reverse()
      );
    });
  });

  describe('useCopyToSystem', () => {
    const mockSystems: System[] = [
      SystemsJSON[0] as System,
      SystemsJSON[1] as System,
    ];

    let copyToSystem: CopyToSystem;

    // Use post spy for testing since response is not actual data in this case
    // so can't test the underlying use of postSystem otherwise
    let axiosPostSpy: MockInstance;

    beforeEach(() => {
      copyToSystem = {
        // Prevent test interference if modifying the selected systems
        selectedSystems: JSON.parse(JSON.stringify(mockSystems)),
        targetSystem: null,
        existingSystemCodes: [],
      };

      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('sends requests to copy multiple systems to root and returns a successful response for each', async () => {
      copyToSystem.targetSystem = null;

      const { result } = renderHook(() => useCopyToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(copyToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToSystem.selectedSystems.map((system) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/systems`, {
          ...system,
          parent_id: null,
        })
      );
      expect(result.current.data).toEqual(
        copyToSystem.selectedSystems.map((system) => ({
          message: `Successfully copied to Root`,
          name: system.name,
          state: 'success',
        }))
      );
    });

    it('sends requests to copy multiple systems to another system and returns a successful response for each', async () => {
      copyToSystem.targetSystem = {
        ...(SystemsJSON[0] as System),
        name: 'New system name',
        id: 'new_system_id',
      };

      const { result } = renderHook(() => useCopyToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(copyToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToSystem.selectedSystems.map((system) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/systems`, {
          ...system,
          parent_id: 'new_system_id',
        })
      );
      expect(result.current.data).toEqual(
        copyToSystem.selectedSystems.map((system) => ({
          message: `Successfully copied to New system name`,
          name: system.name,
          state: 'success',
        }))
      );
    });

    it('sends requests to copy multiple systems to root while avoiding duplicate codes and returns a successful response for each', async () => {
      copyToSystem.targetSystem = null;
      copyToSystem.selectedSystems = [
        { ...(SystemsJSON[0] as System), name: 'System1', code: 'system1' },
        { ...(SystemsJSON[1] as System), name: 'System2', code: 'system2' },
      ];
      copyToSystem.existingSystemCodes = [
        'system1',
        'system2',
        'system2_copy_1',
        'system2_copy_2',
      ];

      const { result } = renderHook(() => useCopyToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(copyToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToSystem.selectedSystems.map((system, index) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/systems`, {
          ...system,
          parent_id: null,
          name: index === 0 ? 'System1_copy_1' : 'System2_copy_3',
        })
      );
      expect(result.current.data).toEqual(
        copyToSystem.selectedSystems.map((system) => ({
          message: `Successfully copied to Root`,
          name: system.name,
          state: 'success',
        }))
      );
    });

    it('handles a failed request to copy a system correctly', async () => {
      copyToSystem.targetSystem = {
        ...(SystemsJSON[0] as System),
        name: 'New system name',
        id: 'new_system_id',
      };

      // Fail just the 1st system (In reality shouldn't get a 409 if the correct list
      // of existing codes are given - just using as an error test here)
      copyToSystem.selectedSystems[0].name = 'Error 409';

      const { result } = renderHook(() => useCopyToSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      expect(result.current.isIdle).toBe(true);

      result.current.mutate(copyToSystem);

      await waitFor(() => {
        expect(result.current.isSuccess).toBeTruthy();
      });
      copyToSystem.selectedSystems.map((system) =>
        expect(axiosPostSpy).toHaveBeenCalledWith(`/v1/systems`, {
          ...system,
          parent_id: 'new_system_id',
        })
      );
      expect(result.current.data).toEqual(
        copyToSystem.selectedSystems
          .map((system, index) =>
            index === 0
              ? {
                  message:
                    'A System with the same name already exists within the same parent System',
                  name: system.name,
                  state: 'error',
                }
              : {
                  message: 'Successfully copied to New system name',
                  name: system.name,
                  state: 'success',
                }
          )
          // Exception takes longer to resolve so it gets added last
          .reverse()
      );
    });
  });
});
