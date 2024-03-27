import {
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_PaginationState,
  MRT_RowData,
  MRT_SortingState,
  MRT_TableState,
  MRT_VisibilityState,
} from 'material-react-table';
import { useSearchParams } from 'react-router-dom';

// State as will be stored after parsing from search params
interface State {
  cF: MRT_ColumnFiltersState;
  srt: MRT_SortingState;
  cVis: MRT_VisibilityState;
  gFil: string | undefined; // Global filter
  p: MRT_PaginationState;
  cO: MRT_ColumnOrderState;
}

// State as will be stored in search params (undefined => should not be present in the url)
interface StateSearchParams extends Partial<State> {}

/* This matches the definition found in tanstack table (couldn't be direcly imported
   as its a dependency of MRT) */
type Updater<T> = T | ((old: T) => T);

/* Returns correctly types value from an updater */
const getValueFromUpdater = <T,>(updater: Updater<T>, currentValue: T) =>
  updater instanceof Function ? (updater(currentValue) as T) : (updater as T);

interface UsePreservedTableStateProps {
  initialState?: Partial<MRT_TableState<MRT_RowData>>;
}

export const usePreservedTableState = (props?: UsePreservedTableStateProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const unparsedStateSearchParams = searchParams.get('state');
  // TODO: Do something when it fails to parse from url
  const parsedStateSearchParams: StateSearchParams =
    unparsedStateSearchParams !== null
      ? JSON.parse(unparsedStateSearchParams)
      : {};

  const state: State = {
    cF: parsedStateSearchParams.cF || [],
    srt: parsedStateSearchParams.srt || [],
    // Use given default or {}
    cVis:
      parsedStateSearchParams.cVis ||
      props?.initialState?.columnVisibility ||
      {},
    gFil: parsedStateSearchParams.gFil,
    p: parsedStateSearchParams.p ||
      props?.initialState?.pagination || { pageSize: 15, pageIndex: 0 },
    cO: parsedStateSearchParams.cO || [],
  };

  const updateSearchParams = (modifiedParams: StateSearchParams) => {
    // Merge existing and new params
    const newStateSearchParams: StateSearchParams = {
      ...parsedStateSearchParams,
      ...modifiedParams,
    };
    const newUnparsedStateSearchParams = JSON.stringify(newStateSearchParams);

    // Clear search params if state is no longer needed
    if (newUnparsedStateSearchParams !== '{}')
      setSearchParams({ state: newUnparsedStateSearchParams });
    else setSearchParams({});
  };

  // TODO: Use callbacks?
  const setColumnFilters = (
    updaterOrValue: Updater<MRT_ColumnFiltersState>
  ) => {
    const newValue = getValueFromUpdater(updaterOrValue, state.cF);
    updateSearchParams({
      cF: newValue.length === 0 ? undefined : newValue,
    });
  };

  const setSorting = (updaterOrValue: Updater<MRT_SortingState>) => {
    const newValue = getValueFromUpdater(updaterOrValue, state.srt);
    updateSearchParams({
      srt: newValue.length === 0 ? undefined : newValue,
    });
  };

  const setColumnVisibility = (
    updaterOrValue: Updater<MRT_VisibilityState>
  ) => {
    const newValue = getValueFromUpdater(updaterOrValue, state.cVis);
    // TODO: Make this work for multiple (MRT stores it forever after initially chaning, so it might be
    //       easiest to just let it be there afterwards)
    updateSearchParams({
      cVis:
        JSON.stringify(newValue) ===
        JSON.stringify(props?.initialState?.columnVisibility || {})
          ? undefined
          : newValue,
    });
  };

  const setGlobalFilter = (updaterOrValue: Updater<string | undefined>) => {
    const newValue = getValueFromUpdater(updaterOrValue, state.gFil);
    updateSearchParams({
      gFil: newValue === '' ? undefined : newValue,
    });
  };

  const setPagination = (updaterOrValue: Updater<MRT_PaginationState>) => {
    const newValue = getValueFromUpdater(updaterOrValue, state.p);
    // TODO: Make this work for multiple (MRT stores it forever after initially chaning, so it might be
    //       easiest to just let it be there afterwards)
    updateSearchParams({
      p:
        JSON.stringify(newValue) ===
        JSON.stringify(props?.initialState?.pagination || {})
          ? undefined
          : newValue,
    });
  };

  const setColumnOrder = (updaterOrValue: Updater<MRT_ColumnOrderState>) => {
    const newValue = getValueFromUpdater(updaterOrValue, []);
    updateSearchParams({
      cO: newValue.length === 0 ? undefined : newValue,
    });
  };

  return {
    preservedState: {
      columnFilters: state.cF,
      sorting: state.srt,
      columnVisibility: state.cVis,
      globalFilter: state.gFil,
      pagination: state.p,
      columnOrder: state.cO,
    },
    onChangePreservedStates: {
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      onPaginationChange: setPagination,
      onColumnOrderChange: setColumnOrder,
    },
  };
};
