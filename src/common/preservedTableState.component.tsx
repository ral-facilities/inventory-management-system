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
  g: MRT_GroupingState;
  cO: MRT_ColumnOrderState;
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
    if (props?.storeInUrl) {
      if (JSON.stringify(parsedState) !== unparsedState && location.pathname) {
        firstUpdate.current.p = undefined;
        setParsedState(getDefaultParsedState(unparsedState));
      }
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
          setSearchParams(searchParams);
        } else {
          searchParams.delete(urlParamName);
          setSearchParams(searchParams);
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

  // Default state to be for MRT used when storing undefined for any given parameter
  const defaultState: State = useMemo(
    () => ({
      cF: [],
      srt: [],
      // Use given default or {}
      cVis: props?.initialState?.columnVisibility || {},
      gFil: undefined,
      // Intial MRT assigned value is in first update, must be assigned here for column ordering to work correctly
      // when it is the first thing done
      g: props?.initialState?.grouping || [],
      cO: firstUpdate.current?.cO || [],
      p: props?.initialState?.pagination ||
        firstUpdate.current?.p || { pageSize: 15, pageIndex: 0 },
    }),
    // Need to also update when firstUpdate.current?.x changes, for some reason it claims its not used here when it is
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      props?.initialState?.columnVisibility,
      props?.initialState?.grouping,
      props?.initialState?.pagination,
      firstUpdate.current?.cO,
      firstUpdate.current?.p,
    ]
  );

  // Convert the state stored into the url to one that can be used
  // (apply any default values here)
  const state: State = useMemo(
    () => ({
      cF: parsedState.cF || defaultState.cF,
      srt: parsedState.srt || defaultState.srt,
      cVis: parsedState.cVis || defaultState.cVis,
      gFil: parsedState.gFil || defaultState.gFil,
      // Intial MRT assigned value is in first update, must be assigned here for column ordering to work correctly
      // when it is the first thing done
      g: parsedState.g || defaultState.g,
      cO: parsedState.cO || defaultState.cO,
      p: parsedState.p || defaultState.p,
    }),
    [
      defaultState.cF,
      defaultState.cO,
      defaultState.cVis,
      defaultState.g,
      defaultState.gFil,
      defaultState.p,
      defaultState.srt,
      parsedState.cF,
      parsedState.cO,
      parsedState.cVis,
      parsedState.g,
      parsedState.gFil,
      parsedState.p,
      parsedState.srt,
    ]
  );

  const updateSearchParams = useCallback(
    (stateUpdater: Updater<StateSearchParams>) => {
      // Use function version to ensure multiple can be changed in the same render
      // e.g. grouping also changes ordering
      setParsedState((prevState) => {
        return {
          ...prevState,
          ...getValueFromUpdater(stateUpdater, prevState),
        };
      });
    },
    []
  );

  // Below are setters for MRT onChange events, these should obtain the value and update it in the
  // parsed search params using a value of undefined only when it is no longer needed in the url
  // (presumably because it is now the default value/no longer needed)

  const setColumnFilters = useCallback(
    (updaterOrValue: Updater<MRT_ColumnFiltersState>) => {
      updateSearchParams((prevState: StateSearchParams) => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.cF || defaultState.cF
        );
        return {
          ...prevState,
          cF: newValue.length === 0 ? undefined : newValue,
        };
      });
    },
    [defaultState.cF, updateSearchParams]
  );

  const setSorting = useCallback(
    (updaterOrValue: Updater<MRT_SortingState>) => {
      updateSearchParams((prevState: StateSearchParams) => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.srt || defaultState.srt
        );
        return {
          ...prevState,
          srt: newValue.length === 0 ? undefined : newValue,
        };
      });
    },
    [defaultState.srt, updateSearchParams]
  );

  const setColumnVisibility = useCallback(
    (updaterOrValue: Updater<MRT_VisibilityState>) => {
      updateSearchParams((prevState: StateSearchParams): StateSearchParams => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.cVis || defaultState.cVis
        );
        // Check if default value for removing from the URL
        const initialValue = defaultState.cVis;
        let isDefaultState = true;
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
              isDefaultState = false;
          }
        }
        // New value empty, need to ensure initial value is for it to be default
        else isDefaultState = Object.keys(initialValue).length === 0;
        return {
          ...prevState,
          cVis: isDefaultState ? undefined : newValue,
        };
      });
    },
    [defaultState.cVis, updateSearchParams]
  );

  const setGlobalFilter = useCallback(
    (updaterOrValue: Updater<string | undefined>) => {
      updateSearchParams((prevState: StateSearchParams) => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.gFil || defaultState.gFil
        );
        return {
          ...prevState,
          gFil: newValue === '' ? undefined : newValue,
        };
      });
    },
    [defaultState.gFil, updateSearchParams]
  );

  const setGroupingState = useCallback(
    (updaterOrValue: Updater<MRT_GroupingState>) => {
      updateSearchParams((prevState: StateSearchParams) => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.g || defaultState.g
        );
        return {
          ...prevState,
          g:
            JSON.stringify(newValue) === JSON.stringify(defaultState.g)
              ? undefined
              : newValue,
        };
      });
    },
    [defaultState.g, updateSearchParams]
  );

  const setColumnOrder = useCallback(
    (updaterOrValue: Updater<MRT_ColumnOrderState>) => {
      // Ignore first update (pagination and column order has a habit of being set in MRT
      // shortly after the first render with actual data even if disabled in the table itself)
      // similar to https://www.material-react-table.com/docs/guides/state-management
      if (
        firstUpdate.current.cO === undefined &&
        // This is done additionally as on page load with a value in the url, no such issue
        // occurs here, equally we can't know what the default order was anymore so it should
        // never be removed from the url
        parsedState.cO === undefined
      ) {
        firstUpdate.current.cO = getValueFromUpdater(updaterOrValue, state.cO);
        return;
      }
      updateSearchParams((prevState: StateSearchParams): StateSearchParams => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.cO || defaultState.cO
        );
        return {
          ...prevState,
          cO:
            newValue.length === 0 ||
            JSON.stringify(newValue) === JSON.stringify(defaultState.cO)
              ? undefined
              : newValue,
        };
      });
    },
    [defaultState.cO, parsedState.cO, state.cO, updateSearchParams]
  );

  const setPagination = useCallback(
    (updaterOrValue: Updater<MRT_PaginationState>) => {
      // Ignore first update (pagination and column order has a habit of being set in MRT
      // shortly after the first render with actual data even if disabled in the table itself)
      // similar to https://www.material-react-table.com/docs/guides/state-management
      if (firstUpdate.current.p === undefined) {
        firstUpdate.current.p = getValueFromUpdater(updaterOrValue, state.p);
        return;
      }
      updateSearchParams((prevState: StateSearchParams) => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.p || defaultState.p
        );
        return {
          ...prevState,
          p:
            JSON.stringify(newValue) === JSON.stringify(defaultState.p)
              ? undefined
              : newValue,
        };
      });
    },
    [defaultState.p, state.p, updateSearchParams]
  );

  return {
    preservedState: {
      columnFilters: state.cF,
      sorting: state.srt,
      columnVisibility: state.cVis,
      globalFilter: state.gFil,
      grouping: state.g,
      columnOrder: state.cO,
      pagination: state.p,
    },
    onPreservedStatesChange: {
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      onGroupingChange: setGroupingState,
      onColumnOrderChange: setColumnOrder,
      onPaginationChange: setPagination,
    },
  };
};
