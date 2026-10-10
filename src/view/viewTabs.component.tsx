import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { TAB_VALUES, TabValue } from '../app.types';
import { a11yProps, StyledTab } from '../common/tab/tab.utils';
import TabPanel from '../common/tab/tabPanel.component';
import paths from '../paths';
import { getSciGatewayPageHeightCalc, isRunningInDevelopment } from '../utils';

function ViewTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  // The useMemo below is only active when it is in not production
  // because that is when the tabs are visible
  const value: TabValue | false = React.useMemo(() => {
    if (!import.meta.env.DEV) return false;

    const prefixIndex = location.pathname.indexOf(paths.root);

    let tabValue =
      prefixIndex !== -1
        ? location.pathname
            .substring(prefixIndex + paths.root.length)
            .split('/')[0]
        : '';

    if (!tabValue) return false;

    tabValue = tabValue.charAt(0).toUpperCase() + tabValue.slice(1);

    return TAB_VALUES.includes(tabValue as TabValue)
      ? (tabValue as TabValue)
      : false;
  }, [location.pathname]);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    navigate(`/${newValue.toLowerCase()}`);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: getSciGatewayPageHeightCalc(),
      }}
    >
      {isRunningInDevelopment() ? (
        <>
          <Grid
            container
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
          >
            <Tabs value={value} onChange={handleChange} aria-label="view tabs">
              {TAB_VALUES.map((value) => (
                <StyledTab
                  value={value}
                  label={value}
                  key={value}
                  {...a11yProps(value)}
                />
              ))}
            </Tabs>
          </Grid>

          <Box
            sx={{
              height: 'calc(100% - 48px)',
            }}
          >
            <TabPanel value={value} label={value}>
              <Outlet />
            </TabPanel>
          </Box>
        </>
      ) : (
        <Outlet />
      )}
    </Box>
  );
}

export default ViewTabs;
