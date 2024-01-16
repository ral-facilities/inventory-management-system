import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, Link as MuiLink, Typography } from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItemIds } from '../api/catalogueItem';
import { useItems } from '../api/item';
import { CatalogueItem, Item, System, UsageStatusType } from '../app.types';

export interface SystemItemsTableProps {
  system: System;
}

export function SystemItemsTable(props: SystemItemsTableProps) {
  const { system } = props;

  const { data: itemsData, isLoading: isLoadingItems } = useItems(
    system.id,
    undefined
  );

  // Fetch catalogue item names for each item to display in the table
  const catalogueItemIdSet = new Set<string>(
    itemsData?.map((item) => item.catalogue_item_id) ?? []
  );
  let isLoading = isLoadingItems;
  const catalogueItemList: (CatalogueItem | undefined)[] = useCatalogueItemIds(
    Array.from(catalogueItemIdSet.values())
  ).map((obj) => {
    isLoading = isLoading || obj.isLoading;
    return obj.data;
  });

  const columns = React.useMemo<MRT_ColumnDef<Item>[]>(() => {
    return [
      {
        header: 'Catalogue Item',
        accessorFn: (row: Item) =>
          catalogueItemList?.find(
            (catalogueItem) => catalogueItem?.id === row.catalogue_item_id
          )?.name,
        id: 'catalogue_item_name',
        Cell: ({ renderedCellValue, row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`/catalogue/item/${row.original.catalogue_item_id}`}
          >
            {renderedCellValue}
          </MuiLink>
        ),
        size: 250,
      },
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
    ];
  }, [catalogueItemList]);

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
      showProgressBars: isLoading,
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

  // See https://github.com/KevinVandy/material-react-table/issues/815 -
  // For the loaded data to be visible have to remove the cache when loaded to
  // force the accessor function to be called again
  useEffect(() => {
    if (!isLoading) {
      // Only do this once all data has loaded
      table.getRowModel().rows.forEach((row) => {
        console.log(row._valuesCache);
        // @ts-ignore
        delete row._valuesCache['catalogue_item_name'];
      });
    }
  }, [table, catalogueItemList, isLoading]);

  console.log('RENDER');

  return <MaterialReactTable table={table} />;
}
