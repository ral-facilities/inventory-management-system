import LZString from 'lz-string';
import {
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_GroupingState,
  MRT_PaginationState,
  MRT_RowData,
  MRT_SortingState,
  MRT_TableState,
  MRT_VisibilityState,
} from 'material-react-table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

// State as will be stored after parsing from search params
interface State {
  cF: MRT_ColumnFiltersState;
  srt: MRT_SortingState;
  cVis: MRT_VisibilityState;
  gFil: string | undefined; // Global filter
  cO: MRT_ColumnOrderState;
  g: MRT_GroupingState;
  p: MRT_PaginationState;
}

// State as will be stored in search params (undefined => should not be present in the url)
interface StateSearchParams extends Partial<State> {}

/* This matches the definition found in tanstack table (couldn't be direcly imported
   as its a dependency of MRT) */
type Updater<T> = T | ((old: T) => T);

/* Returns correctly types value from an updater */
const getValueFromUpdater = <T,>(updater: Updater<T>, currentValue: T) =>
  updater instanceof Function ? (updater(currentValue) as T) : (updater as T);

/* Attempts to decompress state from URL, returns '{}' if its null or not decompressable
   (which appears rare) */
const decompressState = (compressedStateOrNull: string | null) => {
  if (compressedStateOrNull !== null) {
    try {
      return LZString.decompressFromEncodedURIComponent(compressedStateOrNull);
    } catch (_error) {
      // Do nothing, error shouldn't appear to the user
    }
  }
  return '{}';
};

/* Parses the unparsed state returning nothing if it's null or unparsable */
const getDefaultParsedState = (unparsedState: string) => {
  if (unparsedState !== null) {
    try {
      return JSON.parse(unparsedState);
    } catch (_error) {
      // Do nothing, error shouldnt appear to the user
    }
  }
  return {};
};

interface UsePreservedTableStateProps {
  initialState?: Partial<MRT_TableState<MRT_RowData>>;
  // Use this to only store the state internally and not preserve it in the URL e.g. dialogues
  storeInUrl?: boolean;
  // URL parameter name to store the state in (default is 'state' if not defined here)
  urlParamName?: string;
}

