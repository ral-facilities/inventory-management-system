import { NavigateNext } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import {
  // To resolve react/jsx-pascal-case
  MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
  MRT_TableBodyCellValue as MRTTableBodyCellValue,
  MRT_TablePagination as MRTTablePagination,
  MRT_ColumnDef,
  MRT_RowSelectionState,
  useMaterialReactTable,
} from 'material-react-table';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystems, useSystemsBreadcrumbs } from '../api/systems';
import { System } from '../app.types';
import { generateUniqueName, getPageHeightCalc } from '../utils';
import Breadcrumbs from '../view/breadcrumbs.component';
import { DeleteSystemDialog } from './deleteSystemDialog.component';
import SystemDetails from './systemDetails.component';
import SystemDialog, { SystemDialogType } from './systemDialog.component';
import { SystemDirectoryDialog } from './systemDirectoryDialog.component';

/* Returns function that navigates to a specific system id (or to the root of all systems
   if given null) */
export const useNavigateToSystem = () => {
  const navigate = useNavigate();

  return React.useCallback(
    (newId: string | null) => {
      navigate(`/systems${newId ? `/${newId}` : ''}`);
    },
    [navigate]
  );
};

const AddSystemButton = (props: { systemId: string | null }) => {
  const [addSystemDialogOpen, setAddSystemDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <IconButton
        aria-label={props.systemId === null ? 'add system' : 'add subsystem'}
        onClick={() => setAddSystemDialogOpen(true)}
      >
        <AddIcon />
      </IconButton>
      <SystemDialog
        open={addSystemDialogOpen}
        onClose={() => setAddSystemDialogOpen(false)}
        parentId={props.systemId}
        type="add"
      />
    </>
  );
};

const MoveSystemsButton = (props: {
  selectedSystems: System[];
  onChangeSelectedSystems: (selectedSystems: MRT_RowSelectionState) => void;
  parentSystemId: string | null;
}) => {
  const [moveSystemsDialogOpen, setMoveSystemsDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: 1 }}
        variant="outlined"
        startIcon={<DriveFileMoveOutlinedIcon />}
        onClick={() => setMoveSystemsDialogOpen(true)}
      >
        Move to
      </Button>
      <SystemDirectoryDialog
        open={moveSystemsDialogOpen}
        onClose={() => setMoveSystemsDialogOpen(false)}
        selectedSystems={props.selectedSystems}
        onChangeSelectedSystems={props.onChangeSelectedSystems}
        parentSystemId={props.parentSystemId}
        type="moveTo"
      />
    </>
  );
};

const CopySystemsButton = (props: {
  selectedSystems: System[];
  onChangeSelectedSystems: (selectedSystems: MRT_RowSelectionState) => void;
  parentSystemId: string | null;
}) => {
  const [copySystemsDialogOpen, setCopySystemsDialogOpen] =
    React.useState<boolean>(false);

  return (
    <>
      <Button
        sx={{ mx: 1 }}
        variant="outlined"
        startIcon={<FolderCopyOutlinedIcon />}
        onClick={() => setCopySystemsDialogOpen(true)}
      >
        Copy to
      </Button>
      <SystemDirectoryDialog
        open={copySystemsDialogOpen}
        onClose={() => setCopySystemsDialogOpen(false)}
        selectedSystems={props.selectedSystems}
        onChangeSelectedSystems={props.onChangeSelectedSystems}
        parentSystemId={props.parentSystemId}
        type="copyTo"
      />
    </>
  );
};

type MenuDialogType = SystemDialogType | 'delete';

/* Returns the system id from the location pathname (null when not found) */
export const useSystemId = (): string | null => {
  // Navigation setup
  const location = useLocation();

  return React.useMemo(() => {
    let systemId: string | null = location.pathname.replace('/systems', '');
    systemId = systemId === '' ? null : systemId.replace('/', '');
    return systemId;
  }, [location.pathname]);
};

const columns: MRT_ColumnDef<System>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
];

