import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  capitalize,
  Table,
  TableCellBaseProps,
  TableRow,
  Typography,
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

function HistoryEntries() {
  const { element_id } = useParams();
  const location = useLocation();
  const historyPath = location.pathname.split('/');
  const collection = historyPath[historyPath.length - 3];
  console.log(collection);

  const { data: historyData, isLoading: historyDataLoading } =
    useGetHistoryEntries(collection!, element_id ?? null);

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  //   const [deleteUnitDialog, setDeleteUnitDialog] =
  //     React.useState<boolean>(false);

  //   const [selectedUnit, setSelectedUnit] = React.useState<Unit | undefined>(
  //     undefined
  //   );

  const columns = React.useMemo<MRT_ColumnDef<HistoryEntry>[]>(() => {
    return [
      {
        header: 'Comment',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.data_modified_comment,
        getGroupingValue: (row) => row.id,
        id: 'data_modified_comment',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        Cell: ({ row }) => row.original.data_modified_comment,
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
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: historyData ?? [],
    // Features
    enableColumnOrdering: true,
    enableColumnFilterModes: true,
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
    muiTableBodyRowProps: ({ row }) => {
      return {
        component: TableRow,
        'aria-label': `${row.original.data_modified_comment} row`,
      };
    },
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
    renderDetailPanel: ({ row }) => {
      const fields = row.original.updated_fields;

      // Helper to flatten nested objects (like address) into "key: value" pairs
      const flattenedEntries = Object.entries(fields).flatMap(([key, val]) => {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return Object.entries(val).map(([subKey, subVal]) => [
            `${key}.${subKey}`,
            subVal,
          ]);
        }
        let prevVal;
        const older = historyData?.find(
          (hD) =>
            new Date(hD.data_modified_time) <
              new Date(row.original.data_modified_time) &&
            key in hD.updated_fields
        );
        if (older) {
          prevVal = older.updated_fields[key];
        }
        return [[key, val, prevVal]];
      });

      return (
        <Box
          sx={{
            display: 'grid',
            margin: 'auto',
            gridTemplateColumns: '1fr',
            width: '100%',
          }}
        >
          <Typography mb="xs">Updated Fields Details:</Typography>
          <Table>
            <thead>
              <tr>
                <th>Property</th>
                <th>New Value</th>
                <th>Previous Value</th>
              </tr>
            </thead>
            <tbody>
              {flattenedEntries.map(([key, value, prev]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 500, width: '30%' }}>{key}</td>
                  <td>{value?.toString() ?? 'N/A'}</td>
                  <td>{prev?.toString() ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      );
    },
  });

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  );
}

export default HistoryEntries;
