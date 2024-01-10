import {
  Box,
  Button,
  Grid,
  Typography,
  Link as MuiLink,
  LinearProgress,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useManufacturer } from '../api/manufacturer';

import ManufacturerDialog from './manufacturerDialog.component';
import React from 'react';

function ManufacturerLandingPage() {
  const location = useLocation();

  const manufacturerId = location.pathname.replace('/manufacturer/', '');

  const { data: manufacturerData, isLoading: manufacturerDataLoading } =
    useManufacturer(manufacturerId);

  const [editManufacturerDialogOpen, setEditManufacturerDialogOpen] =
    React.useState<boolean>(false);

  return (
    <Grid container>
      <Grid
        sx={{
          mx: 0.5,
          '@media print': {
            display: 'none',
          },
        }}
        item
      >
        <Button
          component={Link}
          to={`/manufacturer/`}
          sx={{ margin: '8px' }}
          variant="outlined"
        >
          {manufacturerData ? 'Manufacturer table view' : 'Home'}
        </Button>
        <Button
          disabled={!manufacturerData}
          sx={{ mx: 0.5 }}
          variant="outlined"
          onClick={() => {
            setEditManufacturerDialogOpen(true);
          }}
        >
          Edit
        </Button>
        <Button
          sx={{ mx: 0.5 }}
          variant="outlined"
          onClick={() => {
            window.print();
          }}
        >
          Print
        </Button>
      </Grid>
      {manufacturerData && (
        <Grid
          container
          spacing={1}
          sx={{ px: '192px' }}
          alignContent={'center'}
          flexDirection="row"
        >
          <Grid item xs={12}>
            <Typography sx={{ margin: 1, textAlign: 'center' }} variant="h4">
              {manufacturerData.name}
            </Typography>
          </Grid>
          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              URL:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {manufacturerData.url && (
              <Typography
                textAlign={'center'}
                sx={{ mx: '8px' }}
                variant="body1"
              >
                <MuiLink underline="hover" href={manufacturerData.url}>
                  {manufacturerData.url}
                </MuiLink>
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              Telephone number:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ mx: '8px' }} textAlign={'center'} variant="body1">
              {manufacturerData.telephone}
            </Typography>
          </Grid>
          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              Address:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography align="center" sx={{ mx: '8px' }}>
              {manufacturerData.address.address_line}
            </Typography>
            <Typography align="center" sx={{ mx: '8px' }}>
              {manufacturerData.address.town}
            </Typography>
            <Typography align="center" sx={{ mx: '8px' }}>
              {manufacturerData.address.county}
            </Typography>
            <Typography align="center" sx={{ mx: '8px' }}>
              {manufacturerData.address.postcode}
            </Typography>
            <Typography align="center" sx={{ mx: '8px' }}>
              {manufacturerData.address.country}
            </Typography>
          </Grid>
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
        selectedManufacturer={manufacturerData}
      />
    </Grid>
  );
}

export default ManufacturerLandingPage;
