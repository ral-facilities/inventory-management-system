import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import { paths } from '../App';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import ErrorPage from '../common/errorPage.component';

export const AdminErrorComponent = () => {
  return (
    <ErrorPage
      boldErrorText="Invalid Admin Route"
      errorText="The admin route you are trying to access doesn't exist. Please click the Home button to navigate back to the Admin Home page."
    />
  );
};

// returns the admin function from the path (null when just on adminPage)
export const useGetAdminPageName = (): string | null => {
  const location = useLocation();

  return React.useMemo(() => {
    const adminPageName: string | null = location.pathname.replace(
      paths.admin,
      ''
    );
    return adminPageName === '' ? null : adminPageName.replace('/', '');
  }, [location.pathname]);
};

const adminBreadCrumbsTrails: { [key: string]: [string, string] } = {
  ['units']: ['units', 'Units'],
  ['usage-statuses']: ['usage-statuses', 'Usage statuses'],
};

function AdminLayout() {
  const adminPageName = useGetAdminPageName();

  const adminBreadCrumbs: BreadcrumbsInfo | undefined = adminPageName
    ? {
        trail: [adminBreadCrumbsTrails[adminPageName] ?? ['', '']],
        full_trail: true,
      }
    : undefined;

  return (
    <BaseLayoutHeader homeLocation="Admin" breadcrumbsInfo={adminBreadCrumbs}>
      <Outlet />
    </BaseLayoutHeader>
  );
}

export default AdminLayout;
