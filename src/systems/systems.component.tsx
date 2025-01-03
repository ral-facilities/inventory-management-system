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
  ListItemIcon,
  ListItemText,
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
import { useLocation, useNavigate } from 'react-router-dom';
import { System } from '../api/api.types';
import { useGetSystems, useGetSystemsBreadcrumbs } from '../api/systems';
import { usePreservedTableState } from '../common/preservedTableState.component';
import {
  OverflowTip,
  displayTableRowCountText,
  generateUniqueName,
  getPageHeightCalc,
} from '../utils';
import Breadcrumbs from '../view/breadcrumbs.component';
import { DeleteSystemDialog } from './deleteSystemDialog.component';
import SystemDetails from './systemDetails.component';
import SystemDialog from './systemDialog.component';
import { SystemDirectoryDialog } from './systemDirectoryDialog.component';

export type SystemMenuDialogType = 'edit' | 'duplicate' | 'delete';

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

/* Returns the system id from the location pathname (null when not found) */
export const useSystemId = (): string | null => {
  // Navigation setup
  const location = useLocation();

  return React.useMemo(() => {
    let systemId: string | null = location.pathname
      .replace('/systems', '')
      // In case of /systems/
      .replace('/', '');
    systemId = systemId === '' ? null : systemId;
    return systemId;
  }, [location.pathname]);
};

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
        sx={{ mx: 0.5 }}
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
        sx={{ mx: 0.5 }}
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
    SystemMenuDialogType | undefined
  >(undefined);

  // Data
  const { data: systemsBreadcrumbs } = useGetSystemsBreadcrumbs(systemId);
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
        <Grid
          container
          alignItems="center"
          justifyContent="space-between" // Align items and distribute space along the main axis
          sx={{
            display: 'flex',
            paddingLeft: '4px', // Add some padding for spacing
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: '20px',
              paddingBottom: '20px',
            }}
          >
            <Breadcrumbs
              breadcrumbsInfo={systemsBreadcrumbs}
              onChangeNode={navigateToSystem}
              onChangeNavigateHome={() => navigateToSystem(null)}
              homeLocation="Systems"
            />
            {systemsBreadcrumbs && (
              <NavigateNext
                fontSize="small"
                sx={{ color: 'text.secondary', margin: 1 }}
              />
            )}
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
                sx={{ mx: 0.5 }}
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setRowSelection({})}
              >
                {selectedSystems.length} selected
              </Button>
            </Box>
          )}
        </Grid>

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
