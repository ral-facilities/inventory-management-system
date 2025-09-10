import ClearIcon from '@mui/icons-material/Clear';
import { Box, Button, MenuItem, TableCellBaseProps } from '@mui/material';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import React from 'react';
import type { Rule } from '../../api/api.types';
import { useGetRules } from '../../api/rules';
import { useGetSystemTypes } from '../../api/systems';
import { useGetUsageStatuses } from '../../api/usageStatuses';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import {
  MRT_Functions_Localisation,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableHeaderOverflowTip,
  customFilterFunctions,
  displayTableRowCountText,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
} from '../../utils';

function Rules() {
  const { data: rulesData, isLoading: isLoadingRules } = useGetRules();
  const { data: systemTypesData, isLoading: isLoadingSystemTypes } =
    useGetSystemTypes();

  const { data: usageStatusData, isLoading: isLoadingUsageStatus } =
    useGetUsageStatuses();

  const isLoading =
    isLoadingRules || isLoadingSystemTypes || isLoadingUsageStatus;

  // Breadcrumbs + Mui table V2 + extra
  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const columns = React.useMemo<MRT_ColumnDef<Rule>[]>(() => {
    const systemTypeValues = systemTypesData?.map((type) => type.value);
    const usageStatusValues = usageStatusData?.map((val) => val.value);
    return [
      {
        header: 'Source System Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.src_system_type?.value,
        id: 'src_system_type.value',
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
        filterSelectOptions: systemTypeValues,
      },
      {
        header: 'Destination System Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.dst_system_type?.value,
        id: 'dst_system_type.value',
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
        filterSelectOptions: systemTypeValues,
      },
      {
        header: 'Destination Usage Status',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.dst_usage_status?.value,
        id: 'dst_usage_status.value',
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
    ];
  }, [systemTypesData, usageStatusData]);

  const noResultsText = 'No rules found';

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
    data: rulesData ?? [],
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
    // Functions
    ...onPreservedStatesChange,

    renderTopToolbarCustomActions: ({ table }) => {
      const allSystemTypeValues =
        systemTypesData?.map((type) => type.value) ?? [];

      function isExactFilterActive(
        expectedFilters: { id: string; filterFn: string; value: string[] }[]
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
            disabled={isExactFilterActive([
              {
                id: 'src_system_type.value',
                filterFn: 'arrExcludesSome',
                value: allSystemTypeValues,
              },
            ])}
            onClick={() => {
              table.resetGlobalFilter();
              table.setColumnFilterFns((prev) => ({
                ...prev,
                'src_system_type.value': 'arrExcludesSome',
              }));
              table.setColumnFilters([
                {
                  id: 'src_system_type.value',
                  value: allSystemTypeValues,
                },
              ]);
            }}
          >
            Show Creation Rules
          </Button>

          <Button
            sx={{ mx: 0.5 }}
            variant="outlined"
            disabled={isExactFilterActive([
              {
                id: 'src_system_type.value',
                filterFn: 'arrIncludesSome',
                value: allSystemTypeValues,
              },
              {
                id: 'dst_system_type.value',
                filterFn: 'arrIncludesSome',
                value: allSystemTypeValues,
              },
            ])}
            onClick={() => {
              table.resetGlobalFilter();
              table.setColumnFilterFns((prev) => ({
                ...prev,
                'src_system_type.value': 'arrIncludesSome',
                'dst_system_type.value': 'arrIncludesSome',
              }));
              table.setColumnFilters([
                {
                  id: 'src_system_type.value',
                  value: allSystemTypeValues,
                },
                {
                  id: 'dst_system_type.value',
                  value: allSystemTypeValues,
                },
              ]);
            }}
          >
            Show Moving Rules
          </Button>

          <Button
            sx={{ mx: 0.5 }}
            variant="outlined"
            disabled={isExactFilterActive([
              {
                id: 'dst_system_type.value',
                filterFn: 'arrExcludesSome',
                value: allSystemTypeValues,
              },
            ])}
            onClick={() => {
              table.resetGlobalFilter();
              table.setColumnFilterFns((prev) => ({
                ...prev,
                'dst_system_type.value': 'arrExcludesSome',
              }));
              table.setColumnFilters([
                {
                  id: 'dst_system_type.value',
                  value: allSystemTypeValues,
                },
              ]);
            }}
          >
            Show Deletion Rules
          </Button>
        </Box>
      );
    },

    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, rulesData, 'Rules', {
        paddingLeft: '8px',
      }),
  });

  return <MaterialReactTable table={table} />;
}

export default Rules;
