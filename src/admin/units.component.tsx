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
  Typography,
} from '@mui/material';
import { useUnits } from '../api/units';
import {
  MRT_ColumnDef,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { Unit } from '../app.types';
import { usePreservedTableState } from '../common/preservedTableState.component';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { getPageHeightCalc } from '../utils';
import { useNavigate } from 'react-router-dom';
//import DeleteManufacturerDialog from '../manufacturer/deleteManufacturerDialog.component';
import Breadcrumbs from '../view/breadcrumbs.component';

function Units() {
  const { data: unitData, isLoading: unitDataLoading } = useUnits();

  const tableHeight = getPageHeightCalc('192px');

  const columns = React.useMemo<MRT_ColumnDef<Unit>[]>(() => {
    return [
      {
        header: 'Value',
        accessorFn: (row) => row.value,
        id: 'value',
        Cell: ({ row }) => row.original.value,
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
    enableColumnResizing: true,
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
          <Typography>Unit dialog</Typography>
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
    renderRowActionMenuItems: ({ row }) => {
      return [
        <MenuItem
          key="delete"
          aria-label={`Delete unit ${row.original.value}`}
          onClick={() => {
            //open unit delete dialog
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>,
      ];
    },
  });

  const navigate = useNavigate();
  const onChangeNode = React.useCallback(() => {
    navigate('/adminPage');
  }, [navigate]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Box
        sx={{
          py: '20px',
          paddingLeft: '4px',
        }}
      >
        <Breadcrumbs
          onChangeNode={onChangeNode}
          onChangeNavigateHome={onChangeNode}
          breadcrumbsInfo={undefined}
          navigateHomeAriaLabel="navigate to admin page"
        />
      </Box>
      <MaterialReactTable table={table} />
      {/* <DeleteManufacturerDialog
        open={deleteManufacturerDialog}
        onClose={() => setDeleteManufacturerDialog(false)}
        manufacturer={selectedManufacturer}
      /> */}
    </div>
  );

  return <Typography>Units</Typography>;
}

export default Units;
