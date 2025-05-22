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
          sx={{
            alignContent: 'center',
            flexDirection: "row",
            px: '192px'
          }}>
          <Grid size={12}>
            <Typography
              sx={{ margin: 1, textAlign: 'center', wordWrap: 'break-word' }}
              variant="h4"
            >
              {manufacturerData.name}
            </Typography>
          </Grid>
          <Grid size={12} sx={{
            my: 2
          }}>
            <Typography variant="h6" sx={{
              textAlign: 'center'
            }}>
              URL:
            </Typography>
          </Grid>
          <Grid size={12}>
            {manufacturerData.url ? (
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  color: "text.secondary",
                  mx: '8px'
                }}>
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
                variant="body1"
                sx={{
                  textAlign: 'center',
                  color: "text.secondary",
                  mx: '8px'
                }}>
                {'None'}
              </Typography>
            )}
          </Grid>
          <Grid size={12} sx={{
            my: 2
          }}>
            <Typography variant="h6" sx={{
              textAlign: 'center'
            }}>
              Telephone number:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: "text.secondary",
                mx: '8px',
                wordWrap: 'break-word'
              }}>
              {manufacturerData.telephone ?? 'None'}
            </Typography>
          </Grid>
          <Grid size={12} sx={{
            my: 2
          }}>
            <Typography variant="h6" sx={{
              textAlign: 'center'
            }}>
              Address:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              align="center"
              sx={{
                color: "text.secondary",
                mx: '8px',
                wordWrap: 'break-word'
              }}>
              {manufacturerData.address.address_line}
            </Typography>
            <Typography
              align="center"
              sx={{
                color: "text.secondary",
                mx: '8px',
                wordWrap: 'break-word'
              }}>
              {manufacturerData.address.town}
            </Typography>
            <Typography
              align="center"
              sx={{
                color: "text.secondary",
                mx: '8px',
                wordWrap: 'break-word'
              }}>
              {manufacturerData.address.county}
            </Typography>
            <Typography
              align="center"
              sx={{
                color: "text.secondary",
                mx: '8px',
                wordWrap: 'break-word'
              }}>
              {manufacturerData.address.postcode}
            </Typography>
            <Typography
              align="center"
              sx={{
                color: "text.secondary",
                mx: '8px',
                wordWrap: 'break-word'
              }}>
              {manufacturerData.address.country}
            </Typography>
          </Grid>

          <Grid size={12} sx={{
            my: 2
          }}>
            <Typography variant="h6" sx={{
              textAlign: 'center'
            }}>
              Last modified:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: "text.secondary",
                mx: '8px'
              }}>
              {formatDateTimeStrings(manufacturerData.modified_time, true)}
            </Typography>
          </Grid>

          <Grid size={12} sx={{
            my: 2
          }}>
            <Typography variant="h6" sx={{
              textAlign: 'center'
            }}>
              Created:
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: "text.secondary",
                mx: '8px'
              }}>
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
