import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';
import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { TabValue } from '../app.types';
import Catalogue from '../catalogue/catalogue.component';
import CatalogueItemsLandingPage from '../catalogue/items/catalogueItemsLandingPage.component';
import Items from '../items/items.component';
import ItemsLandingPage from '../items/itemsLandingPage.component';
import Manufacturer from '../manufacturer/manufacturer.component';
import ManufacturerLandingPage from '../manufacturer/manufacturerLandingPage.component';
import Systems from '../systems/systems.component';
import { getSciGatewayPageHeightCalc, isRunningInDevelopment } from '../utils';
import { HomePage } from '../homePage/homePage.component';

export const paths = {
  root: '/',
  homepage: '/ims',
  catalogue: '/catalogue/*',
  systems: '/systems/*',
  manufacturers: '/manufacturer',
  manufacturer: '/manufacturer/:manufacturer_id',
  catalogueItem: '/catalogue/item/:catalogue_item_id',
  items: '/catalogue/item/:catalogue_item_id/items',
  item: '/catalogue/item/:catalogue_item_id/items/:item_id',
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
      style={{ height: '100%' }}
      {...other}
    >
      {value === label && <Box height="100%">{children}</Box>}
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

  // The useEffect below is only active when it is in not production
  // because that is when the tabs are visible
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const prefixIndex = location.pathname.indexOf(paths.root);
      let tabValue =
        prefixIndex !== -1
          ? location.pathname
              .substring(prefixIndex + paths.root.length)
              .split('/')[0]
          : '';

      if (tabValue !== value && tabValue !== '') {
        tabValue = tabValue.charAt(0).toUpperCase() + tabValue.slice(1);
        setValue(tabValue as TabValue);
      }
    }
  }, [location.pathname, value]);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setValue(newValue);
    navigate(`/${newValue.toLowerCase()}`);
  };

  const routing = (
    <Routes location={location}>
      <Route
        path={paths.root}
        element={<HomePage pluginHost={'http://localhost:5001'} />}
      />
      <Route
        path={paths.homepage}
        element={<HomePage pluginHost={'http://localhost:5001'} />}
      />
      <Route path={paths.catalogue} element={<Catalogue />} />
      <Route
        path={paths.catalogueItem}
        element={<CatalogueItemsLandingPage />}
      />
      <Route path={paths.systems} element={<Systems />} />
      <Route path={paths.manufacturers} element={<Manufacturer />} />
      <Route path={paths.manufacturer} element={<ManufacturerLandingPage />} />
      <Route path={paths.items} element={<Items />} />
      <Route path={paths.item} element={<ItemsLandingPage />} />
    </Routes>
  );

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
              height: 'calc(100% - 48px)',
            }}
          >
            <TabPanel value={value} label={value}>
              {routing}
            </TabPanel>
          </Box>
        </>
      ) : (
        routing
      )}
    </Box>
  );
}

export default ViewTabs;
