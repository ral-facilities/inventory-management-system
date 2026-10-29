import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  capitalize,
  Link,
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
import {
  FLEX_CONTAINER_PROPS,
  FLEX_TABLE_CONTAINER_PROP,
  MINIMUM_TABLE_HEIGHT,
} from '../common/consts.tsx';
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
  mrtTheme,
} from '../utils.tsx';
import { useGetHistoryEntries } from '../api/history.tsx';
import { HistoryEntry } from '../api/api.types.tsx';
import { useLocation } from 'react-router';

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

const transformUpdatedFieldValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map((item) => transformUpdatedFieldValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    // Nested objects are flattened into separate rows, but fall back to
    // key: value pairs in case an unexpected shape slips through.
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${transformUpdatedFieldValue(val)}`)
      .join(', ');
  }
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    return formatDateTimeStrings(value, true);
  }
  return String(value);
};

// Recursively unravel nested fields into one leaf per changed value,
// modifies nested field name to `field.nested` (e.g. `address.address_line`)
const flattenUpdatedField = (
  field: string,
  value: unknown
): { updated_field: string; updated_value: unknown }[] => {
  if (
    field.includes('_id') ||
    field == 'modified_time' ||
    field === 'created_time' ||
    field === 'code'
  ) {
    return [];
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([childField, childValue]) =>
      flattenUpdatedField(`${field}.${childField}`, childValue)
    );
  }
  return [{ updated_field: field, updated_value: value }];
};

function HistoryTable() {
  const location = useLocation();
  const historyPath = location.pathname.split('/');
  const collection = historyPath[historyPath.length - 3];
  const entity_id = historyPath[historyPath.length - 2];

  const { data: historyData, isLoading: historyDataLoading } =
    useGetHistoryEntries(collection, entity_id);

  const flattenedHistoryData = React.useMemo<HistoryFieldRow[]>(() => {
    if (!historyData) {
      return [];
    }
    return historyData.flatMap((entry) =>
      Object.entries(entry.updated_fields ?? {}).flatMap(([field, value]) =>
        flattenUpdatedField(field, value).map((leaf) => ({
          ...entry,
          ...leaf,
        }))
      )
    );
  }, [historyData]);

  const columns = React.useMemo<MRT_ColumnDef<HistoryFieldRow>[]>(() => {
    return [
      {
        header: 'Comment',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.entity_modified_comment,
        // Group by ID so 2 changes with the same comment are grouped separately
        getGroupingValue: (row) => row.id,
        id: 'id',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        // When grouped, the comment is shown on the main row via GroupedCell, so
        // hide it on the nested leaf rows; when ungrouped (depth 0) show it here.
        Cell: ({ row }) =>
          row.depth === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <OverflowTip sx={{ fontSize: 'inherit' }}>
                {row.original.entity_modified_comment ?? 'No comment'}
              </OverflowTip>
            </Box>
          ) : null,
        size: 450,
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
                {row.original.entity_modified_comment ?? 'No comment'}
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
        // On the main (grouped) row: show the single change inline, or a
        // click-to-expand count when the entry changed multiple fields.
        AggregatedCell: ({ row }) => {
          const subRows = row.subRows ?? [];
          if (subRows.length === 1) return subRows[0].original.updated_field;
          return (
            <Link
              component="button"
              onClick={() => row.toggleExpanded()}
              sx={{ fontSize: 'inherit' }}
            >
              {subRows.length} changes
            </Link>
          );
        },
        Cell: ({ row }) => row.original.updated_field,
        size: 350,
      },
      {
        header: 'Value',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => transformUpdatedFieldValue(row.updated_value),
        id: 'updated_value',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        AggregatedCell: ({ row }) => {
          const subRows = row.subRows ?? [];
          if (subRows.length === 1)
            return transformUpdatedFieldValue(
              subRows[0].original.updated_value
            );
          return null;
        },
        Cell: ({ row }) =>
          transformUpdatedFieldValue(row.original.updated_value),
        size: 350,
      },

      {
        header: 'Modified Time',
        Header: TableHeaderOverflowTip,
        // Returned as a formatted string so the AggregatedCell renders
        // as MRT does not display aggregated cells for non-string accessor values
        accessorFn: (row) =>
          formatDateTimeStrings(row.entity_modified_time, true),
        id: 'entity_modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        AggregatedCell: ({ row }) =>
          formatDateTimeStrings(row.original.entity_modified_time, true),
        Cell: ({ row }) =>
          row.depth === 0
            ? formatDateTimeStrings(row.original.entity_modified_time, true)
            : null,
      },
      {
        header: 'Modified By',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.entity_modified_by,
        id: 'entity_modified_by',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        AggregatedCell: ({ row }) => row.original.entity_modified_by,
        Cell: ({ row }) =>
          row.depth === 0 ? row.original.entity_modified_by : null,
        size: 350,
      },
      {
        header: 'Operation Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.operation_type,
        id: 'operation_type',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        AggregatedCell: ({ row }) =>
          getOperationTypeName(row.original.operation_type),
        Cell: ({ row }) =>
          row.depth === 0
            ? getOperationTypeName(row.original.operation_type)
            : null,
        size: 250,
      },
    ];
  }, []);

  const noResultsText = 'No results found: Refresh to try again';

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
    paginateExpandedRows: false,
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
    muiTablePaperProps: {
      sx: { ...FLEX_CONTAINER_PROPS, minHeight: MINIMUM_TABLE_HEIGHT },
    },
    muiTableContainerProps: { sx: FLEX_TABLE_CONTAINER_PROP },
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
    // Hide expand toggle for rows with a single sub-row
    muiExpandButtonProps: ({ row }) => ({
      sx: { display: (row.subRows?.length ?? 0) <= 1 ? 'none' : undefined },
    }),
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

export default HistoryTable;
