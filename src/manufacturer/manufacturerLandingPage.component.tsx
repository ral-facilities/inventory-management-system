import {
  Box,
  Button,
  Grid,
  Typography,
  Link as MuiLink,
  Collapse,
  LinearProgress,
} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Link, useLocation } from 'react-router-dom';
import { useManufacturer } from '../api/manufacturer';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function ManufacturerLandingPage() {
  const location = useLocation();

  const manufacturerId = location.pathname.replace(
    '/inventory-management-system/manufacturer/',
    ''
  );

  const { data: manufacturerData, isLoading: manufacturerDataLoading } =
    useManufacturer(manufacturerId);

  const [showAddress, setShowAddress] = useState(true);

  const toggleAddress = () => {
    setShowAddress(!showAddress);
  };

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
              mx: '192px',
            }}
          >
            <Typography
              sx={{ margin: '8px', textAlign: 'center' }}
              variant="h4"
            >
              {manufacturerData.name}
            </Typography>
          </Box>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              cursor: 'pointer',
              margin: '8px',
            }}
          >
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
                  <ListItemText primary={'URL'} />
                </ListItem>
                <MuiLink
                  sx={{ alignItems: 'left' }}
                  underline="hover"
                  href={manufacturerData.url}
                >
                  {manufacturerData.url}
                </MuiLink>
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
                    primary={'Telephone number'}
                    secondary={manufacturerData.telephone}
                  />
                </ListItem>
              </Grid>
            </Grid>
          </Box>

          <Box
            onClick={toggleAddress}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              cursor: 'pointer',
              margin: '8px',
            }}
            aria-label={`${
              showAddress ? 'Close' : 'Show'
            } manufacturer address`}
          >
            {showAddress ? (
              <>
                <Typography variant="h6">Address</Typography>
                <ExpandLessIcon />
              </>
            ) : (
              <>
                <Typography variant="h6">Address</Typography>
                <ExpandMoreIcon />
              </>
            )}
          </Box>
          <Collapse in={showAddress}>
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
                    secondary={manufacturerData.address.building_number}
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
                    secondary={manufacturerData.address.street_name}
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
          </Collapse>
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
              navigate to the catalogue home
            </Typography>
          </Box>
        )
      ) : (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
    </Grid>
  );
}

export default ManufacturerLandingPage;
