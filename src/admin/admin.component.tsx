import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import Breadcrumbs from '../view/breadcrumbs.component';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { BreadcrumbsInfo } from '../app.types';
import UsageStatusComponent from './usageStatuses/usageStatuses.component';

export const useNavigateToAdminFunction = () => {
  const navigate = useNavigate();

  return React.useCallback(
    (newPath: string | null) => {
      navigate(`/admin-ims${newPath ? `/${newPath}` : ''}`);
    },
    [navigate]
  );
};
// returns the admin function from the path (null when just on adminPage)
export const useAdminFunction = (): string | null => {
  const location = useLocation();

  return React.useMemo(() => {
    let adminFunction: string | null = location.pathname.replace(
      '/admin-ims',
      ''
    );
    adminFunction =
      adminFunction === '' ? null : adminFunction.replace('/', '');
    return adminFunction;
  }, [location.pathname]);
};

function AdminPage() {
  const navigateToAdminFunction = useNavigateToAdminFunction();
  const adminFunction = useAdminFunction();

  const adminBreadCrumbs: BreadcrumbsInfo | undefined = adminFunction
    ? {
        trail: [['', adminFunction ?? 'admin']],
        full_trail: true,
      }
    : undefined;

  return (
    <Grid container>
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
            <Box
              sx={{
                py: '20px',
                paddingLeft: '4px',
              }}
            >
              <Breadcrumbs
                onChangeNode={navigateToAdminFunction}
                breadcrumbsInfo={adminBreadCrumbs}
                onChangeNavigateHome={() => navigateToAdminFunction(null)}
                navigateHomeAriaLabel={'navigate to admin page'}
              />
            </Box>
          </div>
        </Grid>
      </Grid>
      {adminFunction === null && (
        <Grid container flexDirection={'column'}>
          <Grid item container xs={12} overflow={'auto'}>
            <Grid item key={0} xs={12} sm={6}>
              <Button
                component={Link}
                to={'units'}
                fullWidth
                sx={{
                  display: 'flex',
                  width: '100%',
                  textDecoration: 'none',
                  color: 'inherit',
                  position: 'relative', // Make the parent container relative
                }}
              >
                <Card
                  sx={{
                    padding: '8px',
                    width: '100%',
                    display: 'flex',
                    height: '100px', // Set a fixed height for all cards
                  }}
                >
                  <CardContent
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minWidth: 0,
                    }}
                  >
                    <Grid>
                      <Grid position={'relative'}>
                        <Typography>Units</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Button>
            </Grid>
            <Grid item key={1} xs={12} sm={6}>
              <Button
                component={Link}
                to={'usage-status'}
                fullWidth
                sx={{
                  display: 'flex',
                  width: '100%',
                  textDecoration: 'none',
                  color: 'inherit',
                  position: 'relative', // Make the parent container relative
                }}
              >
                <Card
                  sx={{
                    padding: '8px',
                    width: '100%',
                    display: 'flex',
                    height: '100px', // Set a fixed height for all cards
                  }}
                >
                  <CardContent
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minWidth: 0,
                    }}
                  >
                    <Grid>
                      <Grid position={'relative'}>
                        <Typography>Usage Status</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}

      {adminFunction === 'units'}
      {adminFunction === 'usage-status' && <UsageStatusComponent />}
    </Grid>
  );
}

export default AdminPage;
