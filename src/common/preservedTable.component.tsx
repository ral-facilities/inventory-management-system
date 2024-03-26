import { MRT_ColumnFiltersState } from 'material-react-table';
import { useSearchParams } from 'react-router-dom';

// State as will be stored in search params (undefined => should not be present in the url)
interface StateSearchParams {
  // Column filters
  cF?: MRT_ColumnFiltersState;
}

// State as will be stored after parsing from search params
interface State {
  // Column filters
  cF: MRT_ColumnFiltersState;
}

/* This matches the definition found in tanstack table (couldn't be direcly imported
   as its a dependency of MRT) */
type Updater<T> = T | ((old: T) => T);

/* Returns correctly types value from an updater */
const getValueFromUpdater = <T,>(updater: Updater<T>, currentValue: T) =>
  updater instanceof Function ? (updater(currentValue) as T) : (updater as T);

export const usePreservedTableState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const unparsedStateSearchParams = searchParams.get('state');
  // TODO: Do something when it fails to parse from url
  const parsedStateSearchParams: StateSearchParams =
    unparsedStateSearchParams !== null
      ? JSON.parse(unparsedStateSearchParams)
      : {};

  const state: State = {
    cF: parsedStateSearchParams.cF || [],
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

  const setColumnFilters = (
    updaterOrValue: Updater<MRT_ColumnFiltersState>
  ) => {
    const newColumnFilters = getValueFromUpdater(updaterOrValue, state.cF);
    updateSearchParams({
      cF: newColumnFilters.length === 0 ? undefined : newColumnFilters,
    });
  };

  return {
    columnFilters: state.cF,
    setColumnFilters: setColumnFilters,
  };
};
