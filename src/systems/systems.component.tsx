import { NavigateNext } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
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
import { useSystems } from '../api/system';
import Breadcrumbs from '../view/breadcrumbs.component';

function Systems() {
  // Navigation setup
  const [currNode, setCurrNode] = React.useState('/');
  const navigate = useNavigate();
  const location = useLocation();
  const onChangeNode = React.useCallback(
    (newNode: string) => {
      setCurrNode(newNode);
      navigate(`/inventory-management-system/systems${newNode}`);
    },
    [navigate]
  );

  const systemsLocation = location.pathname.replace(
    '/inventory-management-system/systems',
    ''
  );

  const { data: subsystemsData, isLoading: systemsDataLoading } = useSystems(
    undefined,
    systemsLocation === '' ? '/' : systemsLocation
  );

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
          <IconButton
            sx={{ margin: '4px' }}
            onClick={() => {
              navigate('/inventory-management-system/systems');
            }}
            aria-label="navigate to systems home"
          >
            <HomeIcon />
          </IconButton>
          <Breadcrumbs currNode={currNode} onChangeNode={onChangeNode} />
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
              {systemsLocation === '' ? 'Root systems' : 'Subsystems'}
            </Typography>
            <IconButton sx={{ marginLeft: 'auto' }} aria-label="add system">
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
            <Typography variant="h3">
              Please select a system
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Systems;
