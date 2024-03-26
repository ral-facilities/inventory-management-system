import { MRT_ColumnFiltersState } from 'material-react-table';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePreservedTableState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const columnFiltersParams = searchParams.get('columnFilters');
  const columnFilters =
    columnFiltersParams !== null ? JSON.parse(columnFiltersParams) : [];

  // const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
  //   []
  // );
  // console.log(columnFilters);

  const setColumnFilters = (
    stateFn:
      | ((prevState: MRT_ColumnFiltersState) => MRT_ColumnFiltersState)
      | undefined
  ) => {
    const newColumnFilters =
      stateFn !== undefined ? stateFn(columnFilters) : undefined;
    if (newColumnFilters !== undefined && newColumnFilters.length > 0)
      setSearchParams({ columnFilters: JSON.stringify(newColumnFilters) });
    else setSearchParams({});
  };

  return {
    columnFilters: columnFilters,
    setColumnFilters: setColumnFilters,
  };
};
