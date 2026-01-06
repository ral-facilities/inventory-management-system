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

import { APISettingsContext } from '../../apiConfigProvider.component';
import MRTTopTableAlert from '../../common/mrtTopTableAlert.component';
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
  isExactFilterActive,
  mrtTheme,
} from '../../utils';

interface TableRowData extends SystemType {
  isSpare: boolean;
}

function SystemTypes() {
  const { data: systemTypesData = [], isLoading: isLoadingSystemTypes } =
    useGetSystemTypes();

  const apiSettings = React.useContext(APISettingsContext);
  const sparesDefinition = apiSettings?.spares?.sparesDefinition;

  const [tableRows, setTableRows] = React.useState<TableRowData[]>([]);

  const isLoading = isLoadingSystemTypes;
  //Once loading finished - use same logic as catalogueItemsTable to pair up data
  React.useEffect(() => {
    if (!isLoading && systemTypesData) {
      setTableRows(
        systemTypesData.map((type) => ({
          ...type,
          isSpare: !sparesDefinition
            ? false
            : sparesDefinition.system_types.some((def) => def.id === type.id),
        }))
      );
    }
  }, [systemTypesData, isLoading, sparesDefinition]);

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
        header: 'Description',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.description,
        id: 'description',
        enableColumnFilterModes: false,
      },
      {
        header: 'Used For Spares',
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
    muiTableContainerProps: ({ table }) => {
      const isSparesFilterApplied = isExactFilterActive(table, [
        {
          id: 'isSpare',
          value: COLUMN_FILTER_BOOLEAN_OPTIONS[0],
        },
      ]);
      return {
        sx: {
          height: getPageHeightCalc(
            // Breadcrumbs + Mui table V2 + extra
            `50px + 110px + 48px  ${isSparesFilterApplied ? ' + 54px' : ''}`
          ),
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
    // Functions
    ...onPreservedStatesChange,

    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Box>
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

          <Button
            sx={{ mx: 0.5 }}
            variant="outlined"
            disabled={isExactFilterActive(table, [
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
            Show Spares Definition
          </Button>
        </Box>
      );
    },

    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, systemTypesData, 'System Types', {
        paddingLeft: '8px',
      }),
  });

  return (
    <div style={{ width: '100%' }}>
      {isExactFilterActive(table, [
        {
          id: 'isSpare',
          value: COLUMN_FILTER_BOOLEAN_OPTIONS[0],
        },
      ]) && (
        <MRTTopTableAlert
          title="Spares Definition Filter Applied"
          clearFilters={table.resetColumnFilters}
          clearFiltersAriaLabel="Clear Spares Definition Filter"
          showInfoTooltip
          infoTooltipTitle="Items contained in the system types displayed in this table are classified as spares"
        />
      )}
      <MaterialReactTable table={table} />
    </div>
  );
}

export default SystemTypes;
