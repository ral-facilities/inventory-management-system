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
import { useSearchParams } from 'react-router-dom';

// State as will be stored after parsing from search params
interface State {
  cF: MRT_ColumnFiltersState;
  srt: MRT_SortingState;
  cVis: MRT_VisibilityState;
  gFil: string | undefined; // Global filter
  p: MRT_PaginationState;
  cO: MRT_ColumnOrderState;
  g: MRT_GroupingState;
}

// State as will be stored in search params (undefined => should not be present in the url)
interface StateSearchParams extends Partial<State> {}

/* This matches the definition found in tanstack table (couldn't be direcly imported
   as its a dependency of MRT) */
type Updater<T> = T | ((old: T) => T);

/* Returns correctly types value from an updater */
const getValueFromUpdater = <T,>(updater: Updater<T>, currentValue: T) =>
  updater instanceof Function ? (updater(currentValue) as T) : (updater as T);

/* Parses the unparsed state returning nothing if it's null or unparsable */
const getDefaultParsedState = (unparsedState: string | null) => {
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
}

export const usePreservedTableState = (props?: UsePreservedTableStateProps) => {
  const isFirstUpdate = useRef(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const unparsedState = props?.storeInUrl ? searchParams.get('state') : null;

  const [parsedState, setParsedState] = useState<StateSearchParams>(
    getDefaultParsedState(unparsedState)
  );

  // Update the search params only if necessary
  useEffect(() => {
    if (props?.storeInUrl) {
      const newUnparsedState = JSON.stringify(parsedState);
      if (unparsedState !== newUnparsedState) {
        // Clear search params if state is no longer needed
        if (newUnparsedState !== '{}')
          setSearchParams({ state: newUnparsedState });
        else setSearchParams({});
      }
    }
  }, [parsedState, props?.storeInUrl, setSearchParams, unparsedState]);

  // Convert the state stored into the url to one that can be used
  // (apply any default values here)
  const state: State = useMemo(
    () => ({
      cF: parsedState.cF || [],
      srt: parsedState.srt || [],
      // Use given default or {}
      cVis: parsedState.cVis || props?.initialState?.columnVisibility || {},
      gFil: parsedState.gFil,
      p: parsedState.p ||
        props?.initialState?.pagination || { pageSize: 15, pageIndex: 0 },
      cO: parsedState.cO || [],
      g: parsedState.g || [],
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
      props?.initialState?.pagination,
    ]
  );

  const updateSearchParams = useCallback(
    (modifiedParams: StateSearchParams) => {
      // Ignore first update (pagination and column order has a habit of being set in MRT
      // shortly after the first render with actual data even if disabled in the table itself)
      // similar to https://www.material-react-table.com/docs/guides/state-management
      if (isFirstUpdate.current) {
        isFirstUpdate.current = false;
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

  const setPagination = useCallback(
    (updaterOrValue: Updater<MRT_PaginationState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.p);
      updateSearchParams({
        p:
          JSON.stringify(newValue) ===
          JSON.stringify(props?.initialState?.pagination || {})
            ? undefined
            : newValue,
      });
    },
    [props?.initialState?.pagination, state.p, updateSearchParams]
  );

  const setColumnOrder = useCallback(
    (updaterOrValue: Updater<MRT_ColumnOrderState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.cO);
      updateSearchParams({
        cO: newValue.length === 0 ? undefined : newValue,
      });
    },
    [state.cO, updateSearchParams]
  );

  const setGroupingState = useCallback(
    (updaterOrValue: Updater<MRT_GroupingState>) => {
      const newValue = getValueFromUpdater(updaterOrValue, state.g);
      updateSearchParams({
        g: newValue.length === 0 ? undefined : newValue,
      });
    },
    [state.g, updateSearchParams]
  );

  return {
    preservedState: {
      columnFilters: state.cF,
      sorting: state.srt,
      columnVisibility: state.cVis,
      globalFilter: state.gFil,
      pagination: state.p,
      columnOrder: state.cO,
      grouping: state.g,
    },
    onChangePreservedStates: {
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      onPaginationChange: setPagination,
      onColumnOrderChange: setColumnOrder,
      onGroupingChange: setGroupingState,
    },
  };
};
