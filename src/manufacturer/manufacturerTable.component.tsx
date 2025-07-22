import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Link as MuiLink,
  TableCellBaseProps,
  TableRow,
  Typography,
} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link } from 'react-router';
import { Manufacturer } from '../api/api.types';
import { useGetManufacturers } from '../api/manufacturers';
import { usePreservedTableState } from '../common/preservedTableState.component';
import { RequestType } from '../form.schemas';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  OPTIONAL_FILTER_MODE_OPTIONS,
  TableBodyCellOverFlowTip,
  TableCellOverFlowTipProps,
  TableHeaderOverflowTip,
  displayTableRowCountText,
  formatDateTimeStrings,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  mrtTheme,
} from '../utils';
import DeleteManufacturerDialog from './deleteManufacturerDialog.component';
import ManufacturerDialog from './manufacturerDialog.component';

function ManufacturerTable() {
  const { data: manufacturerData, isLoading: manufacturerDataLoading } =
    useGetManufacturers();

  const [deleteManufacturerDialog, setDeleteManufacturerDialog] =
    React.useState<boolean>(false);

  const [selectedManufacturer, setSelectedManufacturer] = React.useState<
    Manufacturer | undefined
  >(undefined);

  const tableHeight = getPageHeightCalc('50px + 110px + 48px');

  const [manufacturerDialogType, setManufacturerDialogType] =
    React.useState<RequestType>('post');

  const columns = React.useMemo<MRT_ColumnDef<Manufacturer>[]>(() => {
    return [
      {
        header: 'Name',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.name,
        id: 'name',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 400,
        Cell: ({ row }) => (
          <MuiLink
            underline="hover"
            component={Link}
            to={`/manufacturers/${row.original.id}`}
          >
            {row.original.name}
          </MuiLink>
        ),
      },
      {
        header: 'Last modified',
        Header: TableHeaderOverflowTip,
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
        Header: TableHeaderOverflowTip,
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
      {
        header: 'URL',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.url ?? '',
        id: 'url',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
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
        Header: TableHeaderOverflowTip,
        // Stitch together for filtering
        accessorFn: (row) =>
          `${row.address.address_line} ${row.address.town} ${row.address.county} ${row.address.postcode} ${row.address.country}`,
        id: 'address',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,

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
        header: 'Telephone number',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.telephone,
        id: 'telephone',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 250,
      },
    ];
  }, []);

  const noResultsTxt =
    'No results found: Try adding an Manufacturer by using the Add Manufacturer button on the top left of your screen';

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: { created_time: false },
      pagination: { pageSize: 15, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: true,
  });

  const table = useMaterialReactTable({
    // Data
    columns: columns, // If dense only show the name column
    data: manufacturerData ?? [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    // Features
    enableColumnOrdering: true,
    enableColumnFilterModes: true,
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
      showProgressBars: manufacturerDataLoading, //or showSkeletons
    },
    //MRT
    mrtTheme,
    //MUI
    muiTableBodyRowProps: ({ row }) => {
      return { component: TableRow, 'aria-label': `${row.original.name} row` };
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
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },
    // Functions
    ...onPreservedStatesChange,
    renderCreateRowDialogContent: ({ table }) => {
      return (
        <>
          <ManufacturerDialog
            open={true}
            onClose={() => {
              setManufacturerDialogType('post');
              table.setCreatingRow(null);
            }}
            type={manufacturerDialogType}
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
          key="edit"
          aria-label={`Edit manufacturer ${row.original.name}`}
          onClick={() => {
            setManufacturerDialogType('patch');
            setSelectedManufacturer(row.original);
            table.setCreatingRow(true);
            closeMenu();
          }}
          sx={{ m: 0 }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>,
        <MenuItem
          key="delete"
          aria-label={`Delete manufacturer ${row.original.name}`}
          onClick={() => {
            setDeleteManufacturerDialog(true);
            setSelectedManufacturer(row.original);
            closeMenu();
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
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(table, manufacturerData, 'Manufacturers', {
        paddingLeft: '8px',
      }),
  });

  return (
    <>
      <MaterialReactTable table={table} />
      <DeleteManufacturerDialog
        open={deleteManufacturerDialog}
        onClose={() => setDeleteManufacturerDialog(false)}
        manufacturer={selectedManufacturer}
      />
    </>
  );
}
export default ManufacturerTable;
