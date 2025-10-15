import ClearIcon from '@mui/icons-material/Clear';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import {
  Box,
  Button,
  MenuItem,
  Link as MuiLink,
  TableCellBaseProps,
} from '@mui/material';
import {
  MRT_ColumnDef,
  MRT_RowSelectionState,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router';
import { CatalogueItem, Item, System } from '../api/api.types';
import { useGetCatalogueItemIds } from '../api/catalogueItems';
import { useGetItems } from '../api/items';
import { useGetUsageStatuses } from '../api/usageStatuses';
import { usePreservedTableState } from '../common/preservedTableState.component';
import ItemsDetailsPanel from '../items/itemsDetailsPanel.component';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  MRT_Functions_Localisation,
  OPTIONAL_FILTER_MODE_OPTIONS,
  OverflowTip,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableGroupedCell,
  TableHeaderOverflowTip,
  customFilterFunctions,
  displayTableRowCountText,
  formatDateTimeStrings,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
} from '../utils';
import SystemItemsDialog from './systemItemsDialog.component';

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
  system?: System;
}

export function SystemItemsTable(props: SystemItemsTableProps) {
  const { system } = props;

  // States
  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );
  // Data
  const { data: itemsData, isLoading: isLoadingItems } = useGetItems(
    system?.id,
    undefined
  );

  const { data: usageStatusData, isLoading: isLoadingUsageStatuses } =
    useGetUsageStatuses();

  // Obtain the selected system data, not just the selection state
  const selectedRowIds = Object.keys(rowSelection);
  const selectedItems =
    itemsData?.filter((item) => selectedRowIds.includes(item.id)) ?? [];
  // Fetch catalogue items for each item to display in the table
  const catalogueItemIdSet = React.useMemo(
    () =>
      new Set<string>(itemsData?.map((item) => item.catalogue_item_id) ?? []),
    [itemsData]
  );
  let isLoading = isLoadingItems || isLoadingUsageStatuses;

  const catalogueItemList: (CatalogueItem | undefined)[] =
    useGetCatalogueItemIds(Array.from(catalogueItemIdSet.values())).map(
      (query) => {
        isLoading = isLoading || query.isLoading;
        return query.data;
      }
    );

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
    // false and then back to true again for any re-fetches that occur - only
    // alternative I can see right now requires backend changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, itemsData]);

  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
    const usageStatusValues = usageStatusData?.map((val) => val.value);
    return [
      {
        header: 'Catalogue Item',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem?.name,
        getGroupingValue: (row) => row.catalogueItem?.id ?? '',
        id: 'catalogueItem.name',
        filterVariant: 'multi-select',
        filterFn: 'arrIncludesSome',
        columnFilterModeOptions: ['arrIncludesSome', 'arrExcludesSome'],
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) => [
          <MenuItem
            key="arrIncludesSome"
            onClick={() => onSelectFilterMode('arrIncludesSome')}
          >
            {MRT_Functions_Localisation.filterArrIncludesSome}
          </MenuItem>,
          <MenuItem
            key="arrExcludesSome"
            onClick={() => onSelectFilterMode('arrExcludesSome')}
          >
            {MRT_Functions_Localisation.filterArrExcludesSome}
          </MenuItem>,
        ],
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            sx={{ mr: 0.5 }}
            to={`/catalogue/${row.original.catalogueItem?.catalogue_category_id}/items/${row.original.catalogueItem?.id}`}
          >
            {row.original.catalogueItem?.name}
          </MuiLink>
        ),
        size: 350,
        GroupedCell: ({ row }) => {
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',

                width: '100%',
              }}
            >
              <OverflowTip
                disableParagraph
                sx={{
                  fontSize: 'inherit',
                  mx: 0.5,
                }}
              >
                <MuiLink
                  underline="hover"
                  component={Link}
                  sx={{ mr: 0.5 }}
                  to={`/catalogue/${row.original.catalogueItem?.catalogue_category_id}/items/${row.original.catalogueItem?.id}`}
                >
                  {row.original.catalogueItem?.name}
                </MuiLink>
                {`(${row.subRows?.length})`}
              </OverflowTip>
            </Box>
          );
        },
      },
      {
        header: 'Serial Number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.serial_number ?? 'No serial number',
        id: 'item.serial_number',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...['betweenInclusive'],
        ],
        size: 250,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            sx={{ mr: 0.5 }}
            to={`/catalogue/${row.original.catalogueItem?.catalogue_category_id}/items/${row.original.catalogueItem?.id}/items/${row.original.item.id}`}
          >
            {row.original.item.serial_number ?? 'No serial number'}
          </MuiLink>
        ),
        enableGrouping: false,
      },
      {
        header: 'Last modified',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.item.modified_time),
        id: 'item.modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          row.original.item.modified_time &&
          formatDateTimeStrings(row.original.item.modified_time, true),
      },
      {
        header: 'Created',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.item.created_time),
        id: 'item.created_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.item.created_time, true),
      },
      {
        header: 'Delivered Date',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          row.item.delivered_date ? new Date(row.item.delivered_date) : '',
        id: 'item.delivered_date',
        filterVariant: COLUMN_FILTER_VARIANTS.date,
        filterFn: COLUMN_FILTER_FUNCTIONS.date,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.date,
        size: 350,
        Cell: ({ row }) =>
          row.original.item.delivered_date &&
          formatDateTimeStrings(row.original.item.delivered_date, false),
        GroupedCell: (props) =>
          TableGroupedCell({
            ...props,
            outputType: 'Date',
          }),
      },
      {
        header: 'Is Defective',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => (row.item.is_defective === true ? 'Yes' : 'No'),
        id: 'item.is_defective',
        filterVariant: COLUMN_FILTER_VARIANTS.boolean,
        enableColumnFilterModes: false,
        size: 200,
      },
      {
        header: 'Usage Status',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.item.usage_status,
        id: 'item.usage_status',
        filterVariant: 'multi-select',
        filterFn: 'arrIncludesSome',
        columnFilterModeOptions: ['arrIncludesSome', 'arrExcludesSome'],
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) => [
          <MenuItem
            key="arrIncludesSome"
            onClick={() => onSelectFilterMode('arrIncludesSome')}
          >
            {MRT_Functions_Localisation.filterArrIncludesSome}
          </MenuItem>,
          <MenuItem
            key="arrExcludesSome"
            onClick={() => onSelectFilterMode('arrExcludesSome')}
          >
            {MRT_Functions_Localisation.filterArrExcludesSome}
          </MenuItem>,
        ],
        size: 350,
        filterSelectOptions: usageStatusValues,
      },
      {
        header: 'Expected Lifetime (Days)',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.catalogueItem?.expected_lifetime_days ?? '',
        id: 'catalogueItem.expected_lifetime_days',
        filterVariant: COLUMN_FILTER_VARIANTS.number,
        filterFn: COLUMN_FILTER_FUNCTIONS.number,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.number,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 300,
      },
    ];
  }, [usageStatusData]);

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { 'item.created_time': false },
      grouping: ['catalogueItem.name'],
      pagination: { pageSize: 15, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: true,
  });

  const noResultsText = 'No items found';
  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: tableRows,
    // Features
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableColumnFilterModes: true,
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
    filterFns: customFilterFunctions,
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
      ...MRT_Functions_Localisation,
      noRecordsToDisplay: noResultsText,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      showProgressBars: isLoading,
      rowSelection: rowSelection,
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableBodyCellProps: ({ column }) =>
      // The overflow of these column groups is done manually in the column definition
      ((column.id === 'catalogueItem.name' ||
        column.id === 'item.delivered_date') &&
        column.getIsGrouped()) ||
      // Ignore MRT rendered cells e.g. expand , spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
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
    muiTableContainerProps: ({ table }) => {
      const showAlert =
        table.getState().showAlertBanner ||
        table.getFilteredSelectedRowModel().rows.length > 0 ||
        table.getState().grouping.length > 0;
      return {
        sx: {
          height: table.getState().isFullScreen
            ? '100%'
            : getPageHeightCalc(`272px  ${showAlert ? '+ 72px' : ''}`),
        },
      };
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
    ...onPreservedStatesChange,
    getRowId: (row) => row.item.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <Button
          startIcon={<ClearIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          disabled={preservedState.columnFilters.length === 0}
          onClick={() => {
            table.resetColumnFilters();
          }}
        >
          Clear Filters
        </Button>
        {system && (
          <MoveItemsButton
            selectedItems={selectedItems}
            system={system}
            onChangeSelectedItems={setRowSelection}
          />
        )}
      </Box>
    ),
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, itemsData, 'Items', {
        paddingLeft: '8px',
      }),
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
