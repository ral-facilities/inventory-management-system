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
import { SystemDialog } from './systemDialog.component';

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

  const [addSystemDialogOpen, setAddSystemDialogOpen] =
    React.useState<boolean>(false);

  const systemID = location.pathname.replace(
    '/inventory-management-system/systems',
    ''
  );

  const { data: subsystemsData, isLoading: systemsDataLoading } = useSystems(
    systemID === '' ? 'null' : systemID.replace('/', '')
  );

  const { data: systemsBreadcrumbs } = useSystemsBreadcrumbs(systemID);

  return systemsDataLoading && subsystemsData !== undefined ? null : (
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
          padding: '4px', // Add some padding for spacing
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
        <Grid item xs={2} textAlign="left" padding={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', margin: 1 }}>
            <Typography variant="h6">
              {systemID === '' ? 'Root systems' : 'Subsystems'}
            </Typography>
            <IconButton
              sx={{ marginLeft: 'auto' }}
              aria-label="add system"
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
        <Grid item xs={10} textAlign="left" padding={1}>
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
