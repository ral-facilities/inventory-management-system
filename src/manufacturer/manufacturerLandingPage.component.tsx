import {
  Box,
  Button,
  Grid,
  Typography,
  Link as MuiLink,
  LinearProgress,
} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Link, useLocation } from 'react-router-dom';
import { useManufacturer } from '../api/manufacturer';

import ManufacturerDialog from './manufacturerDialog.component';
import React from 'react';
import { ManufacturerDetails } from '../app.types';

function ManufacturerLandingPage() {
  const location = useLocation();

  const manufacturerId = location.pathname.replace(
    '/inventory-management-system/manufacturer/',
    ''
  );

  const { data: manufacturerData, isLoading: manufacturerDataLoading } =
    useManufacturer(manufacturerId);

  const [editManufacturerDialogOpen, setEditManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const [manufacturer, setManufacturer] = React.useState<ManufacturerDetails>({
    name: '',
    url: undefined,
    address: {
      address_line: '',
      country: '',
      town: '',
      county: '',
      postcode: '',
    },
    telephone: '',
  });

  return (
    <Grid container>
      <Grid sx={{ padding: '8px' }} item>
        <Button
          component={Link}
          to={`/inventory-management-system/manufacturer/`}
          sx={{ margin: '8px' }}
          variant="outlined"
        >
          {manufacturerData ? 'Back to manufacturer table view' : 'Home'}
        </Button>
        <Button
          disabled={!manufacturerData}
          sx={{ margin: '8px' }}
          variant="outlined"
          onClick={() => {
            setEditManufacturerDialogOpen(true);
            if (manufacturerData) {
              setManufacturer(manufacturerData);
            }
          }}
        >
          Edit
        </Button>
      </Grid>
      {manufacturerData && (
        <Grid item xs={12}>
          <Box
            sx={{
              padding: '20px',
              textAlign: 'left',
              px: '192px',
            }}
          >
            <Typography
              sx={{ margin: '8px', textAlign: 'center' }}
              variant="h4"
            >
              {manufacturerData.name}
            </Typography>

            <Box
              style={{
                flexDirection: 'row',
                alignItems: 'left',
                cursor: 'pointer',
                margin: '8px',
              }}
            >
              <Typography sx={{ margin: '8px' }} variant="h6">
                URL:
              </Typography>

              {manufacturerData.url && (
                <Typography sx={{ margin: '8px' }} variant="body1">
                  <MuiLink underline="hover" href={manufacturerData.url}>
                    {manufacturerData.url}
                  </MuiLink>
                </Typography>
              )}

              <Typography sx={{ margin: '8px' }} variant="h6">
                Telephone number:
              </Typography>
              <Typography sx={{ margin: '8px' }} variant="body1">
                {manufacturerData.telephone}
              </Typography>
            </Box>
            <Box
              style={{
                flexDirection: 'row',
                alignItems: 'left',
                cursor: 'pointer',
                margin: '8px',
              }}
            >
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="h6">Address</Typography>
              </Grid>
            </Box>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem
                  style={{
                    justifyContent: 'flex-start',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={'Address Line'}
                    secondary={manufacturerData.address.address_line}
                  />
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem
                  style={{
                    justifyContent: 'flex-start',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={'Town'}
                    secondary={manufacturerData.address.town}
                  />
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem
                  style={{
                    justifyContent: 'flex-start',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={'County'}
                    secondary={manufacturerData.address.county}
                  />
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem
                  style={{
                    justifyContent: 'flex-start',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={'Country'}
                    secondary={manufacturerData.address.country}
                  />
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem
                  style={{
                    justifyContent: 'flex-start',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    primary={'Post/Zip code'}
                    secondary={manufacturerData.address.postcode}
                  />
                </ListItem>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      )}
      {!manufacturerDataLoading ? (
        !manufacturerData && (
          <Box
            sx={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '8px',
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>No result found</Typography>
            <Typography>
              This manufacturer doesn't exist. Please click the Home button to
              navigate to the manufacturer table
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}

      <ManufacturerDialog
        open={editManufacturerDialogOpen}
        onClose={() => setEditManufacturerDialogOpen(false)}
        manufacturerDetails={manufacturer}
        onChangeManufacturerDetails={setManufacturer}
        type="edit"
        selectedManufacturer={manufacturerData}
      />
    </Grid>
  );
}

export default ManufacturerLandingPage;
