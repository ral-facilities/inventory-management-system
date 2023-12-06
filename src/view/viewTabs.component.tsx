import React from 'react';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { TabValue } from '../app.types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Catalogue from '../catalogue/catalogue.component';
import Systems from '../systems/systems.component';
import Manufacturer from '../manufacturer/manufacturer.component';
import CatalogueItemsLandingPage from '../catalogue/items/catalogueItemsLandingPage.component';

export const paths = {
  home: '/',
  catalogue: '/catalogue/*',
  systems: '/systems/*',
  manufacturer: '/manufacturer',
  catalogueItems: '/catalogue/items/:id',
};

interface TabPanelProps {
  children?: React.ReactNode;
  value: TabValue;
  label: TabValue;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, label, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== label}
      id={`${label}-tabpanel`}
      aria-labelledby={`${label}-tab`}
      {...other}
    >
      {value === label && <Box>{children}</Box>}
    </div>
  );
}
function a11yProps(label: TabValue) {
  return {
    id: `${label}-tab`,
    'aria-controls': `${label}-tabpanel`,
  };
}

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.pxToRem(16),
}));

function ViewTabs() {
  const [value, setValue] = React.useState<TabValue>('Catalogue');
  const navigate = useNavigate();
  const location = useLocation();
  React.useEffect(() => {
    const prefixIndex = location.pathname.indexOf(paths.home);
    let tabValue =
      prefixIndex !== -1
        ? location.pathname
            .substring(prefixIndex + paths.home.length)
            .split('/')[0]
        : '';

    if (tabValue !== value && tabValue !== '') {
      tabValue = tabValue.charAt(0).toUpperCase() + tabValue.slice(1);
      setValue(tabValue as TabValue);
    }
  }, [location.pathname, value]);

  React.useEffect(() => {
    if (location.pathname === '/') {
      navigate('/catalogue');
    }
  }, [location.pathname, navigate]);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
    navigate(`/${newValue.toLowerCase()}`);
  };

  const routing = (
    <Routes location={location}>
      <Route path="/" element={<Catalogue />}></Route>
      <Route path={paths.catalogue} element={<Catalogue />}></Route>
      <Route
        path={paths.catalogueItems}
        element={<CatalogueItemsLandingPage />}
      ></Route>
      <Route path={paths.systems} element={<Systems />}></Route>
      <Route path={paths.manufacturer} element={<Manufacturer />}></Route>
    </Routes>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {process.env.NODE_ENV !== 'production' ? (
        <Box>
          <Tabs value={value} onChange={handleChange} aria-label="view tabs">
            <StyledTab
              value="Catalogue"
              label="Catalogue"
              {...a11yProps('Catalogue')}
            />
            <StyledTab
              value="Systems"
              label="Systems"
              {...a11yProps('Systems')}
            />
            <StyledTab
              value="Manufacturer"
              label="Manufacturer"
              {...a11yProps('Manufacturer')}
            />
          </Tabs>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <TabPanel value={value} label={value}>
              {routing}
            </TabPanel>
          </Box>
        </Box>
      ) : (
        routing
      )}
    </Box>
  );
}

export default ViewTabs;
