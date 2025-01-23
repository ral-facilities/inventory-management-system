import { Box, Grid } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { BreadcrumbsInfo } from '../api/api.types';
import { RoutesHomeLocation, type RoutesHomeLocationType } from '../app.types';
import Breadcrumbs from '../view/breadcrumbs.component';

export interface BaseLayoutHeaderProps {
  breadcrumbsInfo?: BreadcrumbsInfo;
  children: React.ReactNode;
  homeLocation: RoutesHomeLocationType;
}

function BaseLayoutHeader(props: BaseLayoutHeaderProps) {
  const { breadcrumbsInfo, children, homeLocation } = props;
  const navigate = useNavigate();

  // Check if we are in Tree View or Normal View by looking for '/tree' in the URL
  const isTreeView = location.pathname.includes('tree');
  const onChangeNode = React.useCallback(
    (id: string | null) => {
      navigate(
        `/${RoutesHomeLocation[homeLocation]}${id ? `/${id}` : ''}${isTreeView && !id && homeLocation == 'Systems' ? '/tree' : ''}`
      );
    },
    [homeLocation, isTreeView, navigate]
  );
  return (
    <Box height="100%" width="100%">
      <Grid
        container
        alignItems="center"
        sx={{
          justifyContent: 'left',
          paddingLeft: 0.5,
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 1000,
          width: '100%',
          paddingTop: 2.5,
          paddingBottom: 2.5,
        }}
      >
        <Breadcrumbs
          onChangeNode={onChangeNode}
          onChangeNavigateHome={() => onChangeNode(null)}
          breadcrumbsInfo={breadcrumbsInfo}
          homeLocation={homeLocation}
        />
      </Grid>
      {children}
    </Box>
  );
}

export default BaseLayoutHeader;
