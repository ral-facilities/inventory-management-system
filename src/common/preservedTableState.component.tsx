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

/* This matches the definition found in tanstack table (couldn't be directly imported
   as its a dependency of MRT) */
type Updater<T> = T | ((old: T) => T);

/* Returns correctly types value from an updater */
const getValueFromUpdater = <T,>(updater: Updater<T>, currentValue: T) =>
  updater instanceof Function ? (updater(currentValue) as T) : (updater as T);

/* Attempts to decompress state from URL, returns '{}' if its null or not de-compressible
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
      // Do nothing, error shouldn't appear to the user
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
  // Whether this is being used just for pagination (if that is the case, assuming not in MRT and so
  // don't ignore initial update)
  paginationOnly?: boolean;
  // When grouping via drag and drop, this is required to know when reordering is enabled as the
  // column order state change would otherwise happen as a separate state change being pushed to the url
  // breaking it (default: 'reorder' just like MRT)
  mrtGroupedColumnMode?: false | 'reorder' | 'remove';
}

export const usePreservedTableState = (props?: UsePreservedTableStateProps) => {
  const mrtGroupedColumnMode = props?.mrtGroupedColumnMode ?? 'reorder';

  const firstUpdate = useRef<StateSearchParams>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Keeps track of the last location state update to occur (for detecting browser changes e.g. back button being clicked)
  const lastLocationUpdate = useRef(location);

  // Keeps track of grouping state changes (for fixing issue with drag and drop causing an additional url push for column ordering)
  const waitForColumnOrder = useRef(false);

  const urlParamName = props?.urlParamName || 'state';
  const compressedState = props?.storeInUrl
    ? searchParams.get(urlParamName)
    : null;
  const unparsedState = decompressState(compressedState);

  const [parsedState, setParsedState] = useState<StateSearchParams>(
    getDefaultParsedState(unparsedState)
  );

  // Update the search params only if necessary
  useEffect(() => {
    if (props?.storeInUrl) {
      const newUnparsedState = JSON.stringify(parsedState);
      // Wait for a column order change if required
      if (
        unparsedState !== newUnparsedState &&
        (mrtGroupedColumnMode !== 'reorder' || !waitForColumnOrder.current)
      ) {
        // Only set the search params if its just a current page state change and not a browser level change
        // such as clicking the back button
        if (
          lastLocationUpdate.current.pathname === location.pathname &&
          lastLocationUpdate.current.search === location.search
        ) {
          // Clear search params if state is no longer needed
          if (newUnparsedState !== '{}') {
            searchParams.set(
              urlParamName,
              LZString.compressToEncodedURIComponent(newUnparsedState)
            );
            setSearchParams(searchParams, { replace: false });
          } else {
            searchParams.delete(urlParamName);
            setSearchParams(searchParams, { replace: false });
          }
        } else {
          // Update the internal state to reflect the browser level change

          // Ensures the same pagination state is recalled when going back, seems MRT treats pagination
          // slightly differently to column order as it doesn't appear to have the same issue
          if (lastLocationUpdate.current.pathname !== location.pathname)
            firstUpdate.current.p = undefined;

          setParsedState(getDefaultParsedState(unparsedState));
        }
      }

      lastLocationUpdate.current = location;
    }
  }, [
    location,
    mrtGroupedColumnMode,
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
      // Initial MRT assigned value is in first update, must be assigned here for column ordering to work correctly
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
      // Initial MRT assigned value is in first update, must be assigned here for column ordering to work correctly
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

        // This will be true only if its a single filter that has been cleared
        let isDefaultState = newValue.length === 0;

        // For fields with multiple filters e.g. a minimum and maximum, the filter length
        // does not go back to 0, so each individual value needs to be checked instead
        if (!isDefaultState) {
          // Now assume it is a default state unless found otherwise
          isDefaultState = true;

          filterLoop: for (const filter of newValue) {
            // Check for multiple filters e.g. min/max
            if (filter.value instanceof Array) {
              // In this case each value must the default empty value to be classed as the default
              for (const value of filter.value) {
                // MRT seemingly uses these interchangeably between renders
                if (value !== '' && value !== undefined) {
                  isDefaultState = false;
                  break filterLoop;
                }
              }
            }
          }
        }

        return {
          ...prevState,
          cF: isDefaultState ? undefined : newValue,
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
        const prevStateValue = prevState.g || defaultState.g;
        const newValue = getValueFromUpdater(updaterOrValue, prevStateValue);
        // Check if adding a group
        if (newValue.length > prevStateValue.length)
          waitForColumnOrder.current = true;

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
        // occurs here, equally we can't know what the default order was any more so it should
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
        if (waitForColumnOrder.current) waitForColumnOrder.current = false;
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
      if (firstUpdate.current.p === undefined && !props?.paginationOnly) {
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
    [defaultState.p, props?.paginationOnly, state.p, updateSearchParams]
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
