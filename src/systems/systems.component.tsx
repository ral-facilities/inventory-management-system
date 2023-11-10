import { NavigateNext } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystems, useSystemsBreadcrumbs } from '../api/systems';
import Breadcrumbs from '../view/breadcrumbs.component';
import SystemDialog from './systemDialog.component';

function Systems() {
  // Navigation setup
  const navigate = useNavigate();
  const location = useLocation();
  const onChangeNode = React.useCallback(
    (newId: string) => {
      navigate(`/inventory-management-system/systems${newId}`);
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

  const { data: systemsBreadcrumbs } = useSystemsBreadcrumbs(systemID);
  const { data: subsystemsData, isLoading: systemsDataLoading } = useSystems(
    // String value of null for filtering root systems
    systemID === null ? 'null' : systemID
  );

  return systemsDataLoading ? null : (
    <Grid container>
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
      <Grid container margin={0} direction="row" alignItems="stretch">
        <Grid item xs={12} md={3} lg={2} textAlign="left" padding={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', margin: 1 }}>
            <Typography variant="h6">
              {systemID === null ? 'Root systems' : 'Subsystems'}
            </Typography>
            <IconButton
              sx={{ marginLeft: 'auto' }}
              aria-label={systemID === null ? 'add system' : 'add subsystem'}
              onClick={() => setAddSystemDialogOpen(true)}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Divider role="presentation" />
          <List sx={{ padding: 0 }}>
            {subsystemsData?.map((item, index) => (
              <ListItem key={index} sx={{ padding: 0 }}>
                <ListItemButton sx={{ padding: 1 }}>
                  <ListItemText>{item.name}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={9} lg={10} textAlign="left" padding={1}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              margin: 1.5,
            }}
          >
            <Typography variant="h6">No system selected</Typography>
          </Box>
          <Divider role="presentation" />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              margin: 1,
            }}
          >
            <Typography variant="h3">Please select a system</Typography>
          </Box>
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
