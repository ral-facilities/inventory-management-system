import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Link as MuiLink,
  Tooltip,
  Typography,
  type TableCellBaseProps,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_RowSelectionState,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import React from 'react';
import { Link, useParams } from 'react-router';
import { System, SystemImportanceType } from '../api/api.types';
import {
  getSystemImportanceColour,
  useGetSystems,
  useGetSystemTypes,
} from '../api/systems';
import type { SystemTableType } from '../app.types';
import { usePreservedTableState } from '../common/preservedTableState.component';
import {
  COLUMN_FILTER_FUNCTIONS,
  COLUMN_FILTER_MODE_OPTIONS,
  COLUMN_FILTER_VARIANTS,
  customFilterFunctions,
  deselectRowById,
  displayTableRowCountText,
  formatDateTimeStrings,
  generateUniqueName,
  getInitialColumnFilterFnState,
  getPageHeightCalc,
  MRT_Functions_Localisation,
  mrtTheme,
  OPTIONAL_FILTER_MODE_OPTIONS,
  TableBodyCellOverFlowTip,
  TableHeaderOverflowTip,
  type TableCellOverFlowTipProps,
} from '../utils';
import { DeleteSystemDialog } from './deleteSystemDialog.component';
import SystemDetails from './systemDetails.component';
import SystemDialog from './systemDialog.component';
import { SystemDirectoryDialog } from './systemDirectoryDialog.component';

export type SystemMenuDialogType = 'edit' | 'duplicate' | 'delete';

const AddSystemButton = (props: {
  systemId: string | null;
  isIcon?: boolean;
}) => {
  const [addSystemDialogOpen, setAddSystemDialogOpen] =
    React.useState<boolean>(false);

  const ariaLabelText =
    props.systemId === null ? 'Add System' : 'Add Subsystem';

  const renderedButton = props.isIcon ? (
    <Tooltip title={ariaLabelText}>
      <span>
        <IconButton
          aria-label={ariaLabelText}
          onClick={() => setAddSystemDialogOpen(true)}
        >
          <AddIcon />
        </IconButton>
      </span>
    </Tooltip>
  ) : (
    <Button
      startIcon={<AddIcon />}
      sx={{ mx: 0.5 }}
      variant="outlined"
      onClick={() => setAddSystemDialogOpen(true)}
    >
      {ariaLabelText}
    </Button>
  );
  return (
    <>
      {renderedButton}
      <SystemDialog
        open={addSystemDialogOpen}
        onClose={() => setAddSystemDialogOpen(false)}
        parentId={props.systemId}
        requestType="post"
      />
    </>
  );
};

const SystemsActionMenu = (props: {
  selectedSystems: System[];
  onChangeSelectedSystems: (selectedSystems: MRT_RowSelectionState) => void;
  parentSystemId: string | null;
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [dialogType, setDialogType] = React.useState<
    'moveTo' | 'copyTo' | null
  >(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDialogOpen = (type: 'moveTo' | 'copyTo') => {
    setDialogType(type);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogType(null);
  };

  const ariaLabelText = props.parentSystemId
    ? 'Subsystems more options'
    : 'Systems more options';

  return (
    <>
      <Tooltip title={ariaLabelText}>
        <span>
          <IconButton aria-label={ariaLabelText} onClick={handleMenuOpen}>
            <MoreHorizIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('moveTo')}>
          <ListItemIcon>
            <DriveFileMoveOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('copyTo')}>
          <ListItemIcon>
            <FolderCopyOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy to</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => props.onChangeSelectedSystems({})}>
          <ListItemIcon>
            <ClearIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{props.selectedSystems.length} selected</ListItemText>
        </MenuItem>
      </Menu>

      {dialogType && (
        <SystemDirectoryDialog
          open={Boolean(dialogType)}
          onClose={handleDialogClose}
          selectedSystems={props.selectedSystems}
          onChangeSelectedSystems={props.onChangeSelectedSystems}
          parentSystemId={props.parentSystemId}
          type={dialogType}
        />
      )}
    </>
  );
};

const MIN_SUBSYSTEMS_WIDTH = '500px';

