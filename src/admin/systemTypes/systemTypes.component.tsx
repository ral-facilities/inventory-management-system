import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, TableCellBaseProps, TableRow } from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import type { SystemType } from '../../api/api.types';
import { useGetSystemTypes } from '../../api/systems';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableHeaderOverflowTip,
  customFilterFunctions,
  displayTableRowCountText,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
} from '../../utils';

function SystemTypes() {
  const { data: systemTypesData, isLoading: systemTypesDataLoading } =
    useGetSystemTypes();

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const columns = React.useMemo<MRT_ColumnDef<SystemType>[]>(() => {
    return [
      {
        header: 'Value',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.value,
        id: 'value',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        Cell: ({ row }) => row.original.value,
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
    data: systemTypesData ?? [],
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
      showProgressBars: systemTypesDataLoading, //or showSkeletons
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableBodyRowProps: ({ row }) => {
      return { component: TableRow, 'aria-label': `${row.original.value} row` };
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
    // Functions
    ...onPreservedStatesChange,

    renderTopToolbarCustomActions: ({ table }) => (
      <Box>
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
      </Box>
    ),

    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, systemTypesData, 'System Types', {
        paddingLeft: '8px',
      }),
  });

  return <MaterialReactTable table={table} />;
}

export default SystemTypes;
