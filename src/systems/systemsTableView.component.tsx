import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  MenuItem,
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
import { System } from '../api/api.types';
import { useGetSystemTypes } from '../api/systems';
import type { SystemTableType } from '../app.types';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  MRT_Functions_Localisation,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableHeaderOverflowTip,
  customFilterFunctions,
  formatDateTimeStrings,
  mrtTheme,
} from '../utils';
import SystemDialog from './systemDialog.component';

export interface SystemsTableViewProps {
  systemsData?: System[];
  systemsDataLoading: boolean;
  systemParentId?: string;
  onChangeParentId: (systemId: string | null) => void;
  isSystemSelectable?: (system: System) => boolean;
  selectedSystems: System[];
  type: 'moveTo' | 'copyTo';
}

export const SystemsTableView = (props: SystemsTableViewProps) => {
  const {
    systemsData,
    systemsDataLoading,
    systemParentId,
    onChangeParentId,
    selectedSystems,
    isSystemSelectable,
    type,
  } = props;

  const selectedSystemIds: string[] = React.useMemo(
    () => selectedSystems.map((system) => system.id),
    [selectedSystems]
  );

  const { data: systemTypesData, isLoading: systemTypesLoading } =
    useGetSystemTypes();

  const isLoading = systemsDataLoading || systemTypesLoading;
  const [tableRows, setTableRows] = React.useState<SystemTableType[]>([]);

  React.useEffect(() => {
    if (!isLoading && systemsData) {
      setTableRows(
        systemsData.map((system) => ({
          ...system,
          type: systemTypesData?.find((type) => type.id === system.type_id),
        }))
      );
    }
    //Purposefully leave out systemTypesList from dependencies for same reasons as catalogueItemsTable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemsData, isLoading]);

  const noResultsText = 'No systems found';
  const columns = React.useMemo<MRT_ColumnDef<SystemTableType>[]>(
    () => [
      {
        header: 'Name',
        id: 'name',
        accessorKey: 'name',
        size: 400,
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
      },
      {
        header: 'Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.type?.value,
        id: 'type',
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
        Cell: ({ row }) => {
          return (
            <>
              {systemTypesData?.find((type) => type.id === row.original.type_id)
                ?.value ?? ''}
            </>
          );
        },
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 400,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.modified_time, true),
      },
    ],
    [systemTypesData]
  );
  const table = useMaterialReactTable({
    // Data
    columns: columns,
    data: tableRows ?? [],
    // Features
    enableColumnOrdering: false,
    enableColumnFilterModes: true,
    enableColumnPinning: false,
    enableTopToolbar: true,
    enableColumnResizing: false,
    enableFacetedValues: true,
    enableRowActions: false,
    enableGlobalFilter: false,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableColumnFilters: true,
    enableHiding: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    filterFns: customFilterFunctions,
    // Other settings
    autoResetPageIndex: false,
    paginationDisplayMode: 'pages',
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
      pagination: { pageSize: 5, pageIndex: 0 },
    },
    state: {
      showProgressBars: systemsDataLoading,
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableBodyRowProps: ({ row }) => {
      const canPlaceHere =
        (type === 'copyTo' || !selectedSystemIds.includes(row.original.id)) &&
        (isSystemSelectable ? isSystemSelectable(row.original) : true);

      return {
        component: TableRow,
        onClick: () => canPlaceHere && onChangeParentId(row.original.id),
        'aria-label': `${row.original.name} row`,
        style: {
          cursor: canPlaceHere ? 'pointer' : 'not-allowed',
        },
      };
    },
    muiTableBodyCellProps: ({ column, row }) =>
      // Ignore MRT rendered cells e.g. expand , spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              const canPlaceHere =
                (type === 'copyTo' ||
                  !selectedSystemIds.includes(row.original.id)) &&
                (isSystemSelectable ? isSystemSelectable(row.original) : true);
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                    overFlowTipSx: {
                      width: '25vw',
                      color: canPlaceHere ? 'inherit' : 'text.secondary',
                    },
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },
    muiTableContainerProps: { sx: { height: '360.4px' } },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [5],
      shape: 'rounded',
      variant: 'outlined',
    },
    //Functions
    renderCreateRowDialogContent: ({ table }) => {
      return (
        <>
          <SystemDialog
            open
            onClose={() => table.setCreatingRow(null)}
            parentId={systemParentId}
            requestType="post"
          />
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
        <Button
          startIcon={<AddIcon />}
          sx={{ mx: 0.5 }}
          variant="outlined"
          onClick={() => {
            table.setCreatingRow(true);
          }}
        >
          Add System
        </Button>
      </Box>
    ),
  });

  return <MaterialReactTable table={table} />;
};
