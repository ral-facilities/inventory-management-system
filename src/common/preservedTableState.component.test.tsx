import { renderHook, waitFor } from '@testing-library/react';
import LZString from 'lz-string';
import { MRT_VisibilityState } from 'material-react-table';
import { act } from 'react-dom/test-utils';
import { hooksWrapperWithProviders } from '../testUtils';
import { usePreservedTableState } from './preservedTableState.component';

describe('Preserved table state functions', () => {
  describe('usePreservedTableState', () => {
    afterEach(() => {
      vi.clearAllMocks();

      // NOTE: In these tests we would ideally use a memory router and use router.state.location instead
      // however renderHook requires a wrapper, and using RouterProvider requires that the router is
      // be inside that wrapper, preventing access so we must use BrowserRouter instead here for now

      // This is here to try and prevent any other test interference in other files
      window.history.pushState({}, '', '/');
    });

    const renderHookWithBrowserRouterURL = <Result, Props>(
      render: (initialProps: Props) => Result,
      url: string
    ) => {
      window.history.pushState({}, '', url);
      return renderHook(render, { wrapper: hooksWrapperWithProviders() });
    };

    it('uses default states if not found in url', () => {
      const { result } = renderHook(
        () => usePreservedTableState({ storeInUrl: true }),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [],
          sorting: [],
          columnVisibility: {},
          globalFilter: undefined,
          grouping: [],
          columnOrder: [],
          pagination: {
            pageSize: 15,
            pageIndex: 0,
          },
        })
      );
    });

    it('uses default states if url is invalid', () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '?state=D'
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [],
          sorting: [],
          columnVisibility: {},
          globalFilter: undefined,
          grouping: [],
          columnOrder: [],
          pagination: {
            pageSize: 15,
            pageIndex: 0,
          },
        })
      );
    });

    it('uses default states if url cannot be decompressed', () => {
      vi.spyOn(
        LZString,
        'decompressFromEncodedURIComponent'
      ).mockImplementationOnce(() => {
        throw new Error('Some error');
      });

      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '?state=D'
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [],
          sorting: [],
          columnVisibility: {},
          globalFilter: undefined,
          grouping: [],
          columnOrder: [],
          pagination: {
            pageSize: 15,
            pageIndex: 0,
          },
        })
      );
    });

    it('uses given initial states if not found in the url', () => {
      const { result } = renderHook(
        () =>
          usePreservedTableState({
            initialState: {
              columnVisibility: { created_time: false },
              grouping: ['catalogue_item.name'],
              pagination: { pageSize: 20, pageIndex: 5 },
            },
            storeInUrl: true,
          }),
        {
          wrapper: hooksWrapperWithProviders(),
        }
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [],
          sorting: [],
          columnVisibility: { created_time: false },
          globalFilter: undefined,
          grouping: ['catalogue_item.name'],
          columnOrder: [],
          pagination: {
            pageSize: 20,
            pageIndex: 5,
          },
        })
      );
    });

    it('loads the state found in the url', () => {
      // This test was constructed using the following:

      // const testState: StateSearchParams = {
      //   cF: [{ id: 'catalogueItem.name', value: 'nameFilter' }],
      //   srt: [{ id: 'catalogueItem.name', desc: true }],
      //   cVis: {
      //     'catalogueItem.created_time': false,
      //     'catalogueItem.description': false,
      //   },
      //   gFil: 'globalFilter',
      //   g: ['catalogueItem.is_obsolete'],
      //   cO: ['mrt-row-expand', 'mrt-row-actions'],
      //   p: { pageSize: 30, pageIndex: 5 },
      // };
      // console.log(
      //   LZString.compressToEncodedURIComponent(JSON.stringify(testState))
      // )

      const { result } = renderHook(
        () =>
          usePreservedTableState({
            storeInUrl: true,
          }),
        {
          wrapper: hooksWrapperWithProviders({
            urlPathKey: 'any',
            initialEntry:
              '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJq9jEC2FAE4gAvgF1WAZ0EYY8EMlRhMOAiXJU6DJqyTFJYGBkElxrMADUEkmKGVY8RMhRphBxTMSQB9DAkYwAGY4ksTmKo7qLtR6BoIIAA5+uLRBIcQirPh82Kj4eABGODlCLCD4cugOas6a1t64BZK42MQUIBLgAPKVlDIAtIK4AO79xAAeCWi0KKx9GIMj-WhgybQ2nQm2IFP4xADKCABeTNAAzAAMrLtkMxMwAKwiIkA',
          }),
        }
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [{ id: 'catalogueItem.name', value: 'nameFilter' }],
          sorting: [{ id: 'catalogueItem.name', desc: true }],
          columnVisibility: {
            'catalogueItem.created_time': false,
            'catalogueItem.description': false,
          },
          globalFilter: 'globalFilter',
          grouping: ['catalogueItem.is_obsolete'],
          columnOrder: ['mrt-row-expand', 'mrt-row-actions'],
          pagination: { pageSize: 30, pageIndex: 5 },
        })
      );
    });

    it('loads the state found in the url when urlParamName is given', () => {
      const { result } = renderHook(
        () =>
          usePreservedTableState({
            storeInUrl: true,
            urlParamName: 'subState',
          }),
        {
          wrapper: hooksWrapperWithProviders({
            urlPathKey: 'any',
            initialEntry:
              '?subState=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJq9jEC2FAE4gAvgF1WAZ0EYY8EMlRhMOAiXJU6DJqyTFJYGBkElxrMADUEkmKGVY8RMhRphBxTMSQB9DAkYwAGY4ksTmKo7qLtR6BoIIAA5+uLRBIcQirPh82Kj4eABGODlCLCD4cugOas6a1t64BZK42MQUIBLgAPKVlDIAtIK4AO79xAAeCWi0KKx9GIMj-WhgybQ2nQm2IFP4xADKCABeTNAAzAAMrLtkMxMwAKwiIkA',
          }),
        }
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [{ id: 'catalogueItem.name', value: 'nameFilter' }],
          sorting: [{ id: 'catalogueItem.name', desc: true }],
          columnVisibility: {
            'catalogueItem.created_time': false,
            'catalogueItem.description': false,
          },
          globalFilter: 'globalFilter',
          grouping: ['catalogueItem.is_obsolete'],
          columnOrder: ['mrt-row-expand', 'mrt-row-actions'],
          pagination: { pageSize: 30, pageIndex: 5 },
        })
      );
    });

    it('ignores the the state found in the url if storeInUrl is false', () => {
      const { result } = renderHook(
        () =>
          usePreservedTableState({
            storeInUrl: false,
          }),
        {
          wrapper: hooksWrapperWithProviders({
            urlPathKey: 'any',
            initialEntry:
              '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJq9jEC2FAE4gAvgF1WAZ0EYY8EMlRhMOAiXJU6DJqyTFJYGBkElxrMADUEkmKGVY8RMhRphBxTMSQB9DAkYwAGY4ksTmKo7qLtR6BoIIAA5+uLRBIcQirPh82Kj4eABGODlCLCD4cugOas6a1t64BZK42MQUIBLgAPKVlDIAtIK4AO79xAAeCWi0KKx9GIMj-WhgybQ2nQm2IFP4xADKCABeTNAAzAAMrLtkMxMwAKwiIkA',
          }),
        }
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [],
          sorting: [],
          columnVisibility: {},
          globalFilter: undefined,
          grouping: [],
          columnOrder: [],
          pagination: {
            pageSize: 15,
            pageIndex: 0,
          },
        })
      );
    });

    it('onColumnFiltersChange updates the state and url correctly', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnFiltersChange([
          { id: 'catalogueItem.name', value: 'test' },
        ])
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnFilters)
        ).toBe(JSON.stringify([{ id: 'catalogueItem.name', value: 'test' }]))
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJqFAzhiAF8AugKA'
      );

      // Now change back to a default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnFiltersChange([])
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnFilters)
        ).toBe(JSON.stringify([]))
      );
      expect(window.location.search).toBe('');
    });

    it('onSortingChange updates the state and url correctly', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onSortingChange([
          { id: 'catalogueItem.name', desc: true },
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.sorting)).toBe(
          JSON.stringify([{ id: 'catalogueItem.name', desc: true }])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgzgTgLiBcDaoCWATOIDGBDKWA2A9gOYCuApgJJRkC2AdAHZY1kgA0IKZYGcUE5AL4BdQUA'
      );

      // Now change back to a default value
      act(() => result.current.onPreservedStatesChange.onSortingChange([]));

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.sorting)).toBe(
          JSON.stringify([])
        )
      );
      expect(window.location.search).toBe('');
    });

    it('onColumnVisibilityChange updates the state and url correctly', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() => {
        result.current.onPreservedStatesChange.onColumnVisibilityChange(
          (prevState: MRT_VisibilityState) => ({
            ...prevState,
            'catalogueItem.name': false,
            'catalogueItem.created_time': false,
          })
        );
      });

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnVisibility)
        ).toBe(
          JSON.stringify({
            'catalogueItem.name': false,
            'catalogueItem.created_time': false,
          })
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDoA7ZMghAM0xgIBpw1NdCTyKwATgTQEAJgH1UUOo2YEAvvKA'
      );

      // Now change back to a default value (MRT doesnt supply {} here, but instead just changes values back to true)
      act(() =>
        result.current.onPreservedStatesChange.onColumnVisibilityChange(
          (prevState: MRT_VisibilityState) => ({
            ...prevState,
            'catalogueItem.name': true,
            'catalogueItem.created_time': true,
          })
        )
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnVisibility)
        ).toBe(JSON.stringify({}))
      );
      expect(window.location.search).toBe('');
    });

    it('onColumnVisibilityChange updates the state and url correctly (using an empty object to clear)', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() => {
        result.current.onPreservedStatesChange.onColumnVisibilityChange(
          (prevState: MRT_VisibilityState) => ({
            ...prevState,
            'catalogueItem.name': false,
            'catalogueItem.created_time': false,
          })
        );
      });

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnVisibility)
        ).toBe(
          JSON.stringify({
            'catalogueItem.name': false,
            'catalogueItem.created_time': false,
          })
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDoA7ZMghAM0xgIBpw1NdCTyKwATgTQEAJgH1UUOo2YEAvvKA'
      );

      // Now change back to a default value (MRT doesn't supply {} here, but instead just changes values back to true,
      // this is here just to improve coverage)
      act(() =>
        result.current.onPreservedStatesChange.onColumnVisibilityChange({})
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnVisibility)
        ).toBe(JSON.stringify({}))
      );
      expect(window.location.search).toBe('');
    });

    it('onColumnVisibilityChange updates the state and url correctly when using an initial state', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () =>
          usePreservedTableState({
            initialState: {
              columnVisibility: { 'catalogueItem.created_time': false },
            },
            storeInUrl: true,
          }),
        '/'
      );

      // Change the state to a non-default value
      act(() => {
        result.current.onPreservedStatesChange.onColumnVisibilityChange(
          (prevState: MRT_VisibilityState) => ({
            ...prevState,
            'catalogueItem.name': false,
          })
        );
      });

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnVisibility)
        ).toBe(
          JSON.stringify({
            'catalogueItem.created_time': false,
            'catalogueItem.name': false,
          })
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDowAnAtAgEwH1UoyCEAzTGAgGnBpMuQiXIUAdsnZceBAL7ygA'
      );

      // Now change back to a default value (MRT doesnt supply {} here, but instead just changes values back to true)
      act(() =>
        result.current.onPreservedStatesChange.onColumnVisibilityChange(
          (prevState: MRT_VisibilityState) => ({
            ...prevState,
            'catalogueItem.name': true,
            'catalogueItem.created_time': false,
          })
        )
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnVisibility)
        ).toBe(
          JSON.stringify({
            'catalogueItem.created_time': false,
          })
        )
      );
      expect(window.location.search).toBe('');
    });

    it('onGlobalFilterChange updates the state and url correctly', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onGlobalFilterChange(
          'test filter'
        )
      );

      await waitFor(() =>
        expect(result.current.preservedState.globalFilter).toBe('test filter')
      );

      expect(window.location.search).toBe(
        '?state=N4Ig5gYglgNiBcIAuBTAzkgBAM1qgTiAL5A'
      );

      // Now change back to a default value
      act(() =>
        result.current.onPreservedStatesChange.onGlobalFilterChange('')
      );

      await waitFor(() =>
        expect(result.current.preservedState.globalFilter).toBe(undefined)
      );
      expect(window.location.search).toBe('');
    });

    it('onGroupingChange updates the state and url correctly', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onGroupingChange([
          'catalogueItem.is_obsolete',
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.grouping)).toBe(
          JSON.stringify(['catalogueItem.is_obsolete'])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4Ig5iBcDaIMYEMAuCA2B7MBXApgSSRwFsA6ASwGcB9dAIwvVR0JAF0BfIA'
      );

      // Now change back to a default value
      act(() => result.current.onPreservedStatesChange.onGroupingChange([]));

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.grouping)).toBe(
          JSON.stringify([])
        )
      );
      expect(window.location.search).toBe('');
    });

    it('onGroupingChange updates the state and url correctly when using an initial state', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () =>
          usePreservedTableState({
            initialState: { grouping: ['catalogueItem.name'] },
            storeInUrl: true,
          }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onGroupingChange([
          'catalogueItem.is_obsolete',
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.grouping)).toBe(
          JSON.stringify(['catalogueItem.is_obsolete'])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4Ig5iBcDaIMYEMAuCA2B7MBXApgSSRwFsA6ASwGcB9dAIwvVR0JAF0BfIA'
      );

      // Now change back to a default value
      act(() =>
        result.current.onPreservedStatesChange.onGroupingChange([
          'catalogueItem.name',
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.grouping)).toBe(
          JSON.stringify(['catalogueItem.name'])
        )
      );
      expect(window.location.search).toBe('');
    });

    it('onColumnOrderChange updates the state and url correctly', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // The first change should define the default order (MRT will call this once on page load)
      act(() =>
        result.current.onPreservedStatesChange.onColumnOrderChange([
          'catalogueItem.name',
          'catalogueItem.created_time',
          'catalogueItem.is_obsolete',
        ])
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnOrderChange([
          'catalogueItem.name',
          'catalogueItem.is_obsolete',
          'catalogueItem.created_time',
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.columnOrder)).toBe(
          JSON.stringify([
            'catalogueItem.name',
            'catalogueItem.is_obsolete',
            'catalogueItem.created_time',
          ])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4Igxg8iBcDa4EMAuCA2B7A5gVwKYEklcBbAOgDsFjcQAaRFDHAosgSwGcB9dAIw-SpcROgzRY8hEqTAAnXMlwATLkjbUQAXQC%2BQA'
      );

      // Now change back to a default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnOrderChange([
          'catalogueItem.name',
          'catalogueItem.created_time',
          'catalogueItem.is_obsolete',
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.columnOrder)).toBe(
          JSON.stringify([
            'catalogueItem.name',
            'catalogueItem.created_time',
            'catalogueItem.is_obsolete',
          ])
        )
      );
      expect(window.location.search).toBe('');
    });

    it('onColumnOrderChange updates the state and url correctly when loading with an initial state', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/?state=N4Igxg8iBcDa4EMAuCA2B7A5gVwKYEklcBbAOgDsFjcQAaRFDHAosgSwGcB9dAIw-SpcROgzRY8hEqTAAnXMlwATLkjbUQAXQC%2BQA'
      );

      // Check initial state loaded correctly
      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.columnOrder)).toBe(
          JSON.stringify([
            'catalogueItem.name',
            'catalogueItem.is_obsolete',
            'catalogueItem.created_time',
          ])
        )
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnOrderChange([
          'catalogueItem.name',
          'catalogueItem.created_time',
          'catalogueItem.is_obsolete',
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.columnOrder)).toBe(
          JSON.stringify([
            'catalogueItem.name',
            'catalogueItem.created_time',
            'catalogueItem.is_obsolete',
          ])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4Igxg8iBcDa4EMAuCA2B7A5gVwKYEklcBbAOgDsFjcQAaRFDHAossAJ12VwBMB9JAEtqdBmix5CJUoIDOfdACNZ6VLiIgAugF8gA'
      );

      // Now change back to the original value (should remain in url as default value not known in this case)
      act(() =>
        result.current.onPreservedStatesChange.onColumnOrderChange([
          'catalogueItem.name',
          'catalogueItem.is_obsolete',
          'catalogueItem.created_time',
        ])
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.columnOrder)).toBe(
          JSON.stringify([
            'catalogueItem.name',
            'catalogueItem.is_obsolete',
            'catalogueItem.created_time',
          ])
        )
      );
      expect(window.location.search).toBe(
        '?state=N4Igxg8iBcDa4EMAuCA2B7A5gVwKYEklcBbAOgDsFjcQAaRFDHAosgSwGcB9dAIw-SpcROgzRY8hEqTAAnXMlwATLkjbUQAXQC%2BQA'
      );
    });

    it('onPaginationChange updates the state and url correctly', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // The first change should define the default order (MRT will call this once on page load, with the intial default
      // state defined either inside the defaultState/the initialState given)
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 15,
          pageIndex: 0,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 15,
            pageIndex: 0,
          })
        )
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 30,
          pageIndex: 5,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 30,
            pageIndex: 5,
          })
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgDiBcpghg5gUwMoEsBeioGYAMAacBRASQDsATRADygFYBfBoA'
      );

      // Now change back to a default value
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 15,
          pageIndex: 0,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 15,
            pageIndex: 0,
          })
        )
      );
      expect(window.location.search).toBe('');
    });

    it('onPaginationChange updates the state and url correctly when using an initial state', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () =>
          usePreservedTableState({
            initialState: { pagination: { pageSize: 20, pageIndex: 1 } },
            storeInUrl: true,
          }),
        '/'
      );

      // The first change should define the default order (MRT will call this once on page load, with the intial default
      // state defined either inside the defaultState/the initialState given)
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 20,
          pageIndex: 1,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 20,
            pageIndex: 1,
          })
        )
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 30,
          pageIndex: 5,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 30,
            pageIndex: 5,
          })
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgDiBcpghg5gUwMoEsBeioGYAMAacBRASQDsATRADygFYBfBoA'
      );

      // Now change back to a default value
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 20,
          pageIndex: 1,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 20,
            pageIndex: 1,
          })
        )
      );
      expect(window.location.search).toBe('');
    });

    it('onPaginationChange updates the state and url correctly using an initial state and when loading an initial state from the url', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () =>
          usePreservedTableState({
            initialState: { pagination: { pageSize: 15, pageIndex: 0 } },
            storeInUrl: true,
          }),
        '/?state=N4IgDiBcpghg5gUwMoEsBeioGYAMAacBRASQDsATRADygFYBfBoA'
      );

      // The first change should define the default order (MRT will call this once on page load, with the intial default
      // state defined either inside the defaultState/the initialState given)
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 30,
          pageIndex: 5,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 30,
            pageIndex: 5,
          })
        )
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 20,
          pageIndex: 1,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 20,
            pageIndex: 1,
          })
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgDiBcpghg5gUwMoEsBeioCYAMAacBRASQDsATRADygEYBfBoA'
      );

      // Now change back to a default value
      act(() =>
        result.current.onPreservedStatesChange.onPaginationChange({
          pageSize: 15,
          pageIndex: 0,
        })
      );

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState.pagination)).toBe(
          JSON.stringify({
            pageSize: 15,
            pageIndex: 0,
          })
        )
      );
      expect(window.location.search).toBe('');
    });
  });
});
