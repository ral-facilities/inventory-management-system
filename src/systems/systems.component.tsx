import { NavigateNext } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSystems, useSystemsBreadcrumbs } from '../api/systems';
import Breadcrumbs from '../view/breadcrumbs.component';
import SystemDialog from './systemDialog.component';
import SystemDetails from './systemDetails.component';

function Systems() {
  // Navigation setup
  const navigate = useNavigate();
  const location = useLocation();
  const onChangeNode = React.useCallback(
    (newId: string) => {
      navigate(`/inventory-management-system/systems/${newId}`);
    },
    [navigate]
  );

  const getSystemID = React.useCallback(() => {
    let systemID: string | null = location.pathname.replace(
      '/inventory-management-system/systems',
      ''
    );
    systemID = systemID === '' ? null : systemID.replace('/', '');
    return systemID;
  }, [location.pathname]);
  const systemID = getSystemID();

  const [addSystemDialogOpen, setAddSystemDialogOpen] =
    React.useState<boolean>(false);

  const { data: systemsBreadcrumbs, isLoading: systemsBreadcrumbsLoading } =
    useSystemsBreadcrumbs(systemID);
  const { data: subsystemsData, isLoading: subsystemsDataLoading } = useSystems(
    // String value of null for filtering root systems
    systemID === null ? 'null' : systemID
  );

  return (
    <Grid container>
      {systemsBreadcrumbsLoading && systemID !== null ? (
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
              onChangeNode={onChangeNode}
              onChangeNavigateHome={() => {
                navigate('/inventory-management-system/systems');
              }}
              navigateHomeAriaLabel={'navigate to systems home'}
            />
            <NavigateNext
              fontSize="medium"
              sx={{ color: 'rgba(0, 0, 0, 0.6)', margin: '4px' }}
            />
          </div>
        </Grid>
      )}
      <Grid container margin={0} direction="row" alignItems="stretch">
        <Grid item xs={12} md={3} lg={2} textAlign="left" padding={1}>
          {subsystemsDataLoading ? (
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="100%"
              height={400}
            />
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', margin: 1 }}>
                <Typography variant="h6">
                  {systemID === null ? 'Root systems' : 'Subsystems'}
                </Typography>
                <IconButton
                  sx={{ marginLeft: 'auto' }}
                  aria-label={
                    systemID === null ? 'add system' : 'add subsystem'
                  }
                  onClick={() => setAddSystemDialogOpen(true)}
                >
                  <AddIcon />
                </IconButton>
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
          <SystemDetails id={systemID} />
        </Grid>
      </Grid>
      <SystemDialog
        open={addSystemDialogOpen}
        onClose={() => setAddSystemDialogOpen(false)}
        parentId={systemID}
        type="add"
      />
    </Grid>
  );
}

export default Systems;
