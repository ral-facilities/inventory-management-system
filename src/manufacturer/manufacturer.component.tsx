import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  ListItemIcon,
  MenuItem,
  Link as MuiLink,
  TableRow,
  Typography,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
} from 'material-react-table';
import React from 'react';
import { Link } from 'react-router-dom';
import { useManufacturers } from '../api/manufacturer';
import { Manufacturer } from '../app.types';
import DeleteManufacturerDialog from './deleteManufacturerDialog.component';
import ManufacturerDialog from './manufacturerDialog.component';
import { MRT_Localization_EN } from 'material-react-table/locales/en';

function ManufacturerComponent() {
  const { data: ManufacturerData, isLoading: ManufacturerDataLoading } =
    useManufacturers();

  const [deleteManufacturerDialog, setDeleteManufacturerDialog] =
    React.useState<boolean>(false);

  const [selectedManufacturer, setSelectedManufacturer] = React.useState<
    Manufacturer | undefined
  >(undefined);

  const tableHeight = `calc(100vh - (64px + 36px + 111px))`;

  const columns = React.useMemo<MRT_ColumnDef<Manufacturer>[]>(() => {
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        size: 400,
        Cell: ({ row }) =>
          row.original.name && (
            <MuiLink
              underline="hover"
              component={Link}
              to={`/manufacturer/${row.original.id}`}
            >
              {row.original.name}
            </MuiLink>
          ),
        filterVariant: 'autocomplete',
        filterFn: 'equals',
      },
      {
        header: 'URL',
        accessorFn: (row) => row.url ?? '',
        size: 500,
        Cell: ({ row }) =>
          row.original.url && (
            <MuiLink underline="hover" target="_blank" href={row.original.url}>
              {row.original.url}
            </MuiLink>
          ),
      },
      {
        header: 'Address',
        // Stitch together for filtering
        accessorFn: (row) =>
          `${row.address.address_line} ${row.address.town} ${row.address.county} ${row.address.postcode} ${row.address.country}`,
        size: 650,
        Cell: ({ row }) => (
          <div style={{ display: 'inline-block' }}>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.address.address_line}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.address.town}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.address.county}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.address.postcode}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.address.country}
            </Typography>
          </div>
        ),
      },
      {
        header: 'Telephone',
        accessorFn: (row) => row.telephone,
        size: 250,
      },
    ];
  }, []);

  const noResultsTxt =
    'No results found: Try adding an Manufacturer by using the Add Manufacturer button on the top left of your screen';

  const [columnFilters, setColumnFilters] =
    React.useState<MRT_ColumnFiltersState>([]);

  const table = useMaterialReactTable({
    columns: columns, // If dense only show the name column
    data: ManufacturerData ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enablePagination: true,
    manualFiltering: false,
    onColumnFiltersChange: setColumnFilters,
    localization: {
      ...MRT_Localization_EN,
      noRecordsToDisplay: noResultsTxt,
    },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 25, pageIndex: 0 },
    },
    muiTableBodyRowProps: ({ row }) => {
      return { component: TableRow, 'aria-label': `${row.original.name} row` };
    },
    muiTableContainerProps: { sx: { height: tableHeight } },
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined',
    },
    state: {
      columnFilters,
      showProgressBars: ManufacturerDataLoading, //or showSkeletons
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [25, 50, 100],
      shape: 'rounded',
      variant: 'outlined',
    },
    renderCreateRowDialogContent: ({ table }) => {
      return (
        <>
          <ManufacturerDialog
            open={true}
            onClose={() => {
              table.setCreatingRow(null);
            }}
            selectedManufacturer={
              selectedManufacturer ? selectedManufacturer : undefined
            }
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
          Add Manufacturer
        </Button>
        <Button
          startIcon={<ClearIcon />}
          sx={{ mx: '4px' }}
          variant="outlined"
          disabled={columnFilters.length === 0}
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
          key={0}
          aria-label={`Edit ${row.original.name} manufacturer`}
          onClick={() => {
            setSelectedManufacturer(row.original);
            table.setCreatingRow(true);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>,
        <MenuItem
          key={1}
          aria-label={`Delete ${row.original.name} manufacturer`}
          onClick={() => {
            setDeleteManufacturerDialog(true);
            setSelectedManufacturer(row.original);
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>,
      ];
    },
  });

  return (
    <div style={{ width: '100%' }}>
      <MaterialReactTable table={table} />

      <DeleteManufacturerDialog
        open={deleteManufacturerDialog}
        onClose={() => setDeleteManufacturerDialog(false)}
        manufacturer={selectedManufacturer}
      />
    </div>
  );
}
export default ManufacturerComponent;
