import ClearIcon from '@mui/icons-material/Clear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import { Box, Button, Link as MuiLink, Typography } from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_RowSelectionState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalogueItemIds } from '../api/catalogueItem';
import { useItems } from '../api/item';
import { CatalogueItem, Item, System, UsageStatusType } from '../app.types';
import ItemsDetailsPanel from '../items/ItemsDetailsPanel.component';
import SystemItemsDialog from './systemItemsDialog.component';
import { formatDateTimeStrings } from '../utils';

const MoveItemsButton = (props: {
  selectedItems: Item[];
  system: System;
  onChangeSelectedItems: (selectedItems: MRT_RowSelectionState) => void;
}) => {
  const [moveItemsDialogOpen, setMoveItemsDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        startIcon={<DriveFileMoveOutlinedIcon />}
        sx={{ mx: 0.5 }}
        variant="outlined"
        disabled={props.selectedItems.length === 0}
        onClick={() => setMoveItemsDialogOpen(true)}
      >
        Move to
      </Button>
      <SystemItemsDialog
        open={moveItemsDialogOpen}
        onClose={() => setMoveItemsDialogOpen(false)}
        selectedItems={props.selectedItems}
        onChangeSelectedItems={props.onChangeSelectedItems}
        parentSystemId={props.system.id}
      />
    </>
  );
};

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
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );

  // Data
  const { data: itemsData, isLoading: isLoadingItems } = useItems(
    system.id,
    undefined
  );

  // Obtain the selected system data, not just the selection state
  const selectedRowIds = Object.keys(rowSelection);
  const selectedItems =
    itemsData?.filter((item) => selectedRowIds.includes(item.id)) ?? [];

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
        itemsData.map(
          (itemData) =>
            ({
              item: itemData,
              catalogueItem: catalogueItemList?.find(
                (catalogueItem) =>
                  catalogueItem?.id === itemData.catalogue_item_id
              ),
            }) as TableRowData
        )
      );
    }
    // Purposefully leave out catalogueItemList - this will never be the same due
    // to the reference changing so instead am relying on isLoading to have changed to
    // false and then back to true again for any refetches that occurr - only
    // alternative I can see right now requires backend changes

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, itemsData]);

  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    return [
      {
        header: 'Catalogue Item',
        accessorFn: (row) => row.catalogueItem?.name,
        id: 'catalogueItem.name',
        Cell: ({ renderedCellValue, row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`/catalogue/item/${row.original.item.catalogue_item_id}`}
            // For ensuring space when grouping
            sx={{ marginRight: 0.5 }}
          >
            {renderedCellValue}
          </MuiLink>
        ),
        size: 250,
      },
      {
        header: 'ID',
        accessorKey: 'item.id',
        Cell: ({ renderedCellValue, row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`/catalogue/item/${row.original.item.catalogue_item_id}/items/${row.original.item.id}`}
            // For ensuring space when grouping
            sx={{ marginRight: 0.5 }}
          >
            {renderedCellValue}
          </MuiLink>
        ),
        size: 250,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.item.modified_time),
        id: 'item.modified_time',
        filterVariant: 'datetime-range',
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          row.original.item.modified_time &&
          formatDateTimeStrings(row.original.item.modified_time, true),
      },
      {
        header: 'Created',
        accessorFn: (row) => new Date(row.item.created_time),
        id: 'item.created_time',
        filterVariant: 'datetime-range',
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.item.created_time, true),
      },
      {
        header: 'Serial Number',
        accessorKey: 'item.serial_number',
        size: 250,
      },
      {
        header: 'Delivered Date',
        accessorFn: (row) => new Date(row.item.delivered_date ?? ''),
        id: 'item.delivered_date',
        filterVariant: 'date-range',
        size: 350,
        Cell: ({ row }) => (
          <Typography
            // For ensuring space when grouping
            sx={{ marginRight: 0.5 }}
          >
            {row.original.item.delivered_date &&
              formatDateTimeStrings(row.original.item.delivered_date, false)}
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

  const noResultsText = 'No items found';
  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: tableRows,
    // Features
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableColumnResizing: true,
    enableStickyHeader: true,
    enableDensityToggle: false,
    enableHiding: true,
    enableTopToolbar: true,
    enableRowVirtualization: false,
    enableFullScreenToggle: true,
    enableColumnVirtualization: false,
    enableRowSelection: true,
    enableGrouping: true,
    enablePagination: true,
    // Other settings
    manualFiltering: false,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    displayColumnDefOptions: {
      'mrt-row-expand': {
        enableResizing: true,
        size: 100,
      },
    },
    // Localisation
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsText,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      grouping: ['catalogueItem.name'],
      pagination: { pageSize: 15, pageIndex: 0 },
      columnVisibility: { 'item.created_time': false },
    },
    state: {
      showProgressBars: isLoading,
      columnFilters: columnFilters,
      rowSelection: rowSelection,
    },
    // MUI
    muiTablePaperProps: ({ table }) => ({
      // sx doesn't work here currently - see https://www.material-react-table.com/docs/guides/full-screen-toggle
      style: {
        maxWidth: '100%',
        // SciGateway navigation drawer is 1200, modal is 1300
        zIndex: table.getState().isFullScreen ? 1210 : undefined,
      },
    }),
    muiTableContainerProps: {
      sx: { minHeight: '360.4px' },
    },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [15, 30, 45],
      shape: 'rounded',
      variant: 'outlined',
    },
    // Fix width to ensure details panels are reasonably close together regardless of table width
    // - appears to be needed only when using enableColumnResizing, MuiCollapse is the container of
    // the details panel
    muiDetailPanelProps: {
      sx: {
        '.MuiCollapse-vertical': {
          width: '800px',
        },
      },
    },
    // Functions
    getRowId: (row) => row.item.id,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
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
        <MoveItemsButton
          selectedItems={selectedItems}
          system={system}
          onChangeSelectedItems={setRowSelection}
        />
      </Box>
    ),
    renderDetailPanel: ({ row }) =>
      row.original.catalogueItem !== undefined ? (
        <ItemsDetailsPanel
          itemData={row.original.item}
          catalogueItemIdData={row.original.catalogueItem}
        />
      ) : undefined,
  });

  return <MaterialReactTable table={table} />;
}
