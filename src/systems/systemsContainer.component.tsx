import { Box, Grid } from '@mui/material';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetSystemsBreadcrumbs } from '../api/systems';
import BaseContainer from '../common/baseContainer.component';
import Breadcrumbs from '../view/breadcrumbs.component';

/* Returns function that navigates to a specific system id (or to the root of all systems
   if given null) */
export const useNavigateToSystem = () => {
  const navigate = useNavigate();

  return React.useCallback(
    (newId: string | null) => {
      navigate(`/systems${newId ? `/${newId}` : ''}`);
    },
    [navigate]
  );
};

function SystemsContainer() {
  const { system_id: systemId } = useParams();
  const navigateToSystem = useNavigateToSystem();

  const { data: systemsBreadcrumbs } = useGetSystemsBreadcrumbs(systemId);

  return (
    <>
      <Box height="100%">
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          sx={{
            display: 'flex',
            paddingLeft: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: '20px',
              paddingBottom: '20px',
            }}
          >
            <Breadcrumbs
              breadcrumbsInfo={systemsBreadcrumbs}
              onChangeNode={navigateToSystem}
              onChangeNavigateHome={() => navigateToSystem(null)}
              homeLocation="Systems"
            />
          </div>
        </Grid>
        <BaseContainer />
      </Box>
    </>
  );
}

export default SystemsContainer;
