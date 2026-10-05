import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  Outlet,
  useLocation,
  useParams,
  type LoaderFunctionArgs,
} from 'react-router';
import {
  getSystemQuery,
  useGetSystem,
  useGetSystemsBreadcrumbs,
} from '../api/systems';
import { APISettingsContext } from '../apiConfigProvider.component';
import BaseLayoutHeader from '../common/baseLayoutHeader.component';
import CriticalityTooltipIcon from '../common/criticalityTooltipIcon.component';
import PageNotFoundComponent from '../common/pageNotFound/pageNotFound.component';
import { useAppSelector } from '../state/hook';
import { selectCriticality } from '../state/slices/criticalitySlice';
import { criticalityHeaderStyle } from '../utils';
import { getSCriticalityLabel } from './systems.component';
import { BreadcrumbsInfo } from '../api/api.types';

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
      await queryClient.ensureQueryData(getSystemQuery(systemId, true));
    }

    return { ...params };
  };

function SystemsLayout() {
  const { system_id: systemId } = useParams();

  const location = useLocation();
  // Remove the trailing slash (if it exists) before splitting
  const cleanPath = location.pathname.replace(/\/$/, '');

  // Now split the cleaned path
  const systemPath = cleanPath.split('/');

  const lastSegmentOfSystemPath = systemPath[systemPath.length - 1];

  const { isCriticalMode } = useAppSelector(selectCriticality);
  const apiSettings = React.useContext(APISettingsContext);
  const isSparesDefinitionDefined = !!apiSettings.spares;

  const { data: breadcrumbs } = useGetSystemsBreadcrumbs(systemId);
  const { data: system } = useGetSystem(systemId);
  const showFlagged = system?.is_flagged;

  const [systemBreadcrumbs, setSystemBreadCrumbs] = React.useState<
    BreadcrumbsInfo | undefined
  >(breadcrumbs);
  React.useEffect(() => {
    if (breadcrumbs) {
      setSystemBreadCrumbs({
        ...breadcrumbs,
        trail: [
          // System page
          ...(system && lastSegmentOfSystemPath === system.id
            ? [...breadcrumbs.trail]
            : []),
          // System items history page
          ...((system && lastSegmentOfSystemPath === 'items-history'
            ? [...breadcrumbs.trail, [system.id, 'Items history']]
            : []) satisfies BreadcrumbsInfo['trail']),
        ],
      });
    } else {
      setSystemBreadCrumbs(undefined);
    }
  }, [breadcrumbs, lastSegmentOfSystemPath, system]);

  return (
    <BaseLayoutHeader
      homeLocation="Systems"
      breadcrumbsInfo={systemBreadcrumbs}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          gap: 0.5,
        }}
      >
        <Box
          sx={(theme) => ({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            width: '100%',
            gap: 1,
            padding: 1,
            ...(isCriticalMode &&
              isSparesDefinitionDefined &&
              showFlagged !== undefined &&
              criticalityHeaderStyle({ theme, showFlagged })),
          })}
        >
          {isCriticalMode &&
            isSparesDefinitionDefined &&
            showFlagged !== undefined && (
              <CriticalityTooltipIcon
                showFlagged={showFlagged}
                label={getSCriticalityLabel(showFlagged)}
              />
            )}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              wordWrap: 'break-word',
            }}
          >
            {system?.name}
          </Typography>
        </Box>
      </Box>
      <Outlet />
    </BaseLayoutHeader>
  );
}

export default SystemsLayout;
