import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import {
  Box,
  Button,
  LinearProgress,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetManufacturer } from '../api/manufacturers';
import { formatDateTimeStrings } from '../utils';
import ManufacturerDialog from './manufacturerDialog.component';

function ManufacturerLandingPage() {
  const { manufacturer_id: manufacturerId } = useParams();

  const { data: manufacturerData, isLoading: manufacturerDataLoading } =
    useGetManufacturer(manufacturerId);

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
        container
      >
        {manufacturerData && (
          <Grid container sx={{ display: 'flex', py: 2 }}>
            <Button
              sx={{ mx: 0.5 }}
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                setEditManufacturerDialogOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              sx={{ mx: 0.5 }}
              variant="outlined"
              startIcon={<PrintIcon />}
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
        <Grid
          container
          spacing={1}
          sx={{ px: '192px' }}
          alignContent={'center'}
          flexDirection="row"
        >
          <Grid size={12}>
            <Typography
              sx={{ margin: 1, textAlign: 'center', wordWrap: 'break-word' }}
              variant="h4"
            >
              {manufacturerData.name}
            </Typography>
          </Grid>
          <Grid my={2} size={12}>
            <Typography textAlign={'center'} variant="h6">
              URL:
            </Typography>
          </Grid>
          <Grid size={12}>
            {manufacturerData.url ? (
              <Typography
                textAlign={'center'}
                sx={{ mx: '8px' }}
                variant="body1"
                color="text.secondary"
              >
                <MuiLink
                  underline="hover"
                  href={manufacturerData.url}
                  sx={{ wordWrap: 'break-word' }}
                >
                  {manufacturerData.url}
                </MuiLink>
              </Typography>
            ) : (
              <Typography
                sx={{ mx: '8px' }}
                textAlign={'center'}
                variant="body1"
                color="text.secondary"
              >
                {'None'}
              </Typography>
            )}
          </Grid>
          <Grid my={2} size={12}>
            <Typography textAlign={'center'} variant="h6">
              Telephone number:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              sx={{ mx: '8px', wordWrap: 'break-word' }}
              textAlign={'center'}
              variant="body1"
              color="text.secondary"
            >
              {manufacturerData.telephone ?? 'None'}
            </Typography>
          </Grid>
          <Grid my={2} size={12}>
            <Typography textAlign={'center'} variant="h6">
              Address:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              align="center"
              sx={{ mx: '8px', wordWrap: 'break-word' }}
              color="text.secondary"
            >
              {manufacturerData.address.address_line}
            </Typography>
            <Typography
              align="center"
              sx={{ mx: '8px', wordWrap: 'break-word' }}
              color="text.secondary"
            >
              {manufacturerData.address.town}
            </Typography>
            <Typography
              align="center"
              sx={{ mx: '8px', wordWrap: 'break-word' }}
              color="text.secondary"
            >
              {manufacturerData.address.county}
            </Typography>
            <Typography
              align="center"
              sx={{ mx: '8px', wordWrap: 'break-word' }}
              color="text.secondary"
            >
              {manufacturerData.address.postcode}
            </Typography>
            <Typography
              align="center"
              sx={{ mx: '8px', wordWrap: 'break-word' }}
              color="text.secondary"
            >
              {manufacturerData.address.country}
            </Typography>
          </Grid>

          <Grid my={2} size={12}>
            <Typography textAlign={'center'} variant="h6">
              Last modified:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              sx={{ mx: '8px' }}
              textAlign={'center'}
              variant="body1"
              color="text.secondary"
            >
              {formatDateTimeStrings(manufacturerData.modified_time, true)}
            </Typography>
          </Grid>

          <Grid my={2} size={12}>
            <Typography textAlign={'center'} variant="h6">
              Created:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              sx={{ mx: '8px' }}
              textAlign={'center'}
              variant="body1"
              color="text.secondary"
            >
              {formatDateTimeStrings(manufacturerData.created_time, true)}
            </Typography>
          </Grid>
        </Grid>
      )}
      {manufacturerDataLoading && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
      <ManufacturerDialog
        open={editManufacturerDialogOpen}
        onClose={() => setEditManufacturerDialogOpen(false)}
        selectedManufacturer={manufacturerData}
        type="patch"
      />
    </Grid>
  );
}

export default ManufacturerLandingPage;
