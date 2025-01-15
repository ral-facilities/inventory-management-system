import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BreadcrumbsInfo } from '../api/api.types';
import { paths } from '../App';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component';

export const AdminErrorComponent = () => {
  return <PageNotFoundComponent homeLocation="Admin" />;
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

const adminBreadCrumbsTrails: { [key: string]: BreadcrumbsInfo['trail'] } = {
  ['units']: [['units', 'Units']],
  ['usage-statuses']: [['usage-statuses', 'Usage statuses']],
};

function AdminLayout() {
  const adminPageName = useGetAdminPageName();

  const adminBreadCrumbs: BreadcrumbsInfo | undefined =
    adminPageName && adminPageName in adminBreadCrumbsTrails
      ? {
          trail: adminBreadCrumbsTrails[adminPageName],
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
