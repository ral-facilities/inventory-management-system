import {
  Box,
  Button,
  Grid,
  Typography,
  Link as MuiLink,
  LinearProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useManufacturer } from '../api/manufacturer';

import ManufacturerDialog from './manufacturerDialog.component';
import React from 'react';
import Breadcrumbs from '../view/breadcrumbs.component';
import { paths } from '../view/viewTabs.component';
import { BreadcrumbsInfo } from '../app.types';

function ManufacturerLandingPage() {
  const { id: manufacturerId } = useParams();

  const { data: manufacturerData, isLoading: manufacturerDataLoading } =
    useManufacturer(manufacturerId);

  const [editManufacturerDialogOpen, setEditManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const navigate = useNavigate();
  const onChangeNode = React.useCallback(
    (id: string | null) => {
      navigate(id ? `${paths.manufacturers}/id` : paths.manufacturers);
    },
    [navigate]
  );

  const [manufacturerLandingBreadcrumbs, setManufacturerLandingBreadcrumbs] =
    React.useState<BreadcrumbsInfo | undefined>(undefined);

  React.useEffect(() => {
    manufacturerData &&
      setManufacturerLandingBreadcrumbs({
        full_trail: true,
        trail: [
          [
            `${paths.manufacturer}/${manufacturerData.id}`,
            manufacturerData.name,
          ],
        ],
      });
  }, [manufacturerData]);

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
        <Grid item sx={{ py: '20px' }}>
          <Breadcrumbs
            onChangeNode={onChangeNode}
            onChangeNavigateHome={() => onChangeNode(null)}
            breadcrumbsInfo={manufacturerLandingBreadcrumbs}
            navigateHomeAriaLabel="navigate to manufacturer home"
          />
        </Grid>
        {manufacturerData && (
          <Grid item container sx={{ display: 'flex', py: 2 }}>
            <Button
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
        )}
      </Grid>
      {manufacturerData && (
        <Grid item xs={12}>
          <Grid container spacing={1} flexDirection="column">
            <Grid item xs={12}>
              <Typography sx={{ margin: 1, textAlign: 'center' }} variant="h4">
                {manufacturerData.name}
              </Typography>
            </Grid>
            <Grid
              container
              spacing={1}
              sx={{ px: '192px' }}
              alignContent={'center'}
            >
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
                <Typography variant="h6">Telephone number:</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ mx: '8px' }} variant="body1">
                  {manufacturerData.telephone}
                </Typography>
              </Grid>
              <Grid item xs={12} my={2}>
                <Typography variant="h6">Address:</Typography>
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
