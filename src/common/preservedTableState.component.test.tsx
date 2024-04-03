import { renderHook } from '@testing-library/react';
import { usePreservedTableState } from './preservedTableState.component';
import { hooksWrapperWithProviders } from '../testUtils';

describe('Preserved table state functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('usePreservedTableState', () => {
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

    it('correctly loads the state found in the url', () => {
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
      //   p: { pageSize: 30, pageIndex: 0 },
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
              '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJq9jEC2FAE4gAvgF1WAZ0EYY8EMlRhMOAiXJU6DJqyTFJYGBkElxrMADUEkmKGVY8RMhRphBxTMSQB9DAkYwAGY4ksTmKo7qLtR6BoIIAA5+uLRBIcQirPh82Kj4eABGODlCLCD4cugOas6a1t64BZK42MQUIBLgAPKVlDIAtIK4AO79xAAeCWi0KKx9GIMj-WhgybQ2nQm2IFP4xADKCABeTNAAzAAMrLtkMxMwFyIiQA',
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
          pagination: { pageSize: 30, pageIndex: 0 },
        })
      );
    });
  });
});
