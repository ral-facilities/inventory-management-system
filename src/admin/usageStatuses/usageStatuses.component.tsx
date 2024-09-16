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
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  displayTableRowCountText,
  filterFunctionsRendering,
  formatDateTimeStrings,
  getPageHeightCalc,
  getCustomFilterFunctions,
  removeSecondsFromDate,
} from '../../utils.tsx';
import DeleteUsageStatusDialog from './deleteUsageStatusDialog.component.tsx';
import UsageStatusDialog from './usageStatusDialog.component.tsx';

function UsageStatuses() {
  const [isEquals, setIsEquals] = React.useState<boolean>(false);

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
        filterVariant: 'multi-select',
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) =>
          filterFunctionsRendering({
            onSelectFilterMode: onSelectFilterMode,
            selectedFilters: ['filterInclude', 'filterExclude'],
          }),
        id: 'value',
        Cell: ({ row }) => row.original.value,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => {
          return removeSecondsFromDate(row.modified_time);
        },
        filterVariant: isEquals ? 'date' : 'datetime',
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode }) =>
          filterFunctionsRendering({
            onSelectFilterMode: onSelectFilterMode,
            selectedFilters: ['betweenInclusive', 'equalsDate'],
          }),
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          row.original.modified_time && isEquals
            ? formatDateTimeStrings(row.original.modified_time, false)
            : formatDateTimeStrings(row.original.modified_time, true),
      },
      {
        header: 'Created',
        accessorFn: (row) => {
          return removeSecondsFromDate(row.created_time);
        },
        id: 'created_time',
        filterVariant: 'datetime-range',
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.created_time, true),
      },
    ];
  }, [isEquals]);

  const current_mode = Object(columns[1].filterFn).name;

  if (current_mode == 'FilterFunction' && isEquals == false) {
    setIsEquals(true);
  } else if (current_mode == 'betweenInclusive' && isEquals == true) {
    setIsEquals(false);
  }

  const noResultsTxt =
    'No results found: Try adding a Usage Status by using the Add Usage Status button';

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: usageStatusData ?? [],
    // Features
    filterFns: getCustomFilterFunctions(),
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
