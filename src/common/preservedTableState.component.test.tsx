import { renderHook, waitFor } from '@testing-library/react';
import LZString from 'lz-string';
import { MRT_VisibilityState } from 'material-react-table';
import { act } from 'react';
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
          columnFilterFns: {},
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
          columnFilterFns: {},
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
          columnFilterFns: {},
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
          columnFilterFns: {},
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
      //   cF: [
      //     {
      //       // Single string field
      //       id: 'catalogueItem.name',
      //       value: { type: 'string', value: 'nameFilter' },
      //     },
      //     {
      //       // Single date field
      //       id: 'catalogueItem.modified_time',
      //       value: { type: 'date', value: '2024-06-11T23:00:00.000Z' },
      //     },
      //     {
      //       // Min/Max string field (with max as undefined)
      //       id: 'catalogueItem.days_to_rework',
      //       value: [
      //         { type: 'string', value: '20' },
      //         { type: 'string', value: undefined },
      //       ],
      //     },
      //     {
      //       // Min/Max date field (with min as undefined)
      //       id: 'catalogueItem.created_time',
      //       value: [
      //         { type: 'string', value: undefined },
      //         { type: 'date', value: '2024-06-11T23:00:00.000Z' },
      //       ],
      //     },
      //   ],
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
      // );

      const { result } = renderHook(
        () =>
          usePreservedTableState({
            storeInUrl: true,
          }),
        {
          wrapper: hooksWrapperWithProviders({
            urlPathKey: 'any',
            initialEntry:
              '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJMoGAngA5NoIAM4YATglr4W7TkJD1GEBNgriQAX03NEKYWEw4CJclWqVcSBADMExJAH0MCRrI7Yu0HgIVJMTKweXiAATAAMoQAsALThAGwxAIxJACqhAMzQ4eHZ4dQ54QBaWjp6qIZYeERkFDT+vCLOuI7ixADuuOIA1u7yMPAgfIKoYpLSfZ4KEVq6Q76jElIymgC6ZSDIFUbVpnXUYG0BTi5uQf1wPiPCY8uzV34BkyER0XGJKelZOXkFOSVrNasETiDADcoGHYmWrmJSBEBIYgiMAwCQkIHgABqCBE3HQVWhZhoh2Ix2criENhwImIrEqxhqROoiORkn4LlwtBgVOwNJ0IHwKmwqHweAARjghepZDI4PiGXtzDjHLgxSJcNhiBQQKs6QB5AYgSigmLiXDtGLEAAe-DQtBQrGNGFN5piaDAHNouN1IH4eNt+GIAGUEAAvIQZcKsANke3WmAAVm0QA',
          }),
        }
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [
            { id: 'catalogueItem.name', value: 'nameFilter' },
            {
              id: 'catalogueItem.modified_time',
              value: '2024-06-11T23:00:00.000Z',
            },
            { id: 'catalogueItem.days_to_rework', value: ['20', null] },
            {
              id: 'catalogueItem.created_time',
              value: [null, '2024-06-11T23:00:00.000Z'],
            },
          ],
          columnFilterFns: {},
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

    it('loads the state found in the url when going back', async () => {
      // URL from the test above
      window.history.pushState(
        {},
        '',
        '/?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJMoGAngA5NoIAM4YATglr4W7TkJD1GEBNgriQAX03NEKYWEw4CJclWqVcSBADMExJAH0MCRrI7Yu0HgIVJMTKweXiAATAAMoQAsALThAGwxAIxJACqhAMzQ4eHZ4dQ54QBaWjp6qIZYeERkFDT+vCLOuI7ixADuuOIA1u7yMPAgfIKoYpLSfZ4KEVq6Q76jElIymgC6ZSDIFUbVpnXUYG0BTi5uQf1wPiPCY8uzV34BkyER0XGJKelZOXkFOSVrNasETiDADcoGHYmWrmJSBEBIYgiMAwCQkIHgABqCBE3HQVWhZhoh2Ix2criENhwImIrEqxhqROoiORkn4LlwtBgVOwNJ0IHwKmwqHweAARjghepZDI4PiGXtzDjHLgxSJcNhiBQQKs6QB5AYgSigmLiXDtGLEAAe-DQtBQrGNGFN5piaDAHNouN1IH4eNt+GIAGUEAAvIQZcKsANke3WmAAVm0QA'
      );
      const { result } = renderHookWithBrowserRouterURL(
        () =>
          usePreservedTableState({
            storeInUrl: true,
          }),
        '/'
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [],
          columnFilterFns: {},
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

      window.history.back();

      await waitFor(() =>
        expect(JSON.stringify(result.current.preservedState)).toBe(
          JSON.stringify({
            columnFilters: [
              { id: 'catalogueItem.name', value: 'nameFilter' },
              {
                id: 'catalogueItem.modified_time',
                value: '2024-06-11T23:00:00.000Z',
              },
              { id: 'catalogueItem.days_to_rework', value: ['20', null] },
              {
                id: 'catalogueItem.created_time',
                value: [null, '2024-06-11T23:00:00.000Z'],
              },
            ],
            //should actually have values in practice, but not working on this table in this PR.
            columnFilterFns: {},
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
        )
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
              '?subState=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJMoGAngA5NoIAM4YATglr4W7TkJD1GEBNgriQAX03NEKYWEw4CJclWqVcSBADMExJAH0MCRrI7Yu0HgIVJMTKweXiAATAAMoQAsALThAGwxAIxJACqhAMzQ4eHZ4dQ54QBaWjp6qIZYeERkFDT+vCLOuI7ixADuuOIA1u7yMPAgfIKoYpLSfZ4KEVq6Q76jElIymgC6ZSDIFUbVpnXUYG0BTi5uQf1wPiPCY8uzV34BkyER0XGJKelZOXkFOSVrNasETiDADcoGHYmWrmJSBEBIYgiMAwCQkIHgABqCBE3HQVWhZhoh2Ix2criENhwImIrEqxhqROoiORkn4LlwtBgVOwNJ0IHwKmwqHweAARjghepZDI4PiGXtzDjHLgxSJcNhiBQQKs6QB5AYgSigmLiXDtGLEAAe-DQtBQrGNGFN5piaDAHNouN1IH4eNt+GIAGUEAAvIQZcKsANke3WmAAVm0QA',
          }),
        }
      );

      expect(JSON.stringify(result.current.preservedState)).toBe(
        JSON.stringify({
          columnFilters: [
            { id: 'catalogueItem.name', value: 'nameFilter' },
            {
              id: 'catalogueItem.modified_time',
              value: '2024-06-11T23:00:00.000Z',
            },
            { id: 'catalogueItem.days_to_rework', value: ['20', null] },
            {
              id: 'catalogueItem.created_time',
              value: [null, '2024-06-11T23:00:00.000Z'],
            },
          ],
          columnFilterFns: {},
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
          columnFilterFns: {},
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
        '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJMoGAngA5NoIAM4YATglr4W7TkJAUxIAL4qAuiqA'
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

    it('onColumnFiltersChange updates the state and url correctly when have multiple filters', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnFiltersChange([
          { id: 'catalogueItem.cost', value: ['20', '30'] },
        ])
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnFilters)
        ).toBe(
          JSON.stringify([{ id: 'catalogueItem.cost', value: ['20', '30'] }])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0YuAzhiADQgBuOJM8IGAngAdiqRgCcEAO3wt2nYdBAAmAAwgAvs1D8hIjOKkyO2LgoDMqtQF0raoA'
      );

      // Now change back to a default value (in this case we test what would happen if clearing the second filter
      // like it would be cleared by clicking the x in MRT, and the other by using backspace)
      act(() =>
        result.current.onPreservedStatesChange.onColumnFiltersChange([
          { id: 'catalogueItem.cost', value: ['', undefined] },
        ])
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnFilters)
        ).toBe(JSON.stringify([]))
      );
      expect(window.location.search).toBe('');
    });

    it('onColumnFiltersChange updates the state and url correctly when have multiple date filters', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnFiltersChange([
          {
            id: 'catalogueItem.modifiedTime',
            value: [
              new Date('2024-01-06T23:00:00.000Z'),
              new Date('2024-06-06T23:00:00.000Z'),
            ],
          },
        ])
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnFilters)
        ).toBe(
          JSON.stringify([
            {
              id: 'catalogueItem.modifiedTime',
              value: [
                new Date('2024-01-06T23:00:00.000Z'),
                new Date('2024-06-06T23:00:00.000Z'),
              ],
            },
          ])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0luSCAZgsUgCoKXEgA0IAbjhIx4IDAE8ADt2ggkmbn0HZhsgEwAGNQBYAtBoCM%2BgGxs1AZmgaNVjdWsaAWiAC%2BPUBOmp5FXgKEyIJo6JiZmlta29tbOLgC68S5AA'
      );
    });

    it('onColumnFiltersChange updates the state and url correctly when have an invalid but complete date filter', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnFiltersChange([
          {
            id: 'catalogueItem.modifiedTime',
            value: [
              new Date('0001-12-06T23:00:00.000Z'),
              new Date('2024-06-06T23:00:00.000Z'),
            ],
          },
        ])
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnFilters)
        ).toBe(
          JSON.stringify([
            {
              id: 'catalogueItem.modifiedTime',
              value: [
                new Date('0001-12-06T23:00:00.000Z'),
                new Date('2024-06-06T23:00:00.000Z'),
              ],
            },
          ])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0luSCAZgsUgCoKXEgA0IAbjhIx4IDAE8ADt2ggkmbn0HZhsgAwaAjAFpNAJm1qAbGz0BmaBstrqGtQC0QAXx6gJ01PIq8BQmSD01PQAWQyMw0wsrDVsNRycAXUSnIA'
      );
    });

    it('onColumnFiltersChange updates the state correctly but not the url when have an invalid incomplete date filter', async () => {
      const { result } = renderHookWithBrowserRouterURL(
        () => usePreservedTableState({ storeInUrl: true }),
        '/'
      );

      // Change the state to a non-default value
      act(() =>
        result.current.onPreservedStatesChange.onColumnFiltersChange([
          {
            id: 'catalogueItem.modifiedTime',
            value: [
              new Date('Invalid Date'),
              new Date('2024-06-06T23:00:00.000Z'),
            ],
          },
        ])
      );

      await waitFor(() =>
        expect(
          JSON.stringify(result.current.preservedState.columnFilters)
        ).toBe(
          JSON.stringify([
            {
              id: 'catalogueItem.modifiedTime',
              value: [null, new Date('2024-06-06T23:00:00.000Z')],
            },
          ])
        )
      );

      expect(window.location.search).toBe(
        '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0luSCAZgsUgCoKXEgA0IAbjhIx4IDAE8ADt2ggAzhgBOCAHb5eAoTJAgAvj1ATpqJJm59B2YbIBMABhsAWALR2AbK7dsbAZmh27fztqALsALT0AXV1ooA'
      );
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
        () =>
          usePreservedTableState({
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

      // First change should define the default order (MRT will call this once on page load)
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
