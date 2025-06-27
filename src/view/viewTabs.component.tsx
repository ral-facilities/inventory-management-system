import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TAB_VALUES, TabValue } from '../app.types';
import { a11yProps, StyledTab } from '../common/tab/tab.utils';
import TabPanel from '../common/tab/tabPanel.component';
import paths from '../paths';
import { getSciGatewayPageHeightCalc, isRunningInDevelopment } from '../utils';

function ViewTabs() {
  const [value, setValue] = React.useState<TabValue | false>('Catalogue');
  const navigate = useNavigate();
  const location = useLocation();

  // The useEffect below is only active when it is in not production
  // because that is when the tabs are visible
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      const prefixIndex = location.pathname.indexOf(paths.root);
      let tabValue =
        prefixIndex !== -1
          ? location.pathname
              .substring(prefixIndex + paths.root.length)
              .split('/')[0]
          : '';

      if (tabValue !== value && tabValue !== '') {
        tabValue = tabValue.charAt(0).toUpperCase() + tabValue.slice(1);
        tabValue =
          tabValue === 'Admin-ims' ? tabValue.replace('-ims', '') : tabValue;
        if (TAB_VALUES.includes(tabValue as TabValue))
          setValue(tabValue as TabValue);
        else setValue(false);
      } else setValue(false);
    }
  }, [location.pathname, value]);

  const handleChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
    navigate(
      `/${newValue === 'Admin' ? newValue.toLowerCase() + '-ims' : newValue.toLowerCase()}`
    );
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
