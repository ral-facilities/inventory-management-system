import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import { getSystemQuery, useGetSystemsBreadcrumbs } from '../api/systems';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component';

export const SystemsErrorComponent = () => {
  return <PageNotFoundComponent homeLocation="Systems" />;
};

export const SystemsLayoutErrorComponent = () => {
  return (
    <BaseLayoutHeader homeLocation="Systems">
      <SystemsErrorComponent />
    </BaseLayoutHeader>
  );
};

export const systemsLayoutLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const { system_id: systemId } = params;

    if (systemId) {
      await queryClient.ensureQueryData(
        getSystemQuery(systemId, { retry: false })
      );
    }

    return { ...params };
  };

function SystemsLayout() {
  const location = useLocation();
  const { system_id: systemId } = useParams();

  const { data: systemsBreadcrumbs } = useGetSystemsBreadcrumbs(systemId);
  const navigate = useNavigate();

  // Check if we are in Tree View or Normal View by looking for '/tree' in the URL
  const isTreeView = location.pathname.includes('tree');

  // Handle the view change using the toggle button
  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: string
  ) => {
    if (newView === 'tree') {
      // Navigate to Tree View
      navigate(`/systems${systemId ? `/${systemId}` : ''}/tree`);
    } else {
      // Navigate to Normal View
      navigate(`/systems${systemId ? `/${systemId}` : ''}`);
    }
  };
  return (
    <BaseLayoutHeader
      homeLocation="Systems"
      breadcrumbsInfo={{
        ...systemsBreadcrumbs,
        full_trail: systemsBreadcrumbs?.full_trail ?? true,
        trail:
          systemsBreadcrumbs?.trail.map(([id, name]) => [
            isTreeView ? id + '/tree' : id,
            name,
          ]) ?? [],
      }}
    >
      {location.pathname !== '/systems' && (
        <ToggleButtonGroup
          value={isTreeView ? 'tree' : 'normal'}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode toggle"
          size="small"
          sx={{ ml: 1, mb: 1 }}
        >
          <Tooltip title={'Normal view'}>
            <span>
              <ToggleButton value="normal" aria-label="normal view">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
            </span>
          </Tooltip>
          <Tooltip title={'Tree view'}>
            <span>
              <ToggleButton value="tree" aria-label="tree view">
                <AccountTreeIcon fontSize="small" />
              </ToggleButton>
            </span>
          </Tooltip>
        </ToggleButtonGroup>
      )}
      <Outlet />
    </BaseLayoutHeader>
  );
}

export default SystemsLayout;
