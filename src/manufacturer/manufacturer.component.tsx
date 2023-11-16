import {
  Box,
  Link as MuiLink,
  Button,
  MenuItem,
  ListItemIcon,
  Typography,
  TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import { useManufacturers } from '../api/manufacturer';
import DeleteManufacturerDialog from './deleteManufacturerDialog.component';
import { Manufacturer } from '../app.types';
import ManufacturerDialog from './manufacturerDialog.component';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';

function ManufacturerComponent() {
  const [manufacturer, setManufacturer] = React.useState<Manufacturer>({
    name: '',
    url: undefined,
    address: {
      building_number: '',
      street_name: '',
      town: '',
      county: '',
      postcode: '',
    },
    telephone: '',
  });

  const [editManufacturerDialogOpen, setEditManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const [addManufacturerDialogOpen, setAddManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const { data: ManufacturerData, isLoading: ManufacturerDataLoading } =
    useManufacturers();

  const [deleteManufacturerDialog, setDeleteManufacturerDialog] =
    React.useState<boolean>(false);

  const [selectedManufacturer, setSelectedManufacturer] = React.useState<
    Manufacturer | undefined
  >(undefined);

  const tableHeight = `calc(100vh - (64px + 36px + 50px + 172px))`;

  const columns = React.useMemo<MRT_ColumnDef<Manufacturer>[]>(() => {
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        size: 400,
        filterVariant: 'autocomplete',
        filterFn: 'equals',
      },
      {
        header: 'URL',
        accessorFn: (row) => row.url,
        size: 500,
        Cell: ({ row }) => (
          <MuiLink underline="hover" target="_blank" href={row.original.url}>
            {row.original.url}
          </MuiLink>
        ),
      },
      {
        header: 'Address',
        accessorFn: (row) => row.address,
        size: 650,
        Cell: ({ row }) => (
          <div style={{ display: 'inline-block' }}>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.address.building_number}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>
              {row.original.address.street_name}
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

  const table = useMaterialReactTable({
    columns: columns, // If dense only show the name column
    data: ManufacturerData ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableFacetedValues: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableRowSelection: false,
    enableFullScreenToggle: false,
    enablePagination: true,
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
      showProgressBars: ManufacturerDataLoading, //or showSkeletons
    },
    muiPaginationProps: {
      color: 'secondary',
      rowsPerPageOptions: [25, 50, 100],
      shape: 'rounded',
      variant: 'outlined',
    },
    renderRowActionMenuItems: ({ closeMenu, row }) => {
      return [
        <MenuItem
          key={0}
          aria-label={`Edit ${row.original.name} manufacturer`}
          onClick={() => {
            setEditManufacturerDialogOpen(true);
            setSelectedManufacturer(row.original);
            setManufacturer(row.original);
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'right',
          padding: '9.75px', //px to match width of catalogue page
          margin: '4px',
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setAddManufacturerDialogOpen(true)}
        >
          Add Manufacturer
        </Button>
      </Box>
      <MaterialReactTable table={table} />
      <ManufacturerDialog
        open={addManufacturerDialogOpen}
        onClose={() => setAddManufacturerDialogOpen(false)}
        manufacturer={manufacturer}
        onChangeManufacturerDetails={setManufacturer}
        type="create"
      />
      <ManufacturerDialog
        open={editManufacturerDialogOpen}
        onClose={() => setEditManufacturerDialogOpen(false)}
        manufacturer={manufacturer}
        onChangeManufacturerDetails={setManufacturer}
        type="edit"
        selectedManufacturer={selectedManufacturer}
      />

      <DeleteManufacturerDialog
        open={deleteManufacturerDialog}
        onClose={() => setDeleteManufacturerDialog(false)}
        manufacturer={selectedManufacturer}
      />
    </div>
  );
}

export default ManufacturerComponent;
