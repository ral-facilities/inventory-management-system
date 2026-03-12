import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { Outlet, useParams, type LoaderFunctionArgs } from 'react-router';
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
  const { isCriticalMode } = useAppSelector(selectCriticality);
  const apiSettings = React.useContext(APISettingsContext);
  const isSparesDefinitionDefined = !!apiSettings.spares;

  const { data: systemsBreadcrumbs } = useGetSystemsBreadcrumbs(systemId);
  const { data: system } = useGetSystem(systemId);
  const showFlagged = system?.is_flagged;

  return (
    <BaseLayoutHeader
      homeLocation="Systems"
      breadcrumbsInfo={systemsBreadcrumbs}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          padding: 1,
          mt: 1,
          mx: 1,
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
      <Outlet />
    </BaseLayoutHeader>
  );
}

export default SystemsLayout;