export const usePreservedTableState = (props?: UsePreservedTableStateProps) => {
  const firstUpdate = useRef<StateSearchParams>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const urlParamName = props?.urlParamName || 'state';
  const compressedState = props?.storeInUrl
    ? searchParams.get(urlParamName)
    : null;
  const unparsedState = decompressState(compressedState);

  const [parsedState, setParsedState] = useState<StateSearchParams>(
    getDefaultParsedState(unparsedState)
  );

  // Update when the path changes e.g. when navigating between systems (ensures
  // the same pagination state is recalled when going back), seems MRT treats pagination
  // slightly diferent to column order as it doesn't appear to have the same issue
  useEffect(() => {
    const defaultParsedState = getDefaultParsedState(unparsedState);
    if (defaultParsedState !== parsedState && location.pathname) {
      firstUpdate.current.p = undefined;
      setParsedState(defaultParsedState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Update the search params only if necessary
  useEffect(() => {
    if (props?.storeInUrl) {
      const newUnparsedState = JSON.stringify(parsedState);
      if (unparsedState !== newUnparsedState) {
        // Clear search params if state is no longer needed
        if (newUnparsedState !== '{}') {
          searchParams.set(
            urlParamName,
            LZString.compressToEncodedURIComponent(newUnparsedState)
          );
          setSearchParams(searchParams, { replace: true });
        } else {
          searchParams.delete(urlParamName);
          setSearchParams(searchParams, { replace: true });
        }
      }
    }
  }, [
    parsedState,
    props?.storeInUrl,
    searchParams,
    setSearchParams,
    unparsedState,
    urlParamName,
  ]);

  // Convert the state stored into the url to one that can be used
  // (apply any default values here)
  const state: State = useMemo(
    () => ({
      cF: parsedState.cF || [],
      srt: parsedState.srt || [],
      // Use given default or {}
      cVis: parsedState.cVis || props?.initialState?.columnVisibility || {},
      gFil: parsedState.gFil,
      // Intial MRT assigned value is in first update, must be assigned here for column ordering to work correctly
      // when it is the first thing done
      cO: parsedState.cO || firstUpdate.current?.cO || [],
      g: parsedState.g || props?.initialState?.grouping || [],
      p: parsedState.p ||
        props?.initialState?.pagination ||
        firstUpdate.current?.p || { pageSize: 15, pageIndex: 0 },
    }),
    [
      parsedState.cF,
      parsedState.cO,
      parsedState.cVis,
      parsedState.g,
      parsedState.gFil,
      parsedState.p,
      parsedState.srt,
      props?.initialState?.columnVisibility,
      props?.initialState?.grouping,
      props?.initialState?.pagination,
    ]
  );

  const updateSearchParams = useCallback(
    (modifiedParams: StateSearchParams) => {
      // Ignore first update (pagination and column order has a habit of being set in MRT
      // shortly after the first render with actual data even if disabled in the table itself)
      // similar to https://www.material-react-table.com/docs/guides/state-management
      if ('cO' in modifiedParams && firstUpdate.current.cO === undefined) {
        firstUpdate.current.cO = modifiedParams.cO;
        return;
      }
      if ('p' in modifiedParams && firstUpdate.current.p === undefined) {
        firstUpdate.current.p = modifiedParams.p;
        return;
      }
      // Use function version to ensure multiple can be changed in the same render
      // e.g. grouping also changes ordering
      setParsedState((prevState) => ({
        ...prevState,
        ...modifiedParams,
      }));
    },
    []
  );

  // Below are setters for MRT onChange events, these should obtain the value and update it in the
  // parsed search params using a value of undefined only when it is no longer needed in the url
  // (presumably because it is now the default value/no longer needed)

  const setColumnFilters = useCallback(
    (updaterOrValue: Updater<MRT_ColumnFiltersState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.cF);
      updateSearchParams({
        cF: newValue.length === 0 ? undefined : newValue,
      });
    },
    [state.cF, updateSearchParams]
  );

  const setSorting = useCallback(
    (updaterOrValue: Updater<MRT_SortingState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.srt);
      updateSearchParams({
        srt: newValue.length === 0 ? undefined : newValue,
      });
    },
    [state.srt, updateSearchParams]
  );

  const setColumnVisibility = useCallback(
    (updaterOrValue: Updater<MRT_VisibilityState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.cVis);

      // Check if default value for removing from the URL
      const initialValue = props?.initialState?.columnVisibility || {};
      let defaultState = true;
      if (Object.keys(newValue).length > 0) {
        // Check any undefined initial value is true or otherwise
        // if it is defined that it matches the original value, otherwise it
        // is not the default
        for (const key in newValue) {
          if (
            initialValue[key] === undefined
              ? newValue[key] !== true
              : initialValue[key] !== newValue[key]
          )
            defaultState = false;
        }
      } else {
        // New value empty, need to ensure initial value is for it to be default
        defaultState = Object.keys(initialValue).length === 0;
      }

      updateSearchParams({
        cVis: defaultState ? undefined : newValue,
      });
    },
    [props?.initialState?.columnVisibility, state.cVis, updateSearchParams]
  );

  const setGlobalFilter = useCallback(
    (updaterOrValue: Updater<string | undefined>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.gFil);
      updateSearchParams({
        gFil: newValue === '' ? undefined : newValue,
      });
    },
    [state.gFil, updateSearchParams]
  );

  const setColumnOrder = useCallback(
    (updaterOrValue: Updater<MRT_ColumnOrderState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.cO);
      updateSearchParams({
        cO:
          newValue.length === 0 ||
          JSON.stringify(newValue) === JSON.stringify(firstUpdate.current?.cO)
            ? undefined
            : newValue,
      });
    },
    [state.cO, updateSearchParams]
  );

  const setGroupingState = useCallback(
    (updaterOrValue: Updater<MRT_GroupingState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.g);
      updateSearchParams({
        g:
          JSON.stringify(newValue) ===
          JSON.stringify(props?.initialState?.grouping || {})
            ? undefined
            : newValue,
      });
    },
    [props?.initialState?.grouping, state.g, updateSearchParams]
  );

  const setPagination = useCallback(
    (updaterOrValue: Updater<MRT_PaginationState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.p);
      updateSearchParams({
        p:
          JSON.stringify(newValue) ===
          JSON.stringify(firstUpdate.current?.p || {})
            ? undefined
            : newValue,
      });
    },
    [state.p, updateSearchParams]
  );

  return {
    preservedState: {
      columnFilters: state.cF,
      sorting: state.srt,
      columnVisibility: state.cVis,
      globalFilter: state.gFil,
      columnOrder: state.cO,
      grouping: state.g,
      pagination: state.p,
    },
    onPreservedStatesChange: {
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      onColumnOrderChange: setColumnOrder,
      onGroupingChange: setGroupingState,
      onPaginationChange: setPagination,
    },
  };
};
