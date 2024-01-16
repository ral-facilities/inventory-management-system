import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, Link as MuiLink, Typography } from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItemIds } from '../api/catalogueItem';
import { useItems } from '../api/item';
import { CatalogueItem, Item, System, UsageStatusType } from '../app.types';

/* Each table row needs the item and catalogue item */
interface TableRowData {
  item: Item;
  catalogueItem?: CatalogueItem;
}

export interface SystemItemsTableProps {
  system: System;
}

export function SystemItemsTable(props: SystemItemsTableProps) {
  const { system } = props;

  // States
  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  // Data
  const { data: itemsData, isLoading: isLoadingItems } = useItems(
    system.id,
    undefined
  );

  // Fetch catalogue items for each item to display in the table
  const catalogueItemIdSet = new Set<string>(
    itemsData?.map((item) => item.catalogue_item_id) ?? []
  );
  let isLoading = isLoadingItems;
  const catalogueItemList: (CatalogueItem | undefined)[] = useCatalogueItemIds(
    Array.from(catalogueItemIdSet.values())
  ).map((query) => {
    isLoading = isLoading || query.isLoading;
    return query.data;
  });

  // Once loading has finished - pair up all data for the table rows
  // If performance becomes a problem with this should remove find and fetch catalogue
  // item for each item/implement a fullDetails or something in backend
  React.useEffect(() => {
    if (!isLoading && itemsData) {
      setTableRows(
        itemsData.map((itemData) => ({
          item: itemData,
          catalogue_item: catalogueItemList?.find(
            (catalogueItem) => catalogueItem?.id === itemData.catalogue_item_id
          ),
        }))
      );
    }
  }, [catalogueItemList, isLoading, itemsData]);

  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    return [
      {
        header: 'Catalogue Item',
        accessorFn: (row) => row.catalogueItem?.name,
        id: 'catalogue_item_name',
        Cell: ({ renderedCellValue, row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`/catalogue/item/${row.original.item.catalogue_item_id}`}
          >
            {renderedCellValue}
          </MuiLink>
        ),
        size: 250,
      },
      {
        header: 'Serial Number',
        accessorKey: 'item.serial_number',
        size: 250,
      },
      {
        header: 'Delivered Date',
        accessorKey: 'item.delivered_date',
        size: 250,
        Cell: ({ row }) => (
          <Typography>
            {row.original.item.delivered_date &&
              new Date(row.original.item.delivered_date).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        header: 'Is Defective',
        accessorFn: (row) => (row.item.is_defective === true ? 'Yes' : 'No'),
        id: 'item.is_defective',
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
              row.item.usage_status
          );
          return status || 'Unknown';
        },
        id: 'item.usage_status',
        size: 200,
        filterVariant: 'select',
      },
    ];
  }, []);

  const [columnFilters, setColumnFilters] =
    React.useState<MRT_ColumnFiltersState>([]);

  const noResultsTxt = 'No items found';
  const table = useMaterialReactTable({
    columns: columns,
    data: tableRows,
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
    getRowId: (row) => row.item.id,
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

  return <MaterialReactTable table={table} />;
}
