import ClearIcon from '@mui/icons-material/Clear';
import {
  Button,
  MenuItem,
  TableCellBaseProps,
  Link as MuiLink,
} from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { Link } from 'react-router';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { usePreservedTableState } from '../common/preservedTableState.component.tsx';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  MRT_Functions_Localisation,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableHeaderOverflowTip,
  customFilterFunctions,
  displayTableRowCountText,
  formatDateTimeStrings,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
} from '../utils.tsx';
import {
  useGetItemSystemsEntries,
  useGetSystemItemsEntries,
} from '../api/history.tsx';
import {
  ItemSystemsHistoryEntry,
  SystemItemsHistoryEntry,
} from '../api/api.types.tsx';
import { useParams } from 'react-router';

function ItemSystemHistory() {
  const { item_id, system_id } = useParams();

  const isItemSystemsHistoryView = !!item_id && !system_id;

  const itemSystemsHistory = useGetItemSystemsEntries(item_id ?? '');
  const systemItemsHistory = useGetSystemItemsEntries(system_id ?? '');

  const { data: historyData, isLoading: historyDataLoading } =
    isItemSystemsHistoryView ? itemSystemsHistory : systemItemsHistory;

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px + 75px');

  const columns = React.useMemo<
    MRT_ColumnDef<ItemSystemsHistoryEntry | SystemItemsHistoryEntry>[]
  >(() => {
    const isItemSystemsHistoryRow = (
      row: ItemSystemsHistoryEntry | SystemItemsHistoryEntry
    ): row is ItemSystemsHistoryEntry => 'system_name' in row;

    return [
      {
        header: isItemSystemsHistoryView ? 'System' : 'Item',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) =>
          isItemSystemsHistoryRow(row)
            ? row.system_name
            : row.item_serial_number,
        getGroupingValue: (row) =>
          isItemSystemsHistoryRow(row) ? row.system_id : row.item_id,
        id: isItemSystemsHistoryView ? 'system_name' : 'item_serial_number',
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
        size: 250,
        Cell: ({ row }) =>
          isItemSystemsHistoryRow(row.original) ? (
            <MuiLink
              underline="hover"
              component={Link}
              to={'/systems/' + row.original.system_id}
              // For ensuring space when grouping
              sx={{ marginRight: 0.5 }}
            >
              {row.original.system_name}
            </MuiLink>
          ) : (
            row.original.item_serial_number
          ),
      },
      {
        header: 'Entered At',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.entered_at),
        id: 'entered_at',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) => formatDateTimeStrings(row.original.entered_at, true),
      },
      {
        header: 'Entered By',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.entered_by,
        id: 'entered_by',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 350,
        Cell: ({ row }) => row.original.entered_by,
      },
      {
        header: 'Entered Comment',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.entered_comment,
        id: 'entered_comment',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 450,
        Cell: ({ row }) => row.original.entered_comment ?? 'No comment',
      },
      {
        header: 'Removed At',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => (row.removed_at ? new Date(row.removed_at) : ''),
        id: 'removed_at',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) =>
          row.original.removed_at &&
          formatDateTimeStrings(row.original.removed_at ?? '', true),
      },
      {
        header: 'Removed By',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.removed_by ?? '',
        id: 'removed_by',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        size: 350,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
      },
      {
        header: 'Removed Comment',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.removed_comment,
        id: 'removed_comment',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        size: 450,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
      },
    ];
  }, [isItemSystemsHistoryView]);

  const noResultsText = 'No results found: Refresh to try again';

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnFilterFns: initialColumnFilterFnState,
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: historyData ?? [],
    // Features
    enableColumnOrdering: true,
    enableColumnFilterModes: true,
    enableColumnResizing: true,
    enableFacetedValues: true,
    enableRowActions: false,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
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
      noRecordsToDisplay: noResultsText,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      showProgressBars: historyDataLoading, //or showSkeletons
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableBodyCellProps: ({ column }) =>
      // Ignore MRT rendered cells e.g. expand , spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                    overFlowTipSx: { width: '25vw' },
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },
    muiTablePaperProps: { sx: { maxHeight: '100%' } },
    muiTableContainerProps: { sx: { height: tableHeight } },
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
    muiDetailPanelProps: {
      sx: {
        '.MuiCollapse-vertical': {
          width: '800px',
        },
      },
    },
    ...onPreservedStatesChange,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        startIcon={<ClearIcon />}
        sx={{ mx: '4px' }}
        variant="outlined"
        disabled={preservedState.columnFilters.length === 0}
        onClick={() => {
          table.resetColumnFilters();
        }}
      >
        Clear Filters
      </Button>
    ),
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, historyData, 'History Entries', {
        paddingLeft: '8px',
      }),
  });

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  );
}

export default ItemSystemHistory;
