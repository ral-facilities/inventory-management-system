import { NavigateNext } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSystems, useSystemsBreadcrumbs } from '../api/systems';
import Breadcrumbs from '../view/breadcrumbs.component';
import SystemDetails from './systemDetails.component';
import SystemDialog from './systemDialog.component';

/* Returns function that navigates to a specific system id (or to the root of all systems
   if given null) */
export const useNavigateToSystem = () => {
  const navigate = useNavigate();

  return React.useCallback(
    (newId: string | null) => {
      navigate(
        `/inventory-management-system/systems${newId ? `/${newId}` : ''}`
      );
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

function Systems() {
  // Navigation setup
  const location = useLocation();
  const navigateToSystem = useNavigateToSystem();

  const getSystemId = React.useCallback(() => {
    let systemId: string | null = location.pathname.replace(
      '/inventory-management-system/systems',
      ''
    );
    systemId = systemId === '' ? null : systemId.replace('/', '');
    return systemId;
  }, [location.pathname]);
  const systemId = getSystemId();

  const { data: systemsBreadcrumbs, isLoading: systemsBreadcrumbsLoading } =
    useSystemsBreadcrumbs(systemId);
  const { data: subsystemsData, isLoading: subsystemsDataLoading } = useSystems(
    // String value of null for filtering root systems
    systemId === null ? 'null' : systemId
  );

  return (
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
              fontSize="medium"
              sx={{ color: 'text.secondary', margin: '4px' }}
            />
          </div>
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
                {subsystemsData?.map((item, index) => (
                  <ListItem key={index} sx={{ padding: 0 }}>
                    <ListItemButton
                      sx={{ padding: 1 }}
                      component={Link}
                      to={item.id}
                    >
                      <ListItemText>{item.name}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Grid>
        <Grid item xs={12} md={9} lg={10} textAlign="left" padding={1}>
          <SystemDetails id={systemId} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Systems;
