import { Box, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid2';
import React from 'react';
import { useNavigate } from 'react-router';
import type { BreadcrumbsInfo } from '../api/api.types';
import { RoutesHomeLocation, type RoutesHomeLocationType } from '../app.types';
import Breadcrumbs from '../view/breadcrumbs.component';
import { useAuthorisationState } from '../authProvider.component';
import AuthRoleStatus from './authRoleStatus.component';
import { isRunningInDevelopment, setLocalStorageToken } from '../utils';

export interface BaseLayoutHeaderProps {
  breadcrumbsInfo?: BreadcrumbsInfo;
  children: React.ReactNode;
  homeLocation: RoutesHomeLocationType;
}

function BaseLayoutHeader(props: BaseLayoutHeaderProps) {
  const isDevMode = isRunningInDevelopment();

  const { breadcrumbsInfo, children, homeLocation } = props;
  const navigate = useNavigate();
  const onChangeNode = React.useCallback(
    (id: string | null) => {
      navigate(`/${RoutesHomeLocation[homeLocation]}${id ? `/${id}` : ''}`);
    },
    [homeLocation, navigate]
  );

  const { isPrivilegedUser } = useAuthorisationState();

  const handleChangeRole = React.useCallback(() => {
    setLocalStorageToken(!isPrivilegedUser);
  }, [isPrivilegedUser]);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      <Grid
        container
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
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
        <Grid container flexDirection={'row'}>
          {isDevMode && (
            <FormControlLabel
              control={
                <Switch
                  checked={isPrivilegedUser}
                  onChange={handleChangeRole}
                />
              }
              label="Privileged user"
              labelPlacement="end"
            />
          )}
          {isPrivilegedUser && <AuthRoleStatus />}
        </Grid>
      </Grid>
      {children}
    </Box>
  );
}

export default BaseLayoutHeader;
