import { MRT_ColumnFiltersState } from 'material-react-table';
import { useSearchParams } from 'react-router-dom';

// State as will be stored in search params (undefined => should not be present)
interface StateSearchParams {
  // Column filters
  cF?: MRT_ColumnFiltersState;
}

// State as will be stored after parsing from search params
interface State {
  // Column filters
  cF: MRT_ColumnFiltersState;
}

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

  console.log(unparsedStateSearchParams);

  const setColumnFilters = (
    updaterOrValue:
      | MRT_ColumnFiltersState
      | ((old: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)
  ) => {
    const newColumnFilters =
      updaterOrValue instanceof Function
        ? updaterOrValue(state.cF)
        : updaterOrValue;

    const newStateSearchParams: StateSearchParams = {
      ...parsedStateSearchParams,
      cF: newColumnFilters.length === 0 ? undefined : newColumnFilters,
    };
    setSearchParams({ state: JSON.stringify(newStateSearchParams) });
  };

  return {
    columnFilters: state.cF,
    setColumnFilters: setColumnFilters,
  };
};
