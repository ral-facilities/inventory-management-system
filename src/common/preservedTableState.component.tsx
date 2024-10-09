import { ColumnFilter } from '@tanstack/react-table';
import LZString from 'lz-string';
import {
  MRT_ColumnFiltersState,
  MRT_ColumnFilterFnsState,
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
  cFn: MRT_ColumnFilterFnsState;
  srt: MRT_SortingState;
  cVis: MRT_VisibilityState;
  gFil: string | undefined; // Global filter
  g: MRT_GroupingState;
  cO: MRT_ColumnOrderState;
  p: MRT_PaginationState;
}

/* State but where undefined => should not be present in the url */
type StatePartial = Partial<State>;

/* Column filter value but defined as it will be stored in URL search params (includes type information) */
interface SearchParamsColumnFilterValue {
  type: 'string' | 'date';
  value: unknown;
}

/* State but defined as it will be stored in URL search params (includes potential type information) */
interface SearchParamsColumnFilter extends ColumnFilter {
  value: SearchParamsColumnFilterValue | SearchParamsColumnFilterValue[];
}

interface StateSearchParams extends StatePartial {
  cF?: SearchParamsColumnFilter[];
}

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

/* Parses a column filter value from the search param value to an internal state value */
const convertSearchParamColumnFilterValue = (
  filterValue: SearchParamsColumnFilterValue
): unknown => {
  if (filterValue.type === 'date')
    return new Date(
      // Type should be string, but TypeScript doesn't know that
      typeof filterValue.value === 'string' ? filterValue.value : ''
    );
  else return filterValue.value;
};

/* Converts the state found in the search params to an internal one (they are the same but with different
   types for the column filters) */
const convertStateSearchParams = (
  parsedStateSearchParams: StateSearchParams
): StatePartial => {
  let newCF = undefined;

  if (parsedStateSearchParams.cF) {
    newCF = [];

    // Parse each filter
    for (const filter of parsedStateSearchParams.cF) {
      // Check for multiple filters e.g. min/max
      if (filter.value instanceof Array) {
        // Need to convert each individual value
        const newFilterValue = [];

        for (const filterValue of filter.value)
          newFilterValue.push(convertSearchParamColumnFilterValue(filterValue));

        newCF.push({ id: filter.id, value: newFilterValue });
      } else
        newCF.push({
          id: filter.id,
          value: convertSearchParamColumnFilterValue(filter.value),
        });
    }
  }
  return { ...parsedStateSearchParams, cF: newCF };
};

/* Converts a column filter value from the internal state value to a search param value */
const convertInternalColumnFilterValue = (
  filterValue: unknown
): SearchParamsColumnFilterValue => {
  if (filterValue instanceof Date) {
    if (!isNaN(filterValue.getTime()))
      return { type: 'date', value: filterValue.toISOString() };
    // If date is invalid and not complete, just leave empty in the URL
    // otherwise will have a red box with nothing in it
    else return { type: 'string', value: '' };
  } else return { type: 'string', value: filterValue };
};

/* Converts the internal state to the one found in the search params (they are the same but with different
   types for the column filters) */
const convertInternalState = (parsedState: StatePartial): StateSearchParams => {
  let newCF = undefined;

  if (parsedState.cF) {
    newCF = [];

    // Parse each filter
    for (const filter of parsedState.cF) {
      // Check for multiple filters e.g. min/max
      if (filter.value instanceof Array) {
        const newFilterValue: SearchParamsColumnFilterValue[] = [];

        for (const filterValue of filter.value)
          newFilterValue.push(convertInternalColumnFilterValue(filterValue));

        newCF.push({ id: filter.id, value: newFilterValue });
      } else
        newCF.push({
          id: filter.id,
          value: convertInternalColumnFilterValue(filter.value),
        });
    }
  }

  return { ...parsedState, cF: newCF };
};

