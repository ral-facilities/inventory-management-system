import { renderHook, waitFor } from '@testing-library/react';
import {
  AddSystem,
  CopyToSystem,
  EditSystem,
  MoveToSystem,
  System,
  SystemImportanceType,
} from '../app.types';
import SystemBreadcrumbsJSON from '../mocks/SystemBreadcrumbs.json';
import SystemsJSON from '../mocks/Systems.json';
import { hooksWrapperWithProviders } from '../setupTests';
import {
  useAddSystem,
  useCopyToSystem,
  useDeleteSystem,
  useEditSystem,
  useMoveToSystem,
  useSystem,
  useSystems,
  useSystemsBreadcrumbs,
} from './systems';
import axios from 'axios';

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

    it.todo(
      'sends request to all systems and throws an appropriate error on failure'
    );
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

    it.todo(
      'sends request to fetch a system and throws an appropriate error on failure'
    );
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

    it.todo(
      'sends request to add a system and throws an appropriate error on failure'
    );
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

    it('sends a post request to add a system and returns a successful response', async () => {
      const { result } = renderHook(() => useAddSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate(MOCK_SYSTEM_POST);
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({ ...MOCK_SYSTEM_POST, id: '1' });
    });

    it.todo(
      'sends request to add a system and throws an appropriate error on failure'
    );
  });

  describe('useEditSystem', () => {
    const MOCK_SYSTEM_PATCH: EditSystem = {
      id: '65328f34a40ff5301575a4e3',
      name: 'System name',
      parent_id: 'parent-id',
      description: 'Description',
      location: 'Location',
      owner: 'Owner',
      importance: SystemImportanceType.MEDIUM,
    };

    it('sends a patch request to edit a system and returns a successful response', async () => {
      const { result } = renderHook(() => useEditSystem(), {
        wrapper: hooksWrapperWithProviders(),
      });

      result.current.mutate(MOCK_SYSTEM_PATCH);
      await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

      expect(result.current.data).toEqual({
        ...SystemsJSON.find(
          (systemBreadcrumbs) =>
            systemBreadcrumbs.id === MOCK_SYSTEM_PATCH['id']
        ),
        ...MOCK_SYSTEM_PATCH,
      });
    });

    it.todo(
      'sends patch request to edit a system and throws an appropriate error on failure'
    );
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

    it.todo(
      'sends request to delete a system and throws an appropriate error on failure'
    );
  });

  describe('useMoveToSystem', () => {
    const mockSystems: System[] = [
      SystemsJSON[0] as System,
      SystemsJSON[1] as System,
    ];

    let moveToSystem: MoveToSystem;

    // Use patch spy for testing since response is not actual data in this case
    // so can't test the underlying use of editSystem otherwise
    let axiosPatchSpy;

    beforeEach(() => {
      moveToSystem = {
        selectedSystems: mockSystems,
        targetSystem: null,
      };

      axiosPatchSpy = jest.spyOn(axios, 'patch');
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
    // so can't test the underlying use of addSystem otherwise
    let axiosPostSpy;

    beforeEach(() => {
      copyToSystem = {
        selectedSystems: mockSystems,
        targetSystem: null,
        existingSystemCodes: [],
      };

      axiosPostSpy = jest.spyOn(axios, 'post');
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
        copyToSystem.selectedSystems.map((system, index) => ({
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
