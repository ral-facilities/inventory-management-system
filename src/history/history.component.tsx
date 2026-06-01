import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  capitalize,
  TableCellBaseProps,
  TableRow,
} from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { usePreservedTableState } from '../common/preservedTableState.component.tsx';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  OverflowTip,
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
import { useGetHistoryEntries } from '../api/history.tsx';
import { HistoryEntry } from '../api/api.types.tsx';
import { useLocation, useParams } from 'react-router';

const getOperationTypeName = (operation: string) => {
  switch (operation) {
    case 'insert':
      return 'Create';
    case 'replace':
      return 'Update';
    default:
      return capitalize(operation);
  }
};

type HistoryFieldRow = HistoryEntry & {
  updated_field: string;
  updated_value: unknown;
};

const transformUpdatedFieldValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .map((key, val) => `${key}: ${val}`)
      .join('\n');
  }
  return String(value);
};

function HistoryEntries() {
  const { element_id } = useParams();
  const location = useLocation();
  const historyPath = location.pathname.split('/');
  const collection = historyPath[historyPath.length - 3];

  const { data: historyData, isLoading: historyDataLoading } =
    useGetHistoryEntries(collection!, element_id ?? null);

  const flattenedHistoryData = React.useMemo<HistoryFieldRow[]>(() => {
    if (!historyData) {
      return [];
    }
    return historyData.flatMap((entry) =>
      Object.entries(entry.updated_fields ?? {}).map(([field, value]) => {
        // skip ObjectIds here, and parse values as well
        return {
          ...entry,
          updated_field: field,
          updated_value: value,
        };
      })
    );
  }, [historyData]);

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const columns = React.useMemo<MRT_ColumnDef<HistoryFieldRow>[]>(() => {
    return [
      {
        header: 'Comment',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.data_modified_comment,
        // Group by ID here so it is per history entry, but shows the user it is by comment,
        // so 2 changes with the same comment are grouped separately
        getGroupingValue: (row) => row.id,
        id: 'id',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        Cell: ({ row }) => {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <OverflowTip sx={{ fontSize: 'inherit' }}>
                {row.original.data_modified_comment ?? 'No comment'}
              </OverflowTip>
            </Box>
          );
        },
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
                {row.original.data_modified_comment ?? 'No comment'}
              </OverflowTip>
            </Box>
          );
        },
      },
      {
        header: 'Field',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.updated_field,
        id: 'updated_field',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        Cell: ({ row }) => row.original.updated_field,
        size: 250,
      },
      {
        header: 'Value',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.updated_value,
        id: 'updated_value',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        Cell: ({ row }) =>
          transformUpdatedFieldValue(row.original.updated_value),
        size: 250,
      },

      {
        header: 'Modified Time',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => new Date(row.data_modified_time),
        id: 'data_modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.data_modified_time, true),
      },
      {
        header: 'Modified By',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.data_modified_by,
        id: 'data_modified_by',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        Cell: ({ row }) => row.original.data_modified_by,
        size: 250,
      },
      {
        header: 'Operation Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.operation_type,
        id: 'operation_type',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        Cell: ({ row }) => getOperationTypeName(row.original.operation_type),
        size: 250,
      },
    ];
  }, []);

  const noResultsText = 'No results found';

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnFilterFns: initialColumnFilterFnState,
      pagination: { pageSize: 15, pageIndex: 0 },
      grouping: ['id'],
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: flattenedHistoryData ?? [],
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
    enableRowVirtualization: false,
    enableColumnVirtualization: false,
    enableGrouping: true,
    enablePagination: true,
    // Other settings
    filterFns: customFilterFunctions,
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
      showProgressBars: historyDataLoading,
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableBodyRowProps: ({ row }) => {
      return {
        component: TableRow,
        'aria-label': `${row.original.id} row`,
      };
    },
    muiTableBodyCellProps: ({ column }) =>
      // The overflow of grouped cells is done manually in the column definition
      (column.id === 'id' && column.getIsGrouped()) ||
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
      displayTableRowCountText(table, flattenedHistoryData, 'History Entries', {
        paddingLeft: '8px',
      }),
  });

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  );
}

export default HistoryEntries;