/* Parses the unparsed state returning nothing if it's null or not parsable */
const getParsedState = (unparsedState: string): StatePartial => {
  if (unparsedState !== null) {
    try {
      const parsedStateSearchParams = JSON.parse(
        unparsedState
      ) as StateSearchParams;

      return convertStateSearchParams(parsedStateSearchParams);
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
}

export const usePreservedTableState = (props?: UsePreservedTableStateProps) => {
  const firstUpdate = useRef<StatePartial>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Keeps track of the last location state update to occur (for detecting browser changes e.g. back button being clicked)
  const lastLocationUpdate = useRef(location);

  const urlParamName = props?.urlParamName || 'state';
  const compressedState = props?.storeInUrl
    ? searchParams.get(urlParamName)
    : null;
  const unparsedState = decompressState(compressedState);

  const [parsedState, setParsedState] = useState<StatePartial>(
    getParsedState(unparsedState)
  );

  // Update the search params only if necessary
  useEffect(() => {
    if (props?.storeInUrl) {
      // Get the expected unparsed state in the URL for the current internal state
      const parsedStateSearchParams = convertInternalState(parsedState);
      const newUnparsedState = JSON.stringify(parsedStateSearchParams);

      // Wait for a column order change if required
      if (unparsedState !== newUnparsedState) {
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

          setParsedState(getParsedState(unparsedState));
        }
      }

      lastLocationUpdate.current = location;
    }
  }, [
    location,
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
      cFn: props?.initialState?.columnFilterFns || {},
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
      props?.initialState?.columnFilterFns,
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
      cFn: parsedState.cFn || defaultState.cFn,
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
      defaultState.cFn,
      defaultState.cO,
      defaultState.cVis,
      defaultState.g,
      defaultState.gFil,
      defaultState.p,
      defaultState.srt,
      parsedState.cF,
      parsedState.cFn,
      parsedState.cO,
      parsedState.cVis,
      parsedState.g,
      parsedState.gFil,
      parsedState.p,
      parsedState.srt,
    ]
  );

  const updateSearchParams = useCallback(
    (stateUpdater: Updater<StatePartial>) => {
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
      updateSearchParams((prevState: StatePartial) => {
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
                if (
                  // MRT seemingly uses these interchangeably between renders
                  value !== '' &&
                  value !== undefined &&
                  // Dates that are invalid because they aren't complete should not be stored
                  // if possible (this won't stop it if there is another date within the same filter
                  // that is valid)
                  !(value instanceof Date && isNaN(value.getTime()))
                ) {
                  isDefaultState = false;
                  break filterLoop;
                }
              }
            } else if (filter.value) isDefaultState = false;
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

  const setColumnFilterFns = useCallback(
    (updaterOrValue: Updater<MRT_ColumnFilterFnsState>) => {
      updateSearchParams((prevState: StatePartial) => {
        const newValue = getValueFromUpdater(
          updaterOrValue,
          prevState.cFn || defaultState.cFn
        );
        const initialValue = defaultState.cFn;
        const isDefaultState =
          JSON.stringify(initialValue) === JSON.stringify(newValue);
        return {
          ...prevState,
          cFn: isDefaultState ? undefined : newValue,
        };
      });
    },
    [defaultState.cFn, updateSearchParams]
  );

  const setSorting = useCallback(
    (updaterOrValue: Updater<MRT_SortingState>) => {
      updateSearchParams((prevState: StatePartial) => {
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
      updateSearchParams((prevState: StatePartial): StatePartial => {
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
      updateSearchParams((prevState: StatePartial) => {
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
      updateSearchParams((prevState: StatePartial) => {
        const prevStateValue = prevState.g || defaultState.g;
        const newValue = getValueFromUpdater(updaterOrValue, prevStateValue);

        // Check whether the new state is the default one
        const isDefaultState =
          JSON.stringify(newValue) === JSON.stringify(defaultState.g);

        return {
          ...prevState,
          g: isDefaultState ? undefined : newValue,
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
      updateSearchParams((prevState: StatePartial): StatePartial => {
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
      if (firstUpdate.current.p === undefined && !props?.paginationOnly) {
        firstUpdate.current.p = getValueFromUpdater(updaterOrValue, state.p);
        return;
      }
      updateSearchParams((prevState: StatePartial) => {
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
      columnFilterFns: state.cFn,
      sorting: state.srt,
      columnVisibility: state.cVis,
      globalFilter: state.gFil,
      grouping: state.g,
      columnOrder: state.cO,
      pagination: state.p,
    },
    onPreservedStatesChange: {
      onColumnFiltersChange: setColumnFilters,
      onColumnFilterFnsChange: setColumnFilterFns,
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      onGroupingChange: setGroupingState,
      onColumnOrderChange: setColumnOrder,
      onPaginationChange: setPagination,
    },
  };
};
