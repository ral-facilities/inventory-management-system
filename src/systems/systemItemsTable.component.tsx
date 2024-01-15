import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, Typography } from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { useItems } from '../api/item';
import { Item, System, UsageStatusType } from '../app.types';

export interface SystemItemsTableProps {
  system: System;
}

export function SystemItemsTable(props: SystemItemsTableProps) {
  const { system } = props;

  const { data: itemsData, isLoading: isLoadingItems } = useItems(
    system.id,
    undefined
  );

  const columns = React.useMemo<MRT_ColumnDef<Item>[]>(
    () => [
      {
        header: 'Serial Number',
        accessorFn: (row) => row.serial_number,
        size: 250,
      },
      {
        header: 'Delivered Date',
        accessorFn: (row) => row.delivered_date,
        size: 250,
        Cell: ({ row }) => (
          <Typography>
            {row.original.delivered_date &&
              new Date(row.original.delivered_date).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        header: 'Is Defective',
        accessorFn: (row) => (row.is_defective === true ? 'Yes' : 'No'),
        size: 200,
        filterVariant: 'select',
      },
      {
        header: 'Usage Status',
        accessorFn: (row) => {
          // Assuming row.usage_status contains the numeric value corresponding to the enum
          const status = Object.values(UsageStatusType).find(
            (value) =>
              UsageStatusType[value as keyof typeof UsageStatusType] ===
              row.usage_status
          );
          return status || 'Unknown';
        },
        size: 200,
        filterVariant: 'select',
      },
    ],
    []
  );

  const [columnFilters, setColumnFilters] =
    React.useState<MRT_ColumnFiltersState>([]);

  const noResultsTxt = 'No items found';
  const table = useMaterialReactTable({
    columns: columns,
    data: itemsData ?? [],
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableColumnResizing: true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: true,
    enableTopToolbar: true,
    enableRowVirtualization: false,
    enableFullScreenToggle: false,
    enableColumnVirtualization: true,
    onColumnFiltersChange: setColumnFilters,
    columnVirtualizerOptions: {
      overscan: 4,
      estimateSize: () => 200,
    },
    manualFiltering: false,
    enablePagination: true,
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsTxt,
    },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    getRowId: (row) => row.id,
    muiTablePaperProps: {
      sx: { maxWidth: '100%' },
      // Viewport width - subsystems - extra - app drawer
      // sx: { maxWidth: 'calc(100vw - 320px - 32px - 280px)' },
    },
    muiTableContainerProps: {
      sx: { height: '360.4px' },
    },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    state: {
      showProgressBars: isLoadingItems,
      columnFilters,
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [15, 30, 45],
      shape: 'rounded',
      variant: 'outlined',
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <Button
          startIcon={<ClearIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          disabled={columnFilters.length === 0}
          onClick={() => {
            table.resetColumnFilters();
          }}
        >
          Clear Filters
        </Button>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
}
