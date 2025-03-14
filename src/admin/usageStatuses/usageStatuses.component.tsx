import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
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
import { UsageStatus } from '../../api/api.types.tsx';
import { useGetUsageStatuses } from '../../api/usageStatuses.tsx';
import { usePreservedTableState } from '../../common/preservedTableState.component.tsx';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  displayTableRowCountText,
  formatDateTimeStrings,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
} from '../../utils.tsx';
import DeleteUsageStatusDialog from './deleteUsageStatusDialog.component.tsx';
import UsageStatusDialog from './usageStatusDialog.component.tsx';

function UsageStatuses() {
  const { data: usageStatusData, isLoading: usageStatusDataLoading } =
    useGetUsageStatuses();

  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const [deleteUsageStatusDialog, setDeleteUsageStatusDialog] =
    React.useState<boolean>(false);

  const [selectedUsageStatus, setSelectedUsageStatus] = React.useState<
    UsageStatus | undefined
  >(undefined);

  const columns = React.useMemo<MRT_ColumnDef<UsageStatus>[]>(() => {
    return [
      {
        header: 'Value',
        accessorFn: (row) => row.value,
        id: 'value',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.modified_time, true),
      },
      {
        header: 'Created',
        accessorFn: (row) => new Date(row.created_time),
        id: 'created_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.created_time, true),
      },
    ];
  }, []);

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const noResultsTxt =
    'No results found: Try adding a Usage Status by using the Add Usage Status button';

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 15, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: usageStatusData ?? [],
    // Features
    enableColumnOrdering: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    // Other settings
    manualFiltering: false,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    autoResetPageIndex: false,
    // Localisation
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsTxt,
    },
    // State
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
    state: {
      ...preservedState,
      showProgressBars: usageStatusDataLoading, //or showSkeletons
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
    renderCreateRowDialogContent: () => {
      return (
        <>
          <UsageStatusDialog
            open={true}
            onClose={() => {
              table.setCreatingRow(null);
            }}
          />
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box>
        <Button
          startIcon={<AddIcon />}
          sx={{ mx: '4px' }}
          variant="outlined"
          onClick={() => {
            table.setCreatingRow(true);
          }}
        >
          Add Usage Status
        </Button>
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
    renderRowActionMenuItems: ({ closeMenu, row }) => {
      return [
        <MenuItem
          key={'delete'}
          aria-label={`Delete usage status ${row.original.value}`}
          onClick={() => {
            closeMenu();
            setDeleteUsageStatusDialog(true);
            setSelectedUsageStatus(row.original);
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>,
      ];
    },
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, usageStatusData, 'Usage Statuses', {
        paddingLeft: '8px',
      }),
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MaterialReactTable table={table} />
      <DeleteUsageStatusDialog
        open={deleteUsageStatusDialog}
        onClose={() => setDeleteUsageStatusDialog(false)}
        usageStatus={selectedUsageStatus}
      />
    </div>
  );
}

export default UsageStatuses;