function Systems() {
  // Navigation
  const systemId = useSystemId();
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
    MenuDialogType | undefined
  >(undefined);

  // Data
  const { data: systemsBreadcrumbs, isLoading: systemsBreadcrumbsLoading } =
    useSystemsBreadcrumbs(systemId);
  const { data: subsystemsData, isLoading: subsystemsDataLoading } = useSystems(
    // String value of null for filtering root systems
    systemId === null ? 'null' : systemId
  );

  // Obtain the selected system data, not just the selection state
  const selectedRowIds = Object.keys(rowSelection);
  const selectedSystems =
    subsystemsData?.filter((subsystem) =>
      selectedRowIds.includes(subsystem.id)
    ) ?? [];

  // Names for preventing duplicates in the save as dialog
  const subsystemNames: string[] =
    subsystemsData?.map((subsystem) => subsystem.name) || [];

  // Clear selected system when user navigates to a different page
  React.useEffect(() => {
    setRowSelection({});
  }, [systemId]);

  const subsystemsTable = useMaterialReactTable({
    columns: columns,
    data: subsystemsData !== undefined ? subsystemsData : [],
    getRowId: (system) => system.id,
    enableRowSelection: true,
    enableRowActions: true,
    positionActionsColumn: 'last',
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      showRowsPerPage: true,
      rowsPerPageOptions: [10, 25, 50],
      showFirstButton: false,
      showLastButton: false,
      size: 'small',
    },
    initialState: {
      showGlobalFilter: true,
      pagination: { pageSize: 10, pageIndex: 0 },
    },
    onRowSelectionChange: setRowSelection,
    state: { rowSelection: rowSelection },
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
          key="save as"
          aria-label={`Save system ${row.original.name} as new system`}
          onClick={() => {
            setMenuDialogType('save as');
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
          <ListItemText>Save as</ListItemText>
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
        {systemsBreadcrumbsLoading && systemId !== null ? (
          <LinearProgress sx={{ width: '100%' }} />
        ) : (
          <Grid
            container
            alignItems="center"
            justifyContent="space-between" // Align items and distribute space along the main axis
            sx={{
              display: 'flex',
              padding: 1, // Add some padding for spacing
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Breadcrumbs
                breadcrumbsInfo={systemsBreadcrumbs}
                onChangeNode={navigateToSystem}
                onChangeNavigateHome={() => {
                  navigateToSystem(null);
                }}
                navigateHomeAriaLabel={'navigate to systems home'}
              />
              <NavigateNext
                fontSize="small"
                sx={{ color: 'text.secondary', margin: 1 }}
              />
            </div>
            {selectedSystems.length > 0 && (
              <Box>
                <MoveSystemsButton
                  selectedSystems={selectedSystems}
                  onChangeSelectedSystems={setRowSelection}
                  parentSystemId={systemId}
                />
                <CopySystemsButton
                  selectedSystems={selectedSystems}
                  onChangeSelectedSystems={setRowSelection}
                  parentSystemId={systemId}
                />
                <Button
                  sx={{ mx: 1 }}
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={() => setRowSelection({})}
                >
                  {selectedSystems.length} selected
                </Button>
              </Box>
            )}
          </Grid>
        )}
        <Grid container margin={0} direction="row" alignItems="stretch">
          <Grid
            item
            xs={12}
            md={2}
            minWidth="320px"
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
                  <AddSystemButton systemId={systemId} />
                </Box>
                <Divider role="presentation" />
                <Stack
                  sx={{
                    marginTop: 1,
                    marginBottom: 'auto',
                    flexWrap: 'no-wrap',
                    // Breadcrumbs and rest
                    height: getPageHeightCalc('56px + 74px'),
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
                  <MRTTablePagination table={subsystemsTable} />
                </Stack>
              </>
            )}
          </Grid>
          <Grid item textAlign="left" padding={1} xs>
            <SystemDetails id={systemId} />
          </Grid>
        </Grid>
      </Box>
      <SystemDialog
        open={menuDialogType !== undefined && menuDialogType !== 'delete'}
        onClose={() => setMenuDialogType(undefined)}
        type={
          menuDialogType !== undefined && menuDialogType !== 'delete'
            ? menuDialogType
            : 'edit'
        }
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