function Systems() {
  // Navigation
  const { system_id: systemId = null } = useParams();

  // Specifically for the drop down menus/dialogues
  const [selectedSystemForMenu, setSelectedSystemForMenu] = React.useState<
    System | undefined
  >();

  // When all menu's closed will be undefined
  const [menuDialogType, setMenuDialogType] = React.useState<
    SystemMenuDialogType | undefined
  >(undefined);

  const noResultsTxt = `No ${systemId === null ? 'systems' : 'subsystems'} found`;

  const hiddenColumns = React.useMemo(
    () => [
      'modified_time',
      'created_time',
      'importance',
      'description',
      'owner',
      'location',
    ],
    []
  );

  const { data: systemTypesData, isLoading: systemTypesLoading } =
    useGetSystemTypes();

  const { data: subsystemsData, isLoading: subsystemsDataLoading } =
    useGetSystems(
      // String value of null for filtering root systems
      systemId === null ? 'null' : systemId
    );

  const isLoading = systemTypesLoading || subsystemsDataLoading;
  const [tableRows, setTableRows] = React.useState<SystemTableType[]>([]);

  React.useEffect(() => {
    if (!isLoading && subsystemsData) {
      setTableRows(
        subsystemsData.map((system) => ({
          ...system,
          type: systemTypesData?.find((type) => type.id === system.type_id),
        }))
      );
    } else {
      setTableRows([]);
    }
    //Purposefully leave out systemTypesList from dependencies for same reasons as catalogueItemsTable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subsystemsData, isLoading]);

  const columns = React.useMemo<MRT_ColumnDef<SystemTableType>[]>(() => {
    const systemTypeValues = systemTypesData?.map((type) => type.value);
    return [
      {
        header: 'Name',
        accessorFn: (row) => row.name,
        id: 'name',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.string,
        size: 180,
        Cell: ({ row }) => {
          return (
            <MuiLink
              underline="hover"
              component={Link}
              to={`/systems/${row.original.id}`}
            >
              {row.original.name}
            </MuiLink>
          );
        },
      },
      {
        header: 'Type',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.type?.value,
        id: 'type.value',
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
        size: 150,
        filterSelectOptions: systemTypeValues,
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
      {
        header: 'Created Time',
        accessorFn: (row) => new Date(row.created_time),
        id: 'created_time',
        filterVariant: COLUMN_FILTER_VARIANTS.datetime,
        filterFn: COLUMN_FILTER_FUNCTIONS.datetime,
        columnFilterModeOptions: COLUMN_FILTER_MODE_OPTIONS.datetime,
        size: 400,
        enableGrouping: false,
        Cell: ({ row }) =>
          formatDateTimeStrings(row.original.created_time, true),
      },
      {
        header: 'Description',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.description ?? '',
        id: 'description',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 250,
        enableGrouping: false,
      },
      {
        header: 'Importance',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.importance,
        id: 'importance',
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
        size: 250,
        Cell: ({ row }) => (
          <Chip
            label={row.original.importance}
            sx={() => {
              const colorName = getSystemImportanceColour(
                row.original.importance
              );
              return {
                margin: 0,
                marginLeft: 1,
                bgcolor: `${colorName}.main`,
                color: `${colorName}.contrastText`,
              };
            }}
          />
        ),
        filterSelectOptions: Object.values(SystemImportanceType),
      },
      {
        header: 'Owner',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.owner ?? '',
        id: 'owner',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 250,
      },
      {
        header: 'Location',
        Header: TableHeaderOverflowTip,
        accessorFn: (row) => row.location ?? '',
        id: 'location',
        filterVariant: COLUMN_FILTER_VARIANTS.string,
        filterFn: COLUMN_FILTER_FUNCTIONS.string,
        columnFilterModeOptions: [
          ...COLUMN_FILTER_MODE_OPTIONS.string,
          ...OPTIONAL_FILTER_MODE_OPTIONS,
        ],
        size: 250,
      },
    ];
  }, [systemTypesData]);
  // Data

  // Names for preventing duplicates in the duplicate dialog
  const subsystemNames: string[] =
    subsystemsData?.map((subsystem) => subsystem.name) || [];

  const initialColumnFilterFnState = React.useMemo(() => {
    return getInitialColumnFilterFnState(columns);
  }, [columns]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      columnVisibility: Object.fromEntries(
        hiddenColumns.map((col) => [col, false])
      ),
      pagination: { pageSize: 15, pageIndex: 0 },
      columnFilterFns: initialColumnFilterFnState,
    },
    storeInUrl: true,
    urlParamName: 'subState',
  });

  const subsystemsTable = useMaterialReactTable({
    // Data
    columns: columns,
    data: tableRows,
    // Enables
    enableRowSelection: true,
    enableRowActions: true,
    enableDensityToggle: false,
    enableColumnResizing: false,
    enableGlobalFilter: true,
    enableHiding: true,
    enableColumnFilterModes: true,
    enableStickyHeader: true,
    enableGrouping: true,
    // Other settings
    paginationDisplayMode: 'pages',
    autoResetPageIndex: false,
    positionToolbarAlertBanner: 'bottom',
    // State
    initialState: {
      showGlobalFilter: true,
      showColumnFilters: false,
    },
    state: {
      ...preservedState,
      showProgressBars: subsystemsDataLoading,
    },
    filterFns: customFilterFunctions,
    // Localisation
    localization: {
      ...MRT_Localization_EN,
      ...MRT_Functions_Localisation,
      noRecordsToDisplay: noResultsTxt,
    },
    //MRT
    mrtTheme,
    //MUI
    muiPaginationProps: {
      color: 'secondary',
      shape: 'rounded',
      variant: 'outlined',
      showRowsPerPage: true,
      rowsPerPageOptions: [15, 30, 45],
      showFirstButton: false,
      showLastButton: false,
      size: 'small',
    },
    muiTablePaperProps: ({ table }) => ({
      elevation: 0,
      style: {
        maxWidth: '100%',
        // SciGateway navigation drawer is 1200, modal is 1300
        zIndex: table.getState().isFullScreen ? 1210 : undefined,
      },
    }),
    muiBottomToolbarProps: ({ table }) =>
      table.getState().isFullScreen ? {} : { sx: { boxShadow: 0 } },
    muiTableContainerProps: ({ table }) => ({
      // main app bar + breadcrumbs + title + top toolbar + column heading
      sx: {
        height: table.getState().isFullScreen
          ? '100%'
          : getPageHeightCalc('64px + 80px + 40px + 47px + 40px'),
      },
    }),
    muiSelectAllCheckboxProps: { disabled: systemId === null },
    muiSelectCheckboxProps: ({ row, table }) => {
      const selectedSystems = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      const type_id = selectedSystems[0]?.type_id;
      const isDisabled =
        selectedSystems.length > 0 ? row.original.type_id !== type_id : false;
      return {
        disabled: isDisabled,
      };
    },
    muiTableBodyCellProps: ({ table, column }) =>
      // Ignore MRT rendered cells e.g. expand , spacer etc
      column.id.startsWith('mrt')
        ? {}
        : {
            component: (props: TableCellBaseProps) => {
              return (
                <TableBodyCellOverFlowTip
                  {...({
                    ...props,
                    overFlowTipSx: {
                      maxWidth: table.getState().isFullScreen
                        ? undefined
                        : { md: 'max(8vw, 155px)', xs: '68vw' },
                      width: table.getState().isFullScreen ? '25vw' : undefined,
                    },
                  } as TableCellOverFlowTipProps)}
                />
              );
            },
          },
    // Functions
    ...onPreservedStatesChange,
    getRowId: (system) => system.id,
    renderBottomToolbarCustomActions: ({ table }) =>
      displayTableRowCountText(
        table,
        subsystemsData,
        systemId ? 'Subsystems' : 'Systems',
        {
          paddingLeft: '8px',
        }
      ),
    renderTopToolbar: ({ table }) => {
      if (table.getState().isFullScreen) {
        return undefined;
      }

      const selectedSystems = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);

      return (
        <>
          <Box
            sx={{ display: 'flex', alignItems: 'center', margin: 0.5, my: 1 }}
          >
            <Typography variant="h6" sx={{ marginRight: 'auto' }}>
              {systemId === null ? 'Root systems' : 'Subsystems'}
            </Typography>

            <AddSystemButton systemId={systemId} isIcon />
          </Box>
          <Divider role="presentation" />
          <Box sx={{ display: 'flex', alignItems: 'center', margin: 1 }}>
            <Box>
              <MRT_GlobalFilterTextField table={table} />
            </Box>
            <Box sx={{ marginLeft: 'auto' }}>
              {selectedSystems.length > 0 && (
                <SystemsActionMenu
                  selectedSystems={selectedSystems}
                  onChangeSelectedSystems={table.setRowSelection}
                  parentSystemId={systemId}
                />
              )}
              <Tooltip title={'Clear Filters'}>
                <span>
                  <IconButton
                    disabled={preservedState.columnFilters.length === 0}
                    onClick={() => {
                      table.resetColumnFilters();
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <MRT_ToggleFiltersButton table={table} />
              <MRT_ToggleFullScreenButton table={table} />
            </Box>
          </Box>
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex' }}>
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
        <AddSystemButton systemId={systemId} />
      </Box>
    ),
    renderRowActionMenuItems: ({ closeMenu, row }) => {
      return [
        <MenuItem
          key="edit"
          aria-label={`Edit system ${row.original.name}`}
          onClick={() => {
            setMenuDialogType('edit');
            setSelectedSystemForMenu(row.original);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>,
        <MenuItem
          key="duplicate"
          aria-label={`Duplicate system ${row.original.name}`}
          onClick={() => {
            setMenuDialogType('duplicate');
            setSelectedSystemForMenu({
              ...row.original,
              name: generateUniqueName(row.original.name, subsystemNames),
            });
            closeMenu();
          }}
        >
          <ListItemIcon>
            <SaveAsIcon />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>,
        <MenuItem
          key="delete"
          aria-label={`Delete system ${row.original.name}`}
          onClick={() => {
            setMenuDialogType('delete');
            setSelectedSystemForMenu(row.original);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>,
      ];
    },
  });
  const isFullScreen = subsystemsTable.getState().isFullScreen;
  React.useEffect(() => {
    if (isFullScreen) {
      subsystemsTable.setShowColumnFilters(true);
      subsystemsTable.setColumnVisibility(
        Object.fromEntries(hiddenColumns.map((col) => [col, true]))
      );
    } else {
      subsystemsTable.setShowColumnFilters(false);
      subsystemsTable.setColumnVisibility(
        Object.fromEntries(hiddenColumns.map((col) => [col, false]))
      );

      // Filter out filters and sorting related to hidden columns
      const remainingFilters = subsystemsTable
        .getState()
        .columnFilters.filter((filter) => !hiddenColumns.includes(filter.id));
      const remainingSorting = subsystemsTable
        .getState()
        .sorting.filter((sort) => !hiddenColumns.includes(sort.id));

      subsystemsTable.setColumnFilters(remainingFilters);
      subsystemsTable.setSorting(remainingSorting);
      subsystemsTable.setGrouping([]);
      subsystemsTable.setColumnOrder([]);
    }
  }, [subsystemsTable, isFullScreen, hiddenColumns]);

  // Reset table sate when systemId changes
  // This ensures that the table is reset when navigating to a different system
  React.useEffect(() => {
    subsystemsTable.reset();
    setSelectedSystemForMenu(undefined);
    setMenuDialogType(undefined);
  }, [systemId, subsystemsTable]);

  return (
    <>
      <Grid container direction="row" sx={{ margin: 0, alignItems: 'stretch' }}>
        <Grid
          size={{
            xs: 12,
            md: 'grow',
          }}
          sx={{
            minWidth: MIN_SUBSYSTEMS_WIDTH,
            textAlign: 'left',
            padding: 1,
            paddingRight: 2,
            paddingBottom: 0,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <MaterialReactTable table={subsystemsTable} />
          )}
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 10,
          }}
          sx={{
            textAlign: 'left',
            padding: 1,
            maxWidth: {
              xs: '100%',
              lg: `calc(100% - ${MIN_SUBSYSTEMS_WIDTH})`,
            },
          }}
        >
          <SystemDetails id={systemId} />
        </Grid>
      </Grid>

      <SystemDialog
        open={menuDialogType !== undefined && menuDialogType !== 'delete'}
        onClose={() => setMenuDialogType(undefined)}
        requestType={menuDialogType === 'edit' ? 'patch' : 'post'}
        duplicate={menuDialogType === 'duplicate'}
        selectedSystem={selectedSystemForMenu}
        parentId={systemId}
      />
      <DeleteSystemDialog
        open={menuDialogType === 'delete'}
        onClose={({ successfulDeletion }) => {
          setMenuDialogType(undefined);
          if (successfulDeletion && selectedSystemForMenu) {
            deselectRowById(selectedSystemForMenu.id, subsystemsTable);
          }
        }}
        system={selectedSystemForMenu}
      />
    </>
  );
}

export default Systems;
