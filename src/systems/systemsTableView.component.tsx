import { TableRow, Typography } from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { System } from '../app.types';

export interface SystemsTableViewProps {
  systemsData?: System[];
  systemsDataLoading: boolean;
  onChangeParentId: (systemId: string | null) => void;
  selectedSystems: System[];
  type: 'moveTo' | 'copyTo';
}

export const SystemsTableView = (props: SystemsTableViewProps) => {
  const {
    systemsData,
    systemsDataLoading,
    onChangeParentId,
    selectedSystems,
    type,
  } = props;

  const selectedSystemIds: string[] = React.useMemo(
    () => selectedSystems.map((system) => system.id),
    [selectedSystems]
  );

  const noResultsText = 'No systems found within the selected system';
  const columns = React.useMemo<MRT_ColumnDef<System>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        Cell: ({ renderedCellValue, row }) => {
          const canPlaceHere =
            type === 'copyTo' || !selectedSystemIds.includes(row.original.id);
          return (
            <Typography
              sx={{
                color: canPlaceHere ? 'inherit' : 'action.disabled',
              }}
            >
              {renderedCellValue}
            </Typography>
          );
        },
      },
    ],
    [selectedSystemIds, type]
  );
  const table = useMaterialReactTable({
    columns: columns,
    data: systemsData ?? [],
    enableColumnOrdering: false,
    enableColumnPinning: false,
    enableTopToolbar: false,
    enableColumnResizing: false,
    enableFacetedValues: true,
    enableRowActions: false,
    enableGlobalFilter: false,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableColumnFilters: true,
    enableHiding: false,
    enableFullScreenToggle: false,
    muiTableContainerProps: { sx: { height: '360.4px' } },
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsText,
    },
    enablePagination: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 5, pageIndex: 0 },
    },
    state: {
      showProgressBars: systemsDataLoading,
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [5],
      shape: 'rounded',
      variant: 'outlined',
    },
    muiTableBodyRowProps: ({ row }) => {
      const canPlaceHere =
        type === 'copyTo' || !selectedSystemIds.includes(row.original.id);
      return {
        component: TableRow,
        onClick: () => canPlaceHere && onChangeParentId(row.original.id),
        'aria-label': `${row.original.name} row`,
        style: {
          cursor: canPlaceHere ? 'pointer' : 'not-allowed',
        },
      };
    },
  });

  return <MaterialReactTable table={table} />;
};
