import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TableRow,
} from '@mui/material';
import { useUnits } from '../../api/units';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { Unit } from '../../app.types';
import { usePreservedTableState } from '../../common/preservedTableState.component';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import {
  displayTableRowCountText,
  formatDateTimeStrings,
  getPageHeightCalc,
} from '../../utils';
import UnitsDialog from './unitsDialog.component.tsx';
import DeleteUnitDialog from './deleteUnitsDialog.component.tsx';

function Units() {
  const { data: unitData, isLoading: unitDataLoading } = useUnits();

  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const [deleteUnitDialog, setDeleteUnitDialog] =
    React.useState<boolean>(false);

  const [selectedUnit, setSelectedUnit] = React.useState<Unit | undefined>(
    undefined
  );

  const columns = React.useMemo<MRT_ColumnDef<Unit>[]>(() => {
    return [
      {
        header: 'Value',
        accessorFn: (row) => row.value,
        id: 'value',
        Cell: ({ row }) => row.original.value,
      },
      {
        header: 'Last modified',
        accessorFn: (row) => new Date(row.modified_time),
        id: 'modified_time',
        filterVariant: 'datetime-range',
        size: 350,
        enableGrouping: false,
        Cell: ({ row }) =>
          row.original.modified_time &&
          formatDateTimeStrings(row.original.modified_time, true),
      },
      {
        header: 'Created',
        accessorFn: (row) => new Date(row.created_time),
        id: 'created_time',
        filterVariant: 'datetime-range',
        size: 350,
        enableGrouping: false,
        enableHiding: true,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.created_time, true),
      },
    ];
  }, []);

  const noResultsTxt =
    'No results found: Try adding a Unit by using the Add Unit button';

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    columns: columns,
    data: unitData ?? [],
    // Features
    enableColumnOrdering: true,
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
      showProgressBars: unitDataLoading, //or showSkeletons
    },
    muiTableBodyRowProps: ({ row }) => {
      return { component: TableRow, 'aria-label': `${row.original.value} row` };
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
          <UnitsDialog
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
          Add Unit
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
          aria-label={`Delete unit ${row.original.value}`}
          onClick={() => {
            closeMenu();
            setDeleteUnitDialog(true);
            setSelectedUnit(row.original);
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
      displayTableRowCountText(
        table.getFilteredRowModel().rows.length,
        unitData?.length ?? 0,
        'Units',
        {
          paddingLeft: '8px',
        }
      ),
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MaterialReactTable table={table} />
      <DeleteUnitDialog
        open={deleteUnitDialog}
        onClose={() => setDeleteUnitDialog(false)}
        unit={selectedUnit}
      />
    </div>
  );
}

export default Units;
