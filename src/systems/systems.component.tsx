import { NavigateNext } from '@mui/icons-material';
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
  Checkbox,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystems, useSystemsBreadcrumbs } from '../api/systems';
import { System } from '../app.types';
import Breadcrumbs from '../view/breadcrumbs.component';
import SystemDetails from './systemDetails.component';
import SystemDialog, { SystemDialogType } from './systemDialog.component';
import { SystemDirectoryDialog } from './systemDirectoryDialog.component';
import { DeleteSystemDialog } from './deleteSystemDialog.component';

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
  onChangeSelectedSystems: (selectedSystems: System[]) => void;
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
  onChangeSelectedSystems: (selectedSystems: System[]) => void;
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

/* TODO: Remove this and use table menu items */
const SubsystemMenu = (props: {
  subsystem: System;
  onOpen: () => void;
  onItemClicked: (type: MenuDialogType) => void;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    props.onOpen();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (type: MenuDialogType) => {
    props.onItemClicked(type);
    handleClose();
  };

  return (
    <>
      <IconButton
        id={`${props.subsystem.id}-menu-button`}
        aria-controls={open ? `${props.subsystem.id}-menu` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label="Row Actions"
        onClick={handleOpen}
        sx={{ marginRight: 1 }}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id={`${props.subsystem.id}-menu`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `${props.subsystem.id}-menu-button`,
        }}
      >
        <MenuItem
          aria-label={`Edit system ${props.subsystem.name}`}
          onClick={() => handleClick('edit')}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          aria-label={`Save system ${props.subsystem.name} as new system`}
          onClick={() => handleClick('save as')}
        >
          <ListItemIcon>
            <SaveAsIcon />
          </ListItemIcon>
          <ListItemText>Save as</ListItemText>
        </MenuItem>
        <MenuItem
          aria-label={`Delete system ${props.subsystem.name}`}
          onClick={() => handleClick('delete')}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

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

function Systems() {
  // Navigation
  const systemId = useSystemId();
  const navigateToSystem = useNavigateToSystem();

  // States
  const [selectedSystems, setSelectedSystems] = React.useState<System[]>([]);

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

  const handleSystemCheckboxChange = (checked: boolean, system: System) => {
    if (checked) setSelectedSystems([...selectedSystems, system]);
    else
      setSelectedSystems(
        selectedSystems.filter(
          (selectedSystem: System) => selectedSystem.id !== system.id
        )
      );
  };

  // Clear selected system when user navigates to a different page
  React.useEffect(() => {
    setSelectedSystems([]);
  }, [systemId]);

  return (
    <>
      <Grid container>
        {systemsBreadcrumbsLoading && systemId !== null ? (
          <LinearProgress sx={{ width: '100%' }} />
        ) : (
          <Grid
            item
            container
            alignItems="center"
            justifyContent="space-between" // Align items and distribute space along the main axis
            sx={{
              display: 'flex',
              height: '100%',
              width: '100%',
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
                  onChangeSelectedSystems={setSelectedSystems}
                  parentSystemId={systemId}
                />
                <CopySystemsButton
                  selectedSystems={selectedSystems}
                  onChangeSelectedSystems={setSelectedSystems}
                  parentSystemId={systemId}
                />
                <Button
                  sx={{ mx: 1 }}
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={() => setSelectedSystems([])}
                >
                  {selectedSystems.length} selected
                </Button>
              </Box>
            )}
          </Grid>
        )}
        <Grid container margin={0} direction="row" alignItems="stretch">
          <Grid item xs={12} md={3} lg={2} textAlign="left" padding={1}>
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
                <List sx={{ padding: 0 }}>
                  {subsystemsData?.map((system, index) => {
                    const selected = selectedSystems.some(
                      (selectedSystem) => selectedSystem.id === system.id
                    );
                    return (
                      <ListItem key={index} sx={{ padding: 0 }}>
                        <ListItemButton
                          sx={{ padding: 0 }}
                          selected={selected}
                          onClick={(event) => navigateToSystem(system.id)}
                        >
                          <Checkbox
                            size="small"
                            checked={selected}
                            // Prevent button being triggered as well
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) =>
                              handleSystemCheckboxChange(
                                event.target.checked,
                                system
                              )
                            }
                          />
                          <ListItemText>{system.name}</ListItemText>
                        </ListItemButton>
                        <SubsystemMenu
                          subsystem={system}
                          onOpen={() => setSelectedSystemForMenu(system)}
                          onItemClicked={(type: SystemDialogType | 'delete') =>
                            setMenuDialogType(type)
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}
          </Grid>
          <Grid item xs={12} md={9} lg={10} textAlign="left" padding={1}>
            <SystemDetails id={systemId} />
          </Grid>
        </Grid>
      </Grid>
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
