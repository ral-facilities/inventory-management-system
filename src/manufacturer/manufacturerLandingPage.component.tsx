import {
  Box,
  Button,
  Grid,
  Typography,
  Link as MuiLink,
  LinearProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useManufacturer } from '../api/manufacturers';
import ManufacturerDialog from './manufacturerDialog.component';
import React from 'react';
import Breadcrumbs from '../view/breadcrumbs.component';
import { BreadcrumbsInfo } from '../app.types';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { formatDateTimeStrings } from '../utils';
import { paths } from '../App';

function ManufacturerLandingPage() {
  const { manufacturer_id: manufacturerId } = useParams();

  const { data: manufacturerData, isLoading: manufacturerDataLoading } =
    useManufacturer(manufacturerId);

  const [editManufacturerDialogOpen, setEditManufacturerDialogOpen] =
    React.useState<boolean>(false);

  const navigate = useNavigate();
  const onChangeNode = React.useCallback(
    (id: string | null) => {
      navigate(id ? `${paths.manufacturers}/${id}` : paths.manufacturers);
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
        container
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
          item
          container
          spacing={1}
          sx={{ px: '192px' }}
          alignContent={'center'}
          flexDirection="row"
        >
          <Grid item xs={12}>
            <Typography
              sx={{ margin: 1, textAlign: 'center', wordWrap: 'break-word' }}
              variant="h4"
            >
              {manufacturerData.name}
            </Typography>
          </Grid>
          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              URL:
            </Typography>
          </Grid>
          <Grid item xs={12}>
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
          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              Telephone number:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              sx={{ mx: '8px', wordWrap: 'break-word' }}
              textAlign={'center'}
              variant="body1"
              color="text.secondary"
            >
              {manufacturerData.telephone ?? 'None'}
            </Typography>
          </Grid>
          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              Address:
            </Typography>
          </Grid>
          <Grid item xs={12}>
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

          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              Last modified:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              sx={{ mx: '8px' }}
              textAlign={'center'}
              variant="body1"
              color="text.secondary"
            >
              {formatDateTimeStrings(manufacturerData.modified_time, true)}
            </Typography>
          </Grid>

          <Grid item xs={12} my={2}>
            <Typography textAlign={'center'} variant="h6">
              Created:
            </Typography>
          </Grid>
          <Grid item xs={12}>
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
      {!manufacturerDataLoading ? (
        !manufacturerData && (
          <Box
            sx={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '8px',
            }}
          >
            <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              No result found
            </Typography>
            <Typography sx={{ textAlign: 'center' }}>
              This manufacturer doesn&#39;t exist. Please click the Home button
              to navigate to the manufacturer table
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
        type="edit"
      />
    </Grid>
  );
}

export default ManufacturerLandingPage;
