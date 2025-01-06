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
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  // To resolve react/jsx-pascal-case
  MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
  MRT_TableBodyCellValue as MRTTableBodyCellValue,
  MRT_ColumnDef,
  MRT_RowSelectionState,
  MRT_TablePagination,
  useMaterialReactTable,
} from 'material-react-table';
import React from 'react';
import { useParams } from 'react-router-dom';
import { System } from '../api/api.types';
import { useGetSystems } from '../api/systems';
import { usePreservedTableState } from '../common/preservedTableState.component';
import {
  OverflowTip,
  displayTableRowCountText,
  generateUniqueName,
  getPageHeightCalc,
} from '../utils';
import { DeleteSystemDialog } from './deleteSystemDialog.component';
import SystemDetails from './systemDetails.component';
import SystemDialog from './systemDialog.component';
import { SystemDirectoryDialog } from './systemDirectoryDialog.component';
import { useNavigateToSystem } from './systemsLayout.component';

export type SystemMenuDialogType = 'edit' | 'duplicate' | 'delete';

const AddSystemButton = (props: { systemId: string | null }) => {
  const [addSystemDialogOpen, setAddSystemDialogOpen] =
    React.useState<boolean>(false);

  const ariaLabelText =
    props.systemId === null ? 'Add System' : 'Add Subsystem';
  return (
    <>
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

const columns: MRT_ColumnDef<System>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    Cell: ({ row }) => {
      return (
        <OverflowTip
          sx={{
            fontSize: 'inherit',
            maxWidth: { md: 'max(9vw, 180px)', xs: '68vw' },
          }}
        >
          {row.original.name}
        </OverflowTip>
      );
    },
  },
];

const MIN_SUBSYSTEMS_WIDTH = '320px';

function Systems() {
  // Navigation
  const { system_id: systemId = null } = useParams();
  const navigateToSystem = useNavigateToSystem();

  // States
  const [rowSelection, setRowSelection] = React.useState<MRT_RowSelectionState>(
    {}
  );

  // Specifically for the drop down menus/dialogues
  const [selectedSystemForMenu, setSelectedSystemForMenu] = React.useState<
    System | undefined
  >();

  // When all menu's closed will be undefined
  const [menuDialogType, setMenuDialogType] = React.useState<
    SystemMenuDialogType | undefined
  >(undefined);

  // Data
  const { data: subsystemsData, isLoading: subsystemsDataLoading } =
    useGetSystems(
      // String value of null for filtering root systems
      systemId === null ? 'null' : systemId
    );

  // Obtain the selected system data, not just the selection state
  const selectedRowIds = Object.keys(rowSelection);
  const selectedSystems =
    subsystemsData?.filter((subsystem) =>
      selectedRowIds.includes(subsystem.id)
    ) ?? [];

  // Names for preventing duplicates in the duplicate dialog
  const subsystemNames: string[] =
    subsystemsData?.map((subsystem) => subsystem.name) || [];

  // Clear selected system when user navigates to a different page
  React.useEffect(() => {
    setRowSelection({});
  }, [systemId]);

  const { preservedState, onPreservedStatesChange } = usePreservedTableState({
    initialState: {
      pagination: { pageSize: 15, pageIndex: 0 },
    },
    storeInUrl: true,
    urlParamName: 'subState',
  });

  const subsystemsTable = useMaterialReactTable({
    // Data
    columns: columns,
    data: subsystemsData !== undefined ? subsystemsData : [],
    // Enables
    enableRowSelection: true,
    enableRowActions: true,
    // Other settings
    positionActionsColumn: 'last',
    paginationDisplayMode: 'pages',
    autoResetPageIndex: false,
    // State
    initialState: {
      showGlobalFilter: true,
    },
    state: { ...preservedState, rowSelection: rowSelection },
    // MUI
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
    // Functions
    ...onPreservedStatesChange,
    getRowId: (system) => system.id,
    onRowSelectionChange: setRowSelection,
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

  return (
    <>
      <Box height="100%">
        <Grid container margin={0} direction="row" alignItems="stretch">
          <Grid
            item
            xs={12}
            md
            minWidth={MIN_SUBSYSTEMS_WIDTH}
            textAlign="left"
            padding={1}
            paddingBottom={0}
          >
            {subsystemsDataLoading ? (
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
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', margin: 1 }}>
                  <Typography variant="h6" sx={{ marginRight: 'auto' }}>
                    {systemId === null ? 'Root systems' : 'Subsystems'}
                  </Typography>
                  {selectedSystems.length > 0 && (
                    <SystemsActionMenu
                      selectedSystems={selectedSystems}
                      onChangeSelectedSystems={setRowSelection}
                      parentSystemId={systemId}
                    />
                  )}
                  <AddSystemButton systemId={systemId} />
                </Box>
                <Divider role="presentation" />
                <Stack
                  sx={{
                    marginTop: 1,
                    marginBottom: 'auto',
                    flexWrap: 'no-wrap',
                    // Breadcrumbs and rest
                    height: getPageHeightCalc('96px + 74px'),
                    // To prevent no subsystems being visible
                    minHeight: '200px',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'left',
                      alignItems: 'center',
                    }}
                  >
                    <MRTGlobalFilterTextField table={subsystemsTable} />
                  </Box>
                  <TableContainer sx={{ height: '100%' }}>
                    <Table sx={{ width: '100%' }}>
                      <TableBody sx={{ width: '100%' }}>
                        {subsystemsTable.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            selected={row.getIsSelected()}
                            onClick={() => navigateToSystem(row.id)}
                            hover={true}
                            sx={{ cursor: 'pointer' }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                align={
                                  cell.column.id === 'mrt-row-actions'
                                    ? 'right'
                                    : 'left'
                                }
                                variant="body"
                                key={cell.id}
                                sx={{
                                  margin: 0,
                                  padding: 1,
                                  paddingRight:
                                    cell.column.id === 'mrt-row-actions'
                                      ? 1.5
                                      : 0,
                                  width:
                                    // Make name take up as much space as possible to make other cells
                                    // as small as possible
                                    cell.column.id === 'name'
                                      ? '100%'
                                      : undefined,
                                }}
                              >
                                <MRTTableBodyCellValue
                                  cell={cell}
                                  table={subsystemsTable}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ paddingTop: '8px' }}>
                    {displayTableRowCountText(
                      subsystemsTable,
                      subsystemsData,
                      systemId === null ? 'Systems' : 'Subsystems',
                      {
                        paddingLeft: '8px',
                        textAlign: { sm: 'center', md: 'left' },
                      }
                    )}
                    <MRT_TablePagination table={subsystemsTable} />
                  </Box>
                </Stack>
              </>
            )}
          </Grid>
          <Grid
            item
            textAlign="left"
            padding={1}
            xs
            md={10}
            sx={{
              maxWidth: {
                xs: '100%',
                md: `calc(100% - ${MIN_SUBSYSTEMS_WIDTH})`,
              },
            }}
          >
            <SystemDetails id={systemId} />
          </Grid>
        </Grid>
      </Box>
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
        onClose={() => setMenuDialogType(undefined)}
        system={selectedSystemForMenu}
      />
    </>
  );
}

export default Systems;
