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
import Units from './units.component';
import { BreadcrumbsInfo } from '../app.types';
import UsageStatuses from './usageStatuses.component';

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
export const useGetAdminPageName = (): string | null => {
  const location = useLocation();

  return React.useMemo(() => {
    let adminPageName: string | null = location.pathname.replace(
      '/admin-ims',
      ''
    );
    adminPageName =
      adminPageName === '' ? null : adminPageName.replace('/', '');
    return adminPageName;
  }, [location.pathname]);
};

function AdminPage() {
  const navigateToAdminFunction = useNavigateToAdminFunction();
  const adminPageName = useGetAdminPageName();

  const adminBreadCrumbsNames: { [key: string]: [string, string] } = {
    ['units']: ['Units', 'Units'],
    ['usage-statuses']: ['Usage statuses', 'Usage statuses'],
  };

  const adminBreadCrumbs: BreadcrumbsInfo | undefined = adminPageName
    ? {
        trail: [adminBreadCrumbsNames[adminPageName] ?? ['', '']],
        full_trail: true,
      }
    : undefined;

  return (
    <Grid container>
      <Grid container>
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

      {adminPageName === null && (
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
                to={'usage-statuses'}
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
                        <Typography>Usage Statuses</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}

      {adminPageName === 'units' && <Units />}
      {adminPageName === 'usage-statuses' && <UsageStatuses />}
      {adminPageName !== undefined &&
        adminPageName !== 'units' &&
        adminPageName !== 'usage-statuses' && (
          <Box
            sx={{
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              No results found
            </Typography>
            <Typography sx={{ textAlign: 'center' }}>
              The admin function you searched for does not exist. Please
              navigate home by pressing the home button at the top left of your
              screen.
            </Typography>
          </Box>
        )}
    </Grid>
  );
}

export default AdminPage;
