import { Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { BreadcrumbsInfo } from '../api/api.types';
import APIConfigProvider from '../apiConfigProvider.component';
import { RoutesHomeLocation, type RoutesHomeLocationType } from '../app.types';
import { AuthProvider } from '../authProvider.component';
import { isRunningInDevelopment } from '../utils';
import AuthToggle from '../view/authToggle.component';
import Breadcrumbs from '../view/breadcrumbs.component';
import AuthRoleStatus from './authRoleStatus.component';

export interface BaseLayoutHeaderProps {
  breadcrumbsInfo?: BreadcrumbsInfo;
  children: React.ReactNode;
  homeLocation: RoutesHomeLocationType;
}

function BaseLayoutHeader(props: BaseLayoutHeaderProps) {
  const { breadcrumbsInfo, children, homeLocation } = props;
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we are in Tree View or Normal View by looking for '/tree' in the URL
  const isTreeView =
    homeLocation === 'Systems' && location.pathname.includes('tree');

  const onChangeNode = React.useCallback(
    (id: string | null) => {
      navigate(
        `/${RoutesHomeLocation[homeLocation]}${id ? `/${id}` : ''}${isTreeView ? '/tree' : ''}`
      );
    },
    [homeLocation, isTreeView, navigate]
  );

  return (
    <AuthProvider>
      <APIConfigProvider>
        <Box
          sx={{
            height: '100%',
            width: '100%',
          }}
        >
          {/* Also render authorisation state toggle so it is inline with tabs, but not on home page */}
          {isRunningInDevelopment() && (
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ marginLeft: 'auto' }}>
                <AuthToggle />
              </Box>
            </Box>
          )}
          <Grid
            container
            sx={{
              justifyContent: 'space-between',
              paddingLeft: 0.5,
              position: 'sticky',
              top: 0,
              backgroundColor: 'background.default',
              zIndex: 1000,
              width: '100%',
            }}
          >
            <Breadcrumbs
              onChangeNode={onChangeNode}
              onChangeNavigateHome={() => onChangeNode(null)}
              breadcrumbsInfo={breadcrumbsInfo}
              homeLocation={homeLocation}
            />
            <AuthRoleStatus />
          </Grid>
          {children}
        </Box>
      </APIConfigProvider>
    </AuthProvider>
  );
}

export default BaseLayoutHeader;
