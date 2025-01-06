import { Box, Grid } from '@mui/material';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import Breadcrumbs from '../view/breadcrumbs.component';

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

const adminBreadCrumbsTrails: { [key: string]: [string, string] } = {
  ['units']: ['units', 'Units'],
  ['usage-statuses']: ['usage-statuses', 'Usage statuses'],
};

function AdminLayout() {
  const navigateToAdminFunction = useNavigateToAdminFunction();
  const adminPageName = useGetAdminPageName();

  const adminBreadCrumbs: BreadcrumbsInfo | undefined = adminPageName
    ? {
        trail: [adminBreadCrumbsTrails[adminPageName] ?? ['', '']],
        full_trail: true,
      }
    : undefined;

  return (
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
            homeLocation="Admin"
          />
        </Box>
      </div>
      <Outlet />
    </Grid>
  );
}

export default AdminLayout;
