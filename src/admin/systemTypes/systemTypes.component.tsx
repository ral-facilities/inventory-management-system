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
import { useGetSparesDefinition } from '../../api/settings';
import { useGetSystemTypes } from '../../api/systems';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import {
  COLUMN_FILTER_BOOLEAN_OPTIONS,
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

interface TableRowData extends SystemType {
  isSpare: boolean;
}

function SystemTypes() {
  const { data: systemTypesData, isLoading: isLoadingSystemTypes } =
    useGetSystemTypes();

  const { data: sparesDefinition, isLoading: isLoadingSparesDefinition } =
    useGetSparesDefinition();

  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  const isLoading = isLoadingSystemTypes || isLoadingSparesDefinition;
  //Once loading finished - use same logic as catalogueItemsTable to pair up data
  React.useEffect(() => {
    if (!isLoading && systemTypesData) {
      setTableRows(
        systemTypesData.map((type) => ({
          ...type,
          isSpare:
            sparesDefinition?.system_types.some(
              (defType) => defType.id === type.id
            ) ?? false,
        }))
      );
    }
  }, [systemTypesData, isLoading, sparesDefinition]);

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const columns = React.useMemo<MRT_ColumnDef<TableRowData>[]>(() => {
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
      {
        header: 'Is Spare',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => (row.isSpare === true ? 'Yes' : 'No'),
        id: 'isSpare',
        filterVariant: COLUMN_FILTER_VARIANTS.boolean,
        enableColumnFilterModes: false,
        size: 200,
        filterSelectOptions: COLUMN_FILTER_BOOLEAN_OPTIONS,
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
    data: tableRows ?? [],
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
      showProgressBars: isLoadingSystemTypes, //or showSkeletons
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

    renderTopToolbarCustomActions: ({ table }) => {
      function isExactFilterActive(
        expectedFilters: { id: string; filterFn?: string; value: string }[]
      ) {
        const actualFilters = table.getState().columnFilters;
        const actualFilterFns = table.getState().columnFilterFns;

        // Check length matches
        if (actualFilters.length !== expectedFilters.length) return false;

        // Check every expected filter matches actual filter and filterFn
        return expectedFilters.every(({ id, filterFn, value }) => {
          const actualFilter = actualFilters.find((f) => f.id === id);
          if (!actualFilter) return false;
          if (actualFilterFns[id] !== filterFn) return false;
          // Compare values stringified (arrays)

          return JSON.stringify(actualFilter.value) === JSON.stringify(value);
        });
      }
      return (
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

          <Button
            sx={{ mx: 0.5 }}
            variant="outlined"
            disabled={isExactFilterActive([
              {
                id: 'isSpare',
                value: COLUMN_FILTER_BOOLEAN_OPTIONS[0],
              },
            ])}
            onClick={() => {
              table.resetGlobalFilter();
              table.setColumnFilters([
                {
                  id: 'isSpare',
                  value: COLUMN_FILTER_BOOLEAN_OPTIONS[0],
                },
              ]);
            }}
          >
            Spares Definition
          </Button>
        </Box>
      );
    },

    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, systemTypesData, 'System Types', {
        paddingLeft: '8px',
      }),
  });

  return <MaterialReactTable table={table} />;
}

export default SystemTypes;
