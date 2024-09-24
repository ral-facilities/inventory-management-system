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
  getFilterVariant,
  TableBodyCellOverFlowTip,
  customFilterFunctions,
  TableCellOverFlowTipProps,
  showSeconds,
  displayTableRowCountText,
  getFilterMenu,
  formatDateTimeStrings,
  getPageHeightCalc,
  getCustomFilterFunctions,
  removeSecondsFromDate,
  ColumnFilterEntries,
  getFilterLabel,
} from '../../utils.tsx';
import DeleteUsageStatusDialog from './deleteUsageStatusDialog.component.tsx';
import UsageStatusDialog from './usageStatusDialog.component.tsx';

function UsageStatuses() {
  const { data: usageStatusData, isLoading: usageStatusDataLoading } =
    useGetUsageStatuses();

  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const [filterFunctionState, setfilterFunctionState] = React.useState<
    Record<string, ColumnFilterEntries>
  >({
    modified_time: {
      filterName: 'betweenInclusive',
      filterVariant: 'datetime-range',
      filterLabel: 'Between',
    },
    created_time: {
      filterName: 'betweenInclusive',
      filterVariant: 'datetime-range',
      filterLabel: 'Between',
    },
  });

  const filterFunctionStorage = React.useMemo<
    Record<string, ColumnFilterEntries[]>
  >(() => {
    return {
      modified_time: [
        {
          filterName: 'betweenInclusive',
          filterVariant: 'datetime-range',
          filterLabel: 'Between',
        },
        {
          filterName: 'equalsDate',
          filterVariant: getFilterVariant('equalsDate', customFilterFunctions),
          filterLabel: getFilterLabel('equalsDate', customFilterFunctions),
        },
        {
          filterName: 'beforeInclusiveDateTime',
          filterVariant: 'datetime',
          filterLabel: 'Before',
        },
        {
          filterName: 'greaterThanOrEqualTo',
          filterVariant: 'datetime',
          filterLabel: 'After',
        },
      ],
      created_time: [
        {
          filterName: 'betweenInclusive',
          filterVariant: 'datetime-range',
          filterLabel: 'Between',
        },
        {
          filterName: 'equalsDate',
          filterVariant: getFilterVariant('equalsDate', customFilterFunctions),
          filterLabel: getFilterLabel('equalsDate', customFilterFunctions),
        },
        {
          filterName: 'beforeInclusiveDateTime',
          filterVariant: 'datetime',
          filterLabel: 'Before',
        },
        {
          filterName: 'greaterThanOrEqualTo',
          filterVariant: 'datetime',
          filterLabel: 'After',
        },
      ],
    };
  }, []);

  const customFiltersLocalization: Record<string, string> = Object.keys(
    filterFunctionStorage
  ).reduce(
    (acc, key) => {
      filterFunctionStorage[key].forEach((filterEntry) => {
        const indexString =
          'filter' +
          filterEntry.filterName.charAt(0).toUpperCase() +
          filterEntry.filterName.slice(1);

        acc[indexString] = filterEntry.filterLabel;
      });
      return acc;
    },
    {} as Record<string, string>
  );

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
        filterVariant: 'text',
        enableColumnFilterModes: false,
        id: 'value',
        Cell: ({ row }) => row.original.value,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => removeSecondsFromDate(row.modified_time),
        filterVariant: filterFunctionState['modified_time']['filterVariant'],
        filterFn: filterFunctionState['modified_time']['filterName'],
        id: 'modified_time',
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode, table }) =>
          getFilterMenu({
            onSelectFilterMode: onSelectFilterMode,
            selectedFilters: filterFunctionStorage['modified_time'],
            table: table.getColumn('modified_time'),
          }),
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(
            row.original.modified_time,
            showSeconds(filterFunctionState['modified_time']['filterVariant'])
          ),
      },
      {
        header: 'Created',
        accessorFn: (row) => removeSecondsFromDate(row.created_time),
        id: 'created_time',
        filterVariant: filterFunctionState['created_time']['filterVariant'],
        filterFn: filterFunctionState['created_time']['filterName'],
        renderColumnFilterModeMenuItems: ({ onSelectFilterMode, table }) => {
          return getFilterMenu({
            onSelectFilterMode: onSelectFilterMode,
            selectedFilters: filterFunctionStorage['created_time'],
            table: table.getColumn('created_time'),
          });
        },
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) =>
          formatDateTimeStrings(
            row.original.created_time,
            showSeconds(filterFunctionState['created_time']['filterVariant'])
          ),
      },
    ];
  }, [filterFunctionState, filterFunctionStorage]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentFilterMode: Record<string, any> = {};
  let changed = false;
  for (const key in filterFunctionState) {
    currentFilterMode[key] = currentFilterMode[key] || {};
    currentFilterMode[key]['filterName'] = Object(
      columns.find((column) => column.id == key)
    )._filterFn;
    currentFilterMode[key]['filterVariant'] = filterFunctionStorage[key].find(
      (filter) => filter.filterName == currentFilterMode[key]['filterName']
    )?.filterVariant;
    currentFilterMode[key]['filterLabel'] = filterFunctionStorage[key].find(
      (filter) => filter.filterName == currentFilterMode[key]['filterName']
    )?.filterLabel;
    if (
      currentFilterMode[key]['filterName'] != undefined &&
      (filterFunctionState[key]['filterName'] !=
        currentFilterMode[key]['filterName'] ||
        filterFunctionState[key]['filterVariant'] !=
          currentFilterMode[key]['filterVariant'])
    ) {
      changed = true;
    }
  }
  if (changed) {
    setfilterFunctionState({
      modified_time: {
        filterName: currentFilterMode['modified_time']['filterName'],
        filterVariant: currentFilterMode['modified_time']['filterVariant'],
        filterLabel: currentFilterMode['modified_time']['filterLabel'],
      },
      created_time: {
        filterName: currentFilterMode['created_time']['filterName'],
        filterVariant: currentFilterMode['created_time']['filterVariant'],
        filterLabel: currentFilterMode['created_time']['filterLabel'],
      },
    });
  }

  const noResultsTxt =
    'No results found: Try adding a Usage Status by using the Add Usage Status button';

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    storeInUrl: true,
  });

  console.dir(getCustomFilterFunctions(customFilterFunctions), { depth: null });

  const table = useMaterialReactTable({
    columns: columns,
    data: usageStatusData ?? [],
    // Features
    filterFns: getCustomFilterFunctions(customFilterFunctions),
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
      ...customFiltersLocalization,
      noRecordsToDisplay: noResultsTxt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
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
